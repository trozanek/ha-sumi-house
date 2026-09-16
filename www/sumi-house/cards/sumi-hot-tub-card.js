/* sumi-hot-tub-card — one Lovelace card for the whole hot tub.
 *
 * Spec: docs/cards/hot-tub.md · Sibling: sumi-sauna-card (docs/cards/sauna.md §2)
 * Requires packages/sumi_hot_tub.yaml and packages/sumi_common.yaml (shared tariff).
 * Register as a dashboard resource:
 *   /local/sumi-house/cards/sumi-hot-tub-card.js   (type: module)
 *
 * Shadow DOM. Reads state, calls actions, holds no state of its own beyond a drag or
 * an in-progress schedule edit / armed service reset. Gauge geometry, drag/debounce/
 * optimistic-hold and the light swatch strip are the same implementation as
 * sumi-sauna-card, imported from sumi-vessel-shared.js rather than forked (spec §5.2,
 * §7, §12).
 */

import {
  GEOM, clamp, arcPath, pt, angleToTemp, tempToAngle, VesselGauge,
  merge, fmtNumber, svgIcon as sharedSvgIcon, VESSEL_BASE_STYLE,
  COLOR_MODES, swatchButtonsHtml, paintSwatches,
} from "./sumi-vessel-shared.js";

const VERSION = "0.2.0";
const CARD = "sumi-hot-tub-card";

const ACCENTS = {
  oak: "var(--sumi-oak, var(--accent-color, #C89F6E))",
  mizu: "var(--sumi-mizu, var(--info-color, #7E93A0))",
  moss: "var(--sumi-moss, var(--success-color, #8B9678))",
  copper: "var(--sumi-copper, var(--primary-color, #C0754A))",
};

const DEFAULTS = {
  name: "Hot tub",
  kanji: "湯",
  accent: "mizu",
  gauge: "ring",
  temperature: { min: null, max: null, step: 0.5, step_button: 0.5, commit_delay: 400, optimistic_hold: 2000 },
  switches: {},
  light: null,
  schedule: { enable: null, scheduled_temperature: null, slots: [] },
  service: { confirm: true, confirm_seconds: 3, items: [] },
  cost: { currency: "zł" },
};

const ICONS = { check: "M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" };
const svgIcon = (name) => sharedSvgIcon(ICONS, name);

// "Heater on and still more than 0.3° below target" — the package's
// binary_sensor.hot_tub_heating is authoritative (spec §3.1: the climate entity's
// own hvac_mode is deliberately ignored for on/off); this is only the local
// fallback used before a restart has picked the package up.
const HEATING_MARGIN = 0.3;

// Domain → the service that "does the reset" for that kind of entity (spec §9.2).
const RESET_SERVICE = {
  button: ["button", "press"],
  input_button: ["input_button", "press"],
  switch: ["switch", "turn_on"],
  input_boolean: ["input_boolean", "turn_on"],
  script: ["script", "turn_on"],
  scene: ["scene", "turn_on"],
};

const STYLE = VESSEL_BASE_STYLE + `
  /* hot-tub-specific additions: the daily schedule stripline (with its inline slot
     editor) and the service-counter line. Both are full-width strips below .vbody,
     the same position as the sauna's now-playing strip (spec §11). */
  .strip-full { padding: 8px 0 2px; border-top: 1px solid var(--seam); }
  .stripline { display: flex; flex-wrap: wrap; gap: 4px 16px; transition: opacity var(--base) var(--ease); }
  .stripline.off { opacity: .45; }
  .slot { font-family: var(--mono); font-size: 11px; color: var(--faint); white-space: nowrap; transition: color var(--fast) var(--ease); }
  .slot:hover { color: var(--washi); }
  .slot.cur { color: var(--accent); }
  .slot.editing { display: inline-flex; align-items: center; gap: 6px; }
  .slot .stime {
    font: inherit; font-family: var(--mono); font-size: 11px; color: var(--washi); background: var(--char);
    border: 1px solid var(--seam); border-radius: 3px; padding: 3px 5px; width: 78px; color-scheme: dark;
  }
  .slot .sstep { display: inline-flex; align-items: center; gap: 4px; }
  .slot .sval { display: inline-block; min-width: 40px; text-align: center; font-variant-numeric: tabular-nums; }
  .gbtn.sm { width: 22px; height: 22px; font-size: 13px; border-radius: 3px; }
  .sconfirm { width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; color: var(--stone); border: 1px solid var(--seam); transition: color var(--fast) var(--ease), border-color var(--fast) var(--ease), background-color var(--fast) var(--ease); }
  .sconfirm:hover { color: var(--copper-hi); border-color: var(--copper-lo); background: color-mix(in oklab, var(--copper) 10%, transparent); }
  .sconfirm svg { width: 13px; height: 13px; fill: currentColor; }
  .manual { font-family: var(--mono); font-size: 10px; color: var(--stone); margin: 6px 0 0; letter-spacing: .02em; }

  .svcline { display: flex; flex-wrap: wrap; gap: 6px 22px; }
  .svc-item { font-family: var(--mono); font-size: 12px; color: var(--washi); transition: color var(--fast) var(--ease); }
  .svc-item .l { font-size: 9px; letter-spacing: .16em; text-transform: uppercase; color: var(--faint); margin-right: 7px; }
  .svc-item:hover { color: var(--copper-hi); }
  .svc-item .v.soon { color: var(--caution); }
  .svc-item .v.overdue { color: var(--alert); }
  .svc-item .v.unavailable { color: var(--faint); }
  .svc-item.armed { color: var(--caution); }
  .svc-item.armed .v, .svc-item.armed .l { color: var(--caution); }
`;

// ── interval grammar (spec §9.1): the sensor is a day count with no anchor date,
// so months here are 60 fixed days, not calendar months — unlike the schedule's
// own §8.3 slot-picking, which does use real dates. ──────────────────────────
const EVERY_RE = /^(\d+)\s*(mo|d|w)$/i;
function everyDays(every) {
  const m = EVERY_RE.exec(String(every).trim());
  if (!m) return null;
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  return unit === "d" ? n : unit === "w" ? n * 7 : n * 60;
}

/** Remaining-days state for one service counter (spec §9.1, §9.4). `sensorState`
 *  is the raw entity state (a "days since" number that counts up). */
function dueInfo(sensorState, every) {
  const days = everyDays(every);
  const since = Number(sensorState);
  if (sensorState === undefined || sensorState === "unknown" || sensorState === "unavailable" || !Number.isFinite(since) || days === null) {
    return { state: "unavailable", text: "—" };
  }
  const remaining = Math.round(days - since);
  const thresholdDays = Math.max(1, Math.round(days * 0.2));
  if (remaining <= 0) return { state: "overdue", text: `overdue ${Math.abs(remaining)} d` };
  if (remaining <= thresholdDays) return { state: "soon", text: `${remaining} d` };
  return { state: "normal", text: `${remaining} d` };
}

// ── the daily schedule: local time-of-day, "HH:MM:SS" strings sort correctly as
// text, so the same string-compare the package's Jinja template uses works here ──
function hmsNow() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
function hmToLabel(hms) {
  return typeof hms === "string" && hms.length >= 5 ? hms.slice(0, 5) : "--:--";
}

/** Which configured slot (by its position in `slots`) is in force right now — the
 *  same picking rule as the package's `sensor.hot_tub_scheduled_temperature` Jinja
 *  template (last slot at-or-before now; before the day's first slot, the previous
 *  day's last slot). Recomputed here only for the UI highlight and "resumes at"
 *  note — the temperature itself always comes from that sensor, not from this. */
function currentSlotIndex(slots, times, nowHms) {
  let pastIdx = -1, pastAt = null;
  let lastIdx = -1, lastAt = null;
  slots.forEach((_, i) => {
    const at = times[i];
    if (!at) return;
    if (at <= nowHms && (pastAt === null || at >= pastAt)) { pastAt = at; pastIdx = i; }
    if (lastAt === null || at >= lastAt) { lastAt = at; lastIdx = i; }
  });
  return pastIdx >= 0 ? pastIdx : lastIdx;
}

function nextSlotLabel(times, nowHms) {
  const valid = times.filter(Boolean).sort();
  if (!valid.length) return null;
  return hmToLabel(valid.find((t) => t > nowHms) || valid[0]);
}

class SumiHotTubCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement(`${CARD}-editor`);
  }

  static getStubConfig(hass) {
    const climate = Object.keys(hass?.states || {}).find((id) => id.startsWith("climate.") && /tub|jacuzzi|spa/i.test(id))
      || Object.keys(hass?.states || {}).find((id) => id.startsWith("climate."))
      || "climate.hot_tub";
    return { entity: climate };
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._built = false;
    this._gauge = null;
    this._tick = null;
    this._editingSlot = null;      // index into config.schedule.slots, or null
    this._editDraft = null;        // { time: "HH:MM", temp: number } while editing
    this._stripRenderedFor = undefined; // last _editingSlot the strip DOM was built for
    this._armed = { key: null, timer: null }; // service item awaiting its confirm tap
    this._warnedRange = false;
  }

  setConfig(config) {
    if (!config || !config.entity) throw new Error(`${CARD}: \`entity\` (a climate entity) is required`);
    this._config = merge(DEFAULTS, config);
    if (!ACCENTS[this._config.accent]) this._config.accent = "mizu";
    if (!GEOM[this._config.gauge]) this._config.gauge = "ring";
    this._gauge = new VesselGauge({
      range: () => this._range(),
      entityValue: () => {
        const t = Number(this._attr(this._config.entity, "temperature", NaN));
        return Number.isFinite(t) ? t : this._range().min;
      },
      onCommit: (t) => this._call("climate", "set_temperature", { entity_id: this._config.entity, temperature: t }),
      onPaint: () => this._paintGauge(),
      commitDelay: this._config.temperature.commit_delay,
      holdMs: this._config.temperature.optimistic_hold,
    });
    this._built = false;
    if (this._hass) this._render();
  }

  set hass(hass) { this._hass = hass; this._render(); }
  get hass() { return this._hass; }

  getCardSize() { return 7; }
  getGridOptions() { return { columns: 12, min_columns: 6, rows: "auto" }; }

  connectedCallback() { this._startTick(); }
  disconnectedCallback() { this._stopTick(); this._closeEditor(false); this._disarm(); }

  // ── helpers ──────────────────────────────────────────────────────────────
  _st(id) { return id ? this._hass?.states?.[id] : undefined; }
  _attr(id, name, fallback) { const v = this._st(id)?.attributes?.[name]; return v === undefined ? fallback : v; }
  _lang() { return this._hass?.locale?.language || this._hass?.language; }
  _call(domain, service, data) { return this._hass.callService(domain, service, data); }

  _range() {
    const c = this._config.temperature;
    const e = this._config.entity;
    const devMin = Number(this._attr(e, "min_temp", NaN));
    const devMax = Number(this._attr(e, "max_temp", NaN));
    const min = c.min ?? (Number.isFinite(devMin) ? devMin : 20);
    const max = c.max ?? (Number.isFinite(devMax) ? devMax : 40);
    const step = c.step ?? 0.5;
    if (!this._warnedRange && ((Number.isFinite(devMin) && min < devMin) || (Number.isFinite(devMax) && max > devMax))) {
      console.warn(`${CARD}: configured range ${min}–${max} is wider than the device's ${devMin}–${devMax}; writes are clamped to the device`);
      this._warnedRange = true;
    }
    return { min, max, step, devMin, devMax };
  }

  _heaterEntity() { return this._config.switches.heater?.entity; }
  _heaterOn() { const e = this._heaterEntity(); return Boolean(e) && this._st(e)?.state === "on"; }
  _pumpOn() { const e = this._config.switches.pump?.entity; return Boolean(e) && this._st(e)?.state === "on"; }
  _bubblesOn() { const e = this._config.switches.bubbles?.entity; return Boolean(e) && this._st(e)?.state === "on"; }

  /** Climbing toward a setpoint, not merely "heater on" — spec §3.2 / package
   *  binary_sensor.hot_tub_heating. Falls back to a local 0.3° estimate so the
   *  card still behaves sensibly before a restart has picked up the package. */
  _isHeating() {
    if (!this._heaterOn()) return false;
    const sensor = this._st("binary_sensor.hot_tub_heating");
    if (sensor && sensor.state !== "unavailable" && sensor.state !== "unknown") return sensor.state === "on";
    const cur = Number(this._attr(this._config.entity, "current_temperature", NaN));
    const tgt = Number(this._attr(this._config.entity, "temperature", NaN));
    return Number.isFinite(cur) && Number.isFinite(tgt) && cur < tgt - HEATING_MARGIN;
  }

  // ── build ────────────────────────────────────────────────────────────────
  _build() {
    const c = this._config;
    const g = GEOM[c.gauge];
    const switches = c.switches || {};
    const hasPump = Boolean(switches.pump?.entity);
    const hasBubbles = Boolean(switches.bubbles?.entity);
    const hasLight = Boolean(c.light?.entity);
    const slots = c.schedule.slots || [];
    const items = c.service.items || [];

    const svcHtml = items.map((it) => `<button class="svc-item" data-key="${it.key}"><span class="l">${it.label.toUpperCase()}</span><b class="v" data-key="${it.key}">–</b></button>`).join("");

    this.shadowRoot.innerHTML = `
      <style>${STYLE}</style>
      <ha-card style="--accent:${ACCENTS[c.accent]}">
        <i class="accent"></i>
        <div class="vhead">
          <div class="ttl"><span class="k">${c.kanji}</span><span class="name">${c.name}</span></div>
          <span class="pill off" id="pill">Off</span>
        </div>
        <div class="vbody">
          <div class="vleft">
            <div class="gauge" id="gauge" role="slider" aria-label="Target temperature" tabindex="0">
              <svg viewBox="0 0 120 120">
                <path class="gtrack" d="${arcPath(g.start, g.start + g.sweep)}"/>
                <path class="gfill" id="gfill" d="${arcPath(g.start, g.start + g.sweep)}" pathLength="1000" stroke-dasharray="0 1000"/>
                <circle class="ghandle" id="ghandle" r="4" cx="${pt(g.start).x}" cy="${pt(g.start).y}"/>
              </svg>
              <div class="gcenter">
                <div class="gnum"><span id="cur">–</span><small>°C</small></div>
                <div class="gtgt">→ <b id="tgt">–</b>°</div>
              </div>
            </div>
            <div class="gsteps">
              <button class="gbtn" id="dec" aria-label="lower target">−</button>
              <button class="gbtn" id="inc" aria-label="raise target">+</button>
            </div>
            <div class="geta" id="geta"></div>
          </div>
          <div class="vright">
            <div class="vrow">
              <div class="nm">${switches.heater?.name || "Heater"}<em id="heat-sub"></em></div>
              <button class="tg" id="heat-tg" role="switch" aria-label="heater"><i></i></button>
            </div>
            <div class="vrow" id="pb-row" ${hasPump || hasBubbles ? "" : "hidden"}>
              <div class="nm">Pump &amp; bubbles<em id="pb-sub"></em></div>
              <div class="chiprow">
                <button class="mchip" id="pump-chip" ${hasPump ? "" : "hidden"}>${switches.pump?.name || "Pump"}</button>
                <button class="mchip" id="bubbles-chip" ${hasBubbles ? "" : "hidden"}>${switches.bubbles?.name || "Bubbles"}</button>
              </div>
            </div>
            <div class="vrow" id="schedule-row" ${c.schedule.enable ? "" : "hidden"}>
              <div class="nm">Schedule<em>${slots.length} setpoint${slots.length === 1 ? "" : "s"} · daily</em></div>
              <button class="tg" id="sched-tg" role="switch" aria-label="schedule"><i></i></button>
            </div>
            <div class="vrow" id="light-row" ${hasLight ? "" : "hidden"}>
              <div class="nm">${c.light?.name || "Light"}<em id="light-sub"></em></div>
              <button class="tg" id="light-tg" role="switch" aria-label="light"><i></i></button>
            </div>
            <div class="swrow" id="swrow" hidden>${swatchButtonsHtml(c.light?.colors)}</div>
          </div>
        </div>
        <div class="strip-full" id="schedule-block" ${c.schedule.enable && slots.length ? "" : "hidden"}>
          <div class="stripline" id="stripline"></div>
          <p class="manual" id="manual" hidden></p>
        </div>
        <div class="strip-full svcline" id="svcline" ${items.length ? "" : "hidden"}>${svcHtml}</div>
        <div class="cost" id="cost" hidden>
          <div class="c"><div class="l" id="cost-ml"></div><div class="n"><span id="cost-m"></span></div></div>
          <div class="c"><div class="l">Year to date</div><div class="n"><span id="cost-y"></span></div></div>
        </div>
      </ha-card>`;

    const $ = (s) => this.shadowRoot.querySelector(s);
    this._el = {
      card: $("ha-card"), pill: $("#pill"), gauge: $("#gauge"), gfill: $("#gfill"), ghandle: $("#ghandle"),
      cur: $("#cur"), tgt: $("#tgt"), geta: $("#geta"),
      heatTg: $("#heat-tg"), heatSub: $("#heat-sub"),
      pbRow: $("#pb-row"), pbSub: $("#pb-sub"), pumpChip: $("#pump-chip"), bubblesChip: $("#bubbles-chip"),
      scheduleRow: $("#schedule-row"), schedTg: $("#sched-tg"),
      lightRow: $("#light-row"), lightTg: $("#light-tg"), lightSub: $("#light-sub"), swrow: $("#swrow"),
      scheduleBlock: $("#schedule-block"), stripline: $("#stripline"), manual: $("#manual"),
      svcline: $("#svcline"),
      cost: $("#cost"), costMl: $("#cost-ml"), costM: $("#cost-m"), costY: $("#cost-y"),
    };
    this._bind();
    this._built = true;
  }

  _bind() {
    const e = this._el;
    const c = this._config;

    let dragPointerId = null;
    e.gauge.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      e.gauge.setPointerCapture(ev.pointerId);
      e.gauge.classList.add("dragging");
      dragPointerId = ev.pointerId;
      this._gauge.startDrag();
      this._gauge.set(angleToTemp(e.gauge, ev.clientX, ev.clientY, c.gauge, this._range()));
    });
    e.gauge.addEventListener("pointermove", (ev) => {
      if (dragPointerId !== ev.pointerId) return;
      this._gauge.set(angleToTemp(e.gauge, ev.clientX, ev.clientY, c.gauge, this._range()));
    });
    const end = (ev) => {
      if (dragPointerId !== ev.pointerId) return;
      dragPointerId = null;
      e.gauge.classList.remove("dragging");
      this._gauge.endDrag();
    };
    e.gauge.addEventListener("pointerup", end);
    e.gauge.addEventListener("pointercancel", end);
    e.gauge.addEventListener("keydown", (ev) => {
      const { step } = this._range();
      if (ev.key === "ArrowRight" || ev.key === "ArrowUp") { this._gauge.set(this._gauge.value() + step); ev.preventDefault(); }
      if (ev.key === "ArrowLeft" || ev.key === "ArrowDown") { this._gauge.set(this._gauge.value() - step); ev.preventDefault(); }
    });
    this.shadowRoot.getElementById("dec").addEventListener("click", () => this._gauge.set(this._gauge.value() - c.temperature.step_button));
    this.shadowRoot.getElementById("inc").addEventListener("click", () => this._gauge.set(this._gauge.value() + c.temperature.step_button));

    e.heatTg.addEventListener("click", () => {
      const entity = this._heaterEntity(); if (!entity) return;
      this._call("switch", "toggle", { entity_id: entity });
    });
    e.pumpChip.addEventListener("click", () => this._call("switch", "toggle", { entity_id: c.switches.pump.entity }));
    e.bubblesChip.addEventListener("click", () => this._call("switch", "toggle", { entity_id: c.switches.bubbles.entity }));
    e.schedTg.addEventListener("click", () => {
      if (!c.schedule.enable) return;
      const on = this._st(c.schedule.enable)?.state === "on";
      this._call("input_boolean", on ? "turn_off" : "turn_on", { entity_id: c.schedule.enable });
    });
    e.lightTg.addEventListener("click", () => c.light?.entity && this._call("light", "toggle", { entity_id: c.light.entity }));
    e.swrow.addEventListener("click", (ev) => {
      const b = ev.target.closest(".sw"); if (!b || b.disabled || !c.light?.entity) return;
      const s = c.light.colors[Number(b.dataset.i)];
      const data = { entity_id: c.light.entity };
      if (s.effect) data.effect = s.effect; else data.rgb_color = s.rgb;
      this._call("light", "turn_on", data);
    });

    e.stripline.addEventListener("click", (ev) => {
      const btn = ev.target.closest(".slot:not(.editing)"); if (!btn) return;
      this._openEditor(Number(btn.dataset.i));
    });

    e.svcline.addEventListener("click", (ev) => {
      const btn = ev.target.closest(".svc-item"); if (!btn) return;
      this._tapService(btn.dataset.key);
    });
  }

  // ── schedule slot editor (spec §8.2) ────────────────────────────────────
  _openEditor(i) {
    const slot = this._config.schedule.slots[i]; if (!slot) return;
    const timeState = this._st(slot.time)?.state;
    const tempState = Number(this._st(slot.temp)?.state);
    this._editDraft = {
      time: typeof timeState === "string" ? timeState.slice(0, 5) : "00:00",
      temp: Number.isFinite(tempState) ? tempState : this._range().min,
    };
    this._editingSlot = i;
    this._outsideHandler = (ev) => {
      const el = this.shadowRoot.querySelector(`.slot.editing`);
      if (el && !el.contains(ev.composedPath()[0])) this._closeEditor(false);
    };
    document.addEventListener("pointerdown", this._outsideHandler, true);
    this._update();
  }

  _closeEditor(save) {
    if (this._editingSlot === null) return;
    const i = this._editingSlot;
    const slot = this._config.schedule.slots[i];
    if (save && slot && this._editDraft) {
      const [hh, mm] = this._editDraft.time.split(":");
      this._call("input_datetime", "set_datetime", { entity_id: slot.time, time: `${hh}:${mm}:00` });
      this._call("input_number", "set_value", { entity_id: slot.temp, value: this._editDraft.temp });
    }
    if (this._outsideHandler) { document.removeEventListener("pointerdown", this._outsideHandler, true); this._outsideHandler = null; }
    this._editingSlot = null;
    this._editDraft = null;
    this._update();
  }

  _renderStripline() {
    const e = this._el;
    const slots = this._config.schedule.slots || [];
    if (!slots.length) return;
    const times = slots.map((s) => this._st(s.time)?.state);
    const nowHms = hmsNow();
    const order = slots.map((_, i) => i).sort((a, b) => (times[a] || "99").localeCompare(times[b] || "99"));
    const curIdx = currentSlotIndex(slots, times, nowHms);

    if (this._stripRenderedFor !== this._editingSlot) {
      e.stripline.innerHTML = order.map((i) => {
        if (i === this._editingSlot) {
          const d = this._editDraft;
          return `
            <span class="slot editing" data-i="${i}">
              <input type="time" class="stime" value="${d.time}" step="60">
              <span class="sstep">
                <button class="gbtn sm" data-step="-1" type="button">−</button>
                <span class="sval">${d.temp.toFixed(1)}°</span>
                <button class="gbtn sm" data-step="1" type="button">+</button>
              </span>
              <button class="sconfirm" data-confirm type="button" aria-label="confirm">${svgIcon("check")}</button>
            </span>`;
        }
        const temp = Number(this._st(slots[i].temp)?.state);
        return `<button class="slot${i === curIdx ? " cur" : ""}" data-i="${i}">${hmToLabel(times[i])} · ${Number.isFinite(temp) ? temp.toFixed(1) : "–"}°</button>`;
      }).join("");
      if (this._editingSlot !== null) {
        const editEl = e.stripline.querySelector(".slot.editing");
        editEl.querySelector(".stime").addEventListener("change", (ev) => { this._editDraft.time = ev.target.value; });
        editEl.querySelector(".stime").addEventListener("keydown", (ev) => { if (ev.key === "Escape") this._closeEditor(false); });
        editEl.querySelectorAll("[data-step]").forEach((b) => b.addEventListener("click", () => {
          const { min, max } = this._range();
          this._editDraft.temp = clamp(this._editDraft.temp + Number(b.dataset.step) * this._config.temperature.step_button, min, max);
          editEl.querySelector(".sval").textContent = `${this._editDraft.temp.toFixed(1)}°`;
        }));
        editEl.querySelector("[data-confirm]").addEventListener("click", () => this._closeEditor(true));
      }
      this._stripRenderedFor = this._editingSlot;
    } else {
      e.stripline.querySelectorAll(".slot:not(.editing)").forEach((btn) => {
        btn.classList.toggle("cur", Number(btn.dataset.i) === curIdx);
      });
    }
    e.stripline.classList.toggle("off", this._st(this._config.schedule.enable)?.state !== "on");

    // manual override note (spec §8.4)
    const sched = this._config.schedule;
    const schedOn = sched.enable ? this._st(sched.enable)?.state === "on" : false;
    const scheduledTemp = sched.scheduled_temperature ? Number(this._st(sched.scheduled_temperature)?.state) : NaN;
    const target = Number(this._attr(this._config.entity, "temperature", NaN));
    const manual = schedOn && Number.isFinite(scheduledTemp) && Number.isFinite(target) && Math.abs(target - scheduledTemp) > 0.05;
    e.manual.hidden = !manual || this._editingSlot !== null;
    if (manual) {
      const resumes = nextSlotLabel(times, nowHms);
      e.manual.textContent = `Manual ${target.toFixed(1)}°${resumes ? ` · schedule resumes ${resumes}` : ""}`;
    }
  }

  // ── service counters: arm on first tap, fire the reset on the second, revert
  //    on its own if the second tap doesn't come (spec §9.2, §9.3) ───────────
  _renderService() {
    for (const it of this._config.service.items || []) {
      const sensorState = this._st(it.sensor)?.state;
      const info = dueInfo(sensorState, it.every);
      const el = this.shadowRoot.querySelector(`.v[data-key="${it.key}"]`);
      const row = this.shadowRoot.querySelector(`.svc-item[data-key="${it.key}"]`);
      if (!el || !row) continue;
      const armed = this._armed.key === it.key;
      row.classList.toggle("armed", armed);
      el.textContent = armed ? "tap again" : info.text;
      el.className = `v ${armed ? "" : info.state === "normal" ? "" : info.state}`.trim();
    }
  }

  _tapService(key) {
    const it = (this._config.service.items || []).find((x) => x.key === key); if (!it) return;
    if (this._config.service.confirm === false) { this._fireReset(it); return; }
    if (this._armed.key === key) {
      clearTimeout(this._armed.timer);
      this._armed = { key: null, timer: null };
      this._fireReset(it);
      return;
    }
    this._disarm();
    this._armed.key = key;
    this._armed.timer = setTimeout(() => { this._armed = { key: null, timer: null }; this._renderService(); }, (this._config.service.confirm_seconds || 3) * 1000);
    this._renderService();
  }

  _disarm() {
    clearTimeout(this._armed.timer);
    this._armed = { key: null, timer: null };
  }

  _fireReset(it) {
    const domain = String(it.reset).split(".", 1)[0];
    const pair = RESET_SERVICE[domain];
    if (!pair) { console.warn(`${CARD}: don't know how to reset "${it.reset}" (unrecognised domain "${domain}")`); return; }
    this._call(pair[0], pair[1], { entity_id: it.reset });
    this._renderService();
  }

  // ── tick: re-render the schedule highlight and service countdowns as time
  //    passes even without a hass push (they depend on Date.now(), not on any
  //    entity changing) ─────────────────────────────────────────────────────
  _startTick() { this._stopTick(); this._tick = setInterval(() => { if (this._built) { this._renderStripline(); this._renderService(); } }, 30000); }
  _stopTick() { clearInterval(this._tick); this._tick = null; }

  // ── render ───────────────────────────────────────────────────────────────
  _render() {
    if (!this._hass || !this._config) return;
    if (!this._st(this._config.entity)) {
      this.shadowRoot.innerHTML = `<style>${STYLE}</style><ha-card><div class="warning">Entity not found: ${this._config.entity}</div></ha-card>`;
      this._built = false;
      return;
    }
    if (!this._built) this._build();
    this._update();
  }

  _update() {
    if (!this._built) return;
    const c = this._config, e = this._el, lang = this._lang();

    this._gauge.reconcile();

    const heaterOn = this._heaterOn();
    const heating = this._isHeating();
    const bubbles = this._bubblesOn();

    // §5.3: seam only for heating or bubbles, never for the pump, a bare "on" or
    // the light; the quiet frame trace follows the heater — it runs almost always,
    // which is exactly what that tier is for.
    e.card.classList.toggle("heating", heating);
    e.card.style.setProperty("--sumi-active", heaterOn ? 1 : 0);
    e.card.style.setProperty("--sumi-seam-opacity", heating || bubbles ? 1 : 0);

    let pillText = "Off", pillCls = "off";
    if (heating) { pillText = "Heating"; pillCls = "live"; }
    else if (heaterOn) { pillText = "Holding"; pillCls = "ok"; }
    e.pill.textContent = pillText;
    e.pill.className = `pill ${pillCls}`;
    e.geta.textContent = heaterOn ? (heating ? "HEATING" : "AT TEMP") : "OFF";

    this._paintGauge();

    // heater row (spec §6)
    const heaterEntity = this._heaterEntity();
    e.heatTg.disabled = !heaterEntity;
    e.heatTg.classList.toggle("on", heaterOn);
    e.heatTg.setAttribute("aria-checked", heaterOn);
    const cur = Number(this._attr(c.entity, "current_temperature", NaN));
    const tgt = Number(this._attr(c.entity, "temperature", NaN));
    if (!heaterOn) e.heatSub.textContent = heaterEntity ? "Off" : "Not configured";
    else if (heating && Number.isFinite(tgt) && Number.isFinite(cur)) e.heatSub.textContent = `Heating · ${(tgt - cur).toFixed(1)}° to go`;
    else e.heatSub.textContent = `Holding ${Number.isFinite(cur) ? cur.toFixed(1) : "–"}°`;

    // pump & bubbles row — independent toggles, never a mutually-exclusive group
    // (spec §6: this bit the prototype once already)
    const pumpOn = this._pumpOn();
    e.pumpChip.classList.toggle("on", pumpOn);
    e.bubblesChip.classList.toggle("on", bubbles);
    e.pbSub.textContent = bubbles ? "Bubbles" : pumpOn ? "Circulation only" : "Off";

    // schedule
    const hasSchedule = Boolean(c.schedule.enable) && (c.schedule.slots || []).length > 0;
    e.scheduleRow.hidden = !c.schedule.enable;
    e.scheduleBlock.hidden = !hasSchedule;
    if (c.schedule.enable) {
      const schedOn = this._st(c.schedule.enable)?.state === "on";
      e.schedTg.classList.toggle("on", schedOn);
      e.schedTg.setAttribute("aria-checked", schedOn);
    }
    if (hasSchedule) this._renderStripline();
    else e.manual.hidden = true;

    // light (spec §7 — identical rules to the sauna's bench LED)
    const light = c.light?.entity ? this._st(c.light.entity) : null;
    e.lightRow.hidden = !light;
    if (light) {
      const lightOn = light.state === "on";
      e.lightTg.classList.toggle("on", lightOn);
      e.lightTg.setAttribute("aria-checked", lightOn);
      const modes = light.attributes.supported_color_modes || [];
      const hasColor = modes.some((m) => COLOR_MODES.has(m));
      const colors = c.light.colors || [];
      e.swrow.hidden = !hasColor || colors.length === 0;
      const activeName = paintSwatches(e.swrow, colors, light);
      const effect = light.attributes.effect;
      e.lightSub.textContent = !lightOn ? "off" : activeName ? `${activeName} · ${effect && effect !== "None" ? effect.toLowerCase() : "solid"}` : effect && effect !== "None" ? effect.toLowerCase() : `${light.attributes.brightness ? Math.round(light.attributes.brightness / 2.55) + " %" : "on"}`;
    }

    // service counters
    if ((c.service.items || []).length) this._renderService();

    // cost (shared shape with the sauna card)
    const m = c.cost.monthly ? this._st(c.cost.monthly) : null;
    const y = c.cost.yearly ? this._st(c.cost.yearly) : null;
    e.cost.hidden = !m && !y;
    if (m || y) {
      const month = new Date().toLocaleDateString(lang || undefined, { month: "long" });
      e.costMl.textContent = month;
      e.costM.innerHTML = m && m.state !== "unavailable" ? `${fmtNumber(m.state, lang)}<span>${c.cost.currency}</span>` : "–";
      e.costY.innerHTML = y && y.state !== "unavailable" ? `${fmtNumber(y.state, lang)}<span>${c.cost.currency}</span>` : "–";
    }
  }

  _paintGauge() {
    const e = this._el;
    const { min, max } = this._range();
    const cur = Number(this._attr(this._config.entity, "current_temperature", NaN));
    const tgt = this._gauge.value();
    const frac = Number.isFinite(cur) ? clamp((cur - min) / (max - min), 0, 1) : 0;
    e.gfill.setAttribute("stroke-dasharray", `${(frac * 1000).toFixed(1)} 1000`);
    const p = pt(tempToAngle(tgt, this._config.gauge, min, max));
    e.ghandle.setAttribute("cx", p.x.toFixed(2));
    e.ghandle.setAttribute("cy", p.y.toFixed(2));
    e.cur.textContent = Number.isFinite(cur) ? cur.toFixed(1) : "–";
    e.tgt.textContent = tgt.toFixed(1);
    e.gauge.setAttribute("aria-valuemin", min);
    e.gauge.setAttribute("aria-valuemax", max);
    e.gauge.setAttribute("aria-valuenow", tgt);
  }
}

// ── visual editor: the essentials; switches/light/schedule/service/cost stay YAML ──
class SumiHotTubCardEditor extends HTMLElement {
  setConfig(config) { this._config = { ...config }; this._render(); }
  set hass(hass) { this._hass = hass; this._render(); }
  _render() {
    if (!this._hass || !this._config) return;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => ({ entity: "Hot tub climate entity", name: "Name", kanji: "Kanji", accent: "Accent", gauge: "Gauge" }[s.name] || s.name);
      this._form.addEventListener("value-changed", (ev) => {
        this._config = { ...this._config, ...ev.detail.value };
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
      const note = document.createElement("p");
      note.style.cssText = "color: var(--secondary-text-color); font-size: 12px; margin: 8px 0 0;";
      note.textContent = "Switches, light, schedule, service and cost are configured in YAML — see docs/cards/hot-tub.md.";
      this.appendChild(note);
    }
    this._form.hass = this._hass;
    this._form.data = this._config;
    this._form.schema = [
      { name: "entity", required: true, selector: { entity: { domain: "climate" } } },
      { name: "name", selector: { text: {} } },
      { name: "kanji", selector: { text: {} } },
      { name: "accent", selector: { select: { mode: "dropdown", options: Object.keys(ACCENTS).map((v) => ({ value: v, label: v })) } } },
      { name: "gauge", selector: { select: { mode: "dropdown", options: ["ring", "arc"].map((v) => ({ value: v, label: v })) } } },
    ];
  }
}

if (!customElements.get(CARD)) customElements.define(CARD, SumiHotTubCard);
if (!customElements.get(`${CARD}-editor`)) customElements.define(`${CARD}-editor`, SumiHotTubCardEditor);

window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === CARD)) {
  window.customCards.push({
    type: CARD,
    name: "Sumi Hot Tub",
    description: "One card for the whole hot tub: temperature, heater, light, schedule, service, cost.",
    preview: false,
    documentationURL: "https://github.com/trozanek/ha-sumi-house/blob/main/docs/cards/hot-tub.md",
  });
}

console.info(`%c${CARD} %c${VERSION}`, "color:#7E93A0;font-weight:600", "color:#99907F");
