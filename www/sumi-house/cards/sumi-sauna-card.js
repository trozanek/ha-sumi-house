/* sumi-sauna-card — one Lovelace card for the whole sauna.
 *
 * Spec: docs/cards/sauna.md · Prototype: Concepts/sumi-house-mock.html (Wellness tab)
 * Requires the package packages/sumi_sauna.yaml for session timer, heating detection
 * and cost sensors. Register as a dashboard resource:
 *   /local/sumi-house/cards/sumi-sauna-card.js   (type: module)
 *
 * Shadow DOM. Reads state, calls actions, holds no state of its own beyond a drag in
 * progress. Every colour comes from the Sumi House theme tokens with fallbacks to
 * Home Assistant's own variables, so the card renders correctly under any theme.
 *
 * Gauge geometry, drag/debounce and small formatting helpers are shared with
 * sumi-hot-tub-card via sumi-vessel-shared.js rather than duplicated — see that
 * file's header and docs/cards/sauna.md §4.3.
 */

import {
  ACCENTS, GEOM, clamp, arcPath, pt, angleToTemp, tempToAngle, VesselGauge,
  merge, fmtNumber, fmtWhen, svgIcon as sharedSvgIcon, VESSEL_BASE_STYLE,
  COLOR_MODES, swatchButtonsHtml, paintSwatches,
} from "./sumi-vessel-shared.js";

const VERSION = "0.3.0";
const CARD = "sumi-sauna-card";

const DEFAULTS = {
  name: "Sauna",
  kanji: "蒸",
  accent: "oak",
  gauge: "arc",
  heating_sensor: "binary_sensor.sauna_heating",
  temperature: { min: null, max: null, step: null, step_button: 5, commit_delay: 400, optimistic_hold: 2000 },
  session: { select: "input_select.sauna_session_length", timer: "timer.sauna_session" },
  lights: {},
  media: { entity: "media_player.spotifyplus", shuffle: true, speakers: [], playlists: [] },
  cost: { currency: "zł" },
};

const ICONS = {
  prev: "M6 6h2v12H6zm3.5 6 8.5 6V6z",
  next: "M16 6h2v12h-2zm-1.5 6L6 18V6z",
  play: "M8 5v14l11-7z",
  pause: "M6 5h4v14H6zm8 0h4v14h-4z",
};
const svgIcon = (name) => sharedSvgIcon(ICONS, name);

const STYLE = VESSEL_BASE_STYLE + `
  /* sauna-specific additions: the now-playing strip and its playlist/speaker
     selects. Swatches and everything else are the shared vessel CSS above. */
  .strip { display: flex; align-items: center; gap: 10px; margin-top: 9px; padding-top: 9px; border-top: 1px solid var(--seam); }
  .art { width: 34px; height: 34px; flex: none; border-radius: var(--r-chip); border: 1px solid var(--seam); background: linear-gradient(135deg, color-mix(in oklab, var(--copper) 30%, var(--char)), var(--char)); position: relative; overflow: hidden; }
  .art img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .art::after { content: ""; position: absolute; inset: 0; background: radial-gradient(60% 60% at 35% 30%, color-mix(in oklab, var(--copper-hi) 35%, transparent), transparent 70%); pointer-events: none; }
  .mtitle { flex: 1; min-width: 0; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mtitle em { display: block; font-style: normal; font-size: 10px; color: var(--stone); font-family: var(--mono); letter-spacing: .04em; }
  .transport { display: flex; align-items: center; gap: 10px; flex: none; }
  .transport button { width: 24px; height: 24px; display: grid; place-items: center; color: var(--stone); transition: color var(--fast) var(--ease); }
  .transport button:hover { color: var(--washi); }
  .transport button.play { color: var(--copper-hi); }
  .transport svg { width: 18px; height: 18px; fill: currentColor; }
  .vol { display: flex; align-items: center; gap: 6px; flex: none; }
  .vol input { -webkit-appearance: none; appearance: none; width: 64px; height: 2px; border-radius: 1px; outline: none;
    background: linear-gradient(90deg, var(--copper-lo) 0%, var(--accent) var(--v, 30%), var(--seam) var(--v, 30%)); }
  .vol input::-webkit-slider-thumb { -webkit-appearance: none; width: 10px; height: 10px; border-radius: 50%; background: var(--washi); box-shadow: 0 0 0 3px var(--sumi-surface, var(--card-background-color)); cursor: pointer; }
  .vol input::-moz-range-thumb { width: 10px; height: 10px; border: 0; border-radius: 50%; background: var(--washi); }
  .vol .pct { font-family: var(--mono); font-size: 10px; color: var(--stone); width: 30px; text-align: right; font-variant-numeric: tabular-nums; }
  .selects { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
  .sel { position: relative; flex: 1 1 140px; min-width: 0; }
  .sel select {
    width: 100%; appearance: none; -webkit-appearance: none; font: inherit; font-family: var(--mono); font-size: 10px; letter-spacing: .1em; text-transform: uppercase;
    color: var(--stone); background: transparent; border: 1px solid var(--seam); border-radius: 3px; padding: 6px 24px 6px 10px; cursor: pointer; outline: none;
  }
  .sel select:hover, .sel select:focus { color: var(--washi); border-color: var(--copper-lo); }
  .sel select option { background: var(--sumi-surface-raised, var(--card-background-color)); color: var(--washi); }
  .sel::after { content: ""; position: absolute; right: 10px; top: 50%; width: 5px; height: 5px; border-right: 1px solid var(--stone); border-bottom: 1px solid var(--stone); transform: translateY(-70%) rotate(45deg); pointer-events: none; }
`;

// ─────────────────────────────────────────────────────────────────────────────

class SumiSaunaCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement(`${CARD}-editor`);
  }

  static getStubConfig(hass) {
    const climate = Object.keys(hass?.states || {}).find((id) => id.startsWith("climate.") && /sauna/i.test(id))
      || Object.keys(hass?.states || {}).find((id) => id.startsWith("climate."))
      || "climate.sauna";
    return { entity: climate };
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._built = false;
    this._gauge = null;         // VesselGauge, created once `entity` is known (setConfig)
    this._volTimer = null;
    this._tick = null;
    this._speaker = null;
    this._playlist = null;
    this._warnedRange = false;
  }

  setConfig(config) {
    if (!config || !config.entity) throw new Error("sumi-sauna-card: `entity` (a climate entity) is required");
    this._config = merge(DEFAULTS, config);
    if (!ACCENTS[this._config.accent]) this._config.accent = "oak";
    if (!GEOM[this._config.gauge]) this._config.gauge = "arc";
    this._speaker = this._config.media.default_speaker || this._config.media.speakers?.[0]?.id || null;
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

  set hass(hass) {
    this._hass = hass;
    this._render();
  }
  get hass() { return this._hass; }

  getCardSize() { return 6; }
  getGridOptions() { return { columns: 12, min_columns: 6, rows: "auto" }; }

  connectedCallback() { this._startTick(); }
  disconnectedCallback() { this._stopTick(); }

  // ── helpers ────────────────────────────────────────────────────────────────
  _st(id) { return id ? this._hass?.states?.[id] : undefined; }
  _attr(id, name, fallback) { const v = this._st(id)?.attributes?.[name]; return v === undefined ? fallback : v; }
  _lang() { return this._hass?.locale?.language || this._hass?.language; }
  _call(domain, service, data) { return this._hass.callService(domain, service, data); }

  /** Is the element firing right now? Mirrors the native climate entity: `hvac_action`
   *  first (heating / idle / off); the package's binary sensor only when the firmware
   *  does not report it; a last-resort estimate from the temperatures. */
  _isHeating(clim) {
    if (!clim || clim.state !== "heat") return false;
    const action = clim.attributes.hvac_action;
    if (action !== undefined && action !== null) return action === "heating";
    const sensor = this._st(this._config.heating_sensor);
    if (sensor && sensor.state !== "unavailable" && sensor.state !== "unknown") return sensor.state === "on";
    const cur = Number(clim.attributes.current_temperature), tgt = Number(clim.attributes.temperature);
    return Number.isFinite(cur) && Number.isFinite(tgt) && cur < tgt - 1;
  }

  _range() {
    const c = this._config.temperature;
    const e = this._config.entity;
    const devMin = Number(this._attr(e, "min_temp", NaN));
    const devMax = Number(this._attr(e, "max_temp", NaN));
    const min = c.min ?? (Number.isFinite(devMin) ? devMin : 20);
    const max = c.max ?? (Number.isFinite(devMax) ? devMax : 110);
    const step = c.step ?? (Number(this._attr(e, "target_temp_step", 1)) || 1);
    if (!this._warnedRange && ((Number.isFinite(devMin) && min < devMin) || (Number.isFinite(devMax) && max > devMax))) {
      console.warn(`${CARD}: configured range ${min}–${max} is wider than the device's ${devMin}–${devMax}; writes are clamped to the device`);
      this._warnedRange = true;
    }
    return { min, max, step, devMin, devMax };
  }

  // ── build ──────────────────────────────────────────────────────────────────
  _build() {
    const c = this._config;
    const g = GEOM[c.gauge];
    const lights = c.lights || {};
    const swatches = swatchButtonsHtml(lights.bench?.colors);
    const speakers = (c.media.speakers || []).map((s) => `<option value="${s.id}">${s.name || s.id}</option>`).join("");
    const playlists = (c.media.playlists || []).map((p, i) => `<option value="${i}">${p.name}</option>`).join("");

    this.shadowRoot.innerHTML = `
      <style>${STYLE}</style>
      <ha-card style="--accent:${ACCENTS[c.accent]}">
        <i class="accent"></i>
        <div class="vhead">
          <div class="ttl"><span class="k">${c.kanji}</span><span class="name">${c.name}</span></div>
          <span class="pill off" id="pill">Idle</span>
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
              <div class="nm">Heating<em id="heat-sub"></em></div>
              <button class="tg" id="heat-tg" role="switch" aria-label="heating"><i></i></button>
            </div>
            <div class="vrow" id="session-row">
              <div class="nm">Session</div>
              <div class="chiprow" id="chips"></div>
            </div>
            <div class="vrow" id="vest-row" hidden>
              <div class="nm">${lights.vestibule?.name || "Vestibule light"}</div>
              <button class="tg" id="vest-tg" role="switch"><i></i></button>
            </div>
            <div class="vrow" id="bench-row" hidden>
              <div class="nm">${lights.bench?.name || "Bench LED"}<em id="bench-sub"></em></div>
              <button class="tg" id="bench-tg" role="switch"><i></i></button>
            </div>
            <div class="swrow" id="swrow" hidden>${swatches}</div>
          </div>
        </div>
        <div id="media" hidden>
          <div class="strip">
            <div class="art" id="art"></div>
            <div class="mtitle"><span id="mt">Nothing playing</span><em id="ma"></em></div>
            <div class="transport">
              <button id="prev" aria-label="previous">${svgIcon("prev")}</button>
              <button id="playpause" class="play" aria-label="play or pause">${svgIcon("play")}</button>
              <button id="next" aria-label="next">${svgIcon("next")}</button>
            </div>
            <div class="vol"><input id="vol" type="range" min="0" max="100" value="30" aria-label="volume"><span class="pct" id="volpct">–</span></div>
          </div>
          <div class="selects">
            <div class="sel" ${playlists ? "" : "hidden"}><select id="playlist"><option value="">Playlist…</option>${playlists}</select></div>
            <div class="sel" ${speakers ? "" : "hidden"}><select id="speaker">${speakers}</select></div>
          </div>
        </div>
        <div class="cost" id="cost" hidden>
          <div class="c"><div class="l" id="cost-ml"></div><div class="n"><span id="cost-m"></span></div></div>
          <div class="c"><div class="l">Year to date</div><div class="n"><span id="cost-y"></span></div></div>
        </div>
      </ha-card>`;

    const $ = (s) => this.shadowRoot.querySelector(s);
    this._el = {
      card: $("ha-card"), pill: $("#pill"), gauge: $("#gauge"), gfill: $("#gfill"), ghandle: $("#ghandle"),
      cur: $("#cur"), tgt: $("#tgt"), geta: $("#geta"), heatTg: $("#heat-tg"), heatSub: $("#heat-sub"),
      chips: $("#chips"), sessionRow: $("#session-row"), vestRow: $("#vest-row"), vestTg: $("#vest-tg"),
      benchRow: $("#bench-row"), benchTg: $("#bench-tg"), benchSub: $("#bench-sub"), swrow: $("#swrow"),
      media: $("#media"), art: $("#art"), mt: $("#mt"), ma: $("#ma"), play: $("#playpause"), vol: $("#vol"), volpct: $("#volpct"),
      playlist: $("#playlist"), speaker: $("#speaker"), cost: $("#cost"), costMl: $("#cost-ml"), costM: $("#cost-m"), costY: $("#cost-y"),
    };
    this._bind();
    this._built = true;
  }

  _bind() {
    const e = this._el;
    const c = this._config;

    // gauge drag
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

    // heating
    e.heatTg.addEventListener("click", () => {
      const on = this._st(c.entity)?.state === "heat";
      this._call("climate", "set_hvac_mode", { entity_id: c.entity, hvac_mode: on ? "off" : "heat" });
    });

    // session chips (delegated)
    e.chips.addEventListener("click", (ev) => {
      const b = ev.target.closest(".mchip"); if (!b) return;
      this._call("input_select", "select_option", { entity_id: c.session.select, option: b.dataset.opt });
    });

    // lights
    e.vestTg.addEventListener("click", () => this._call("light", "toggle", { entity_id: c.lights.vestibule.entity }));
    e.benchTg.addEventListener("click", () => this._call("light", "toggle", { entity_id: c.lights.bench.entity }));
    e.swrow.addEventListener("click", (ev) => {
      const b = ev.target.closest(".sw"); if (!b || b.disabled) return;
      const s = c.lights.bench.colors[Number(b.dataset.i)];
      const data = { entity_id: c.lights.bench.entity };
      if (s.effect) data.effect = s.effect; else data.rgb_color = s.rgb;
      this._call("light", "turn_on", data);
    });

    // media — always the one SpotifyPlus entity; the speaker dropdown only selects
    // which Spotify Connect device receives it (spec §7)
    const sp = () => ({ entity_id: c.media.entity });
    this.shadowRoot.getElementById("prev").addEventListener("click", () => this._call("media_player", "media_previous_track", sp()));
    this.shadowRoot.getElementById("next").addEventListener("click", () => this._call("media_player", "media_next_track", sp()));
    e.play.addEventListener("click", () => this._call("media_player", "media_play_pause", sp()));
    e.vol.addEventListener("input", () => {
      e.vol.style.setProperty("--v", `${e.vol.value}%`);
      e.volpct.textContent = `${e.vol.value}%`;
      clearTimeout(this._volTimer);
      this._volTimer = setTimeout(() => this._call("media_player", "volume_set", { ...sp(), volume_level: Number(e.vol.value) / 100 }), 300);
    });
    e.speaker.addEventListener("change", () => {
      this._speaker = e.speaker.value;
      this._update();
      this._transferPlayback().catch((err) => console.error(`${CARD}: speaker transfer failed`, err));
    });
    e.playlist.addEventListener("change", () => {
      const i = e.playlist.value; if (i === "") return;
      this._playlist = Number(i);
      this._playPlaylist(c.media.playlists[this._playlist]).catch((err) => console.error(`${CARD}: playlist failed`, err));
    });
  }

  // ── temperature: geometry, drag, debounce and the optimistic hold all live in
  //    this._gauge (a VesselGauge, shared with sumi-hot-tub-card) ───────────────
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
    e.cur.textContent = Number.isFinite(cur) ? Math.round(cur) : "–";
    e.tgt.textContent = Math.round(tgt);
    e.gauge.setAttribute("aria-valuemin", min);
    e.gauge.setAttribute("aria-valuemax", max);
    e.gauge.setAttribute("aria-valuenow", tgt);
  }

  // ── session timer tick ─────────────────────────────────────────────────────
  _startTick() { this._stopTick(); this._tick = setInterval(() => this._paintGeta(), 30000); }
  _stopTick() { clearInterval(this._tick); this._tick = null; }

  _paintGeta() {
    if (!this._built || !this._hass) return;
    const c = this._config;
    const clim = this._st(c.entity);
    const timer = this._st(c.session.timer);
    const heating = this._isHeating(clim);
    let text = "";
    if (timer?.state === "active" && timer.attributes.finishes_at) {
      const mins = Math.max(0, Math.round((new Date(timer.attributes.finishes_at) - Date.now()) / 60000));
      text = `Auto-off in ${mins} min`;
    } else if (clim?.state === "heat") {
      text = heating ? "Heating" : "Ready";
    } else {
      const cur = Number(clim?.attributes?.current_temperature);
      text = Number.isFinite(cur) && cur > 40 ? "Cooling" : "Off";
    }
    this._el.geta.textContent = text;
  }

  // ── render ─────────────────────────────────────────────────────────────────
  _render() {
    if (!this._hass || !this._config) return;
    const clim = this._st(this._config.entity);
    if (!clim) {
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
    const clim = this._st(c.entity);
    const on = clim.state === "heat";
    const heating = this._isHeating(clim);
    const cur = Number(clim.attributes.current_temperature);
    const tgt = Number(clim.attributes.temperature);

    // optimistic hold: the device wins once the hold expires
    this._gauge.reconcile();

    // seam + frame tint follow the session being on (spec §4.4); the gauge colour, pill
    // and status line follow the element actually firing, like the native entity
    e.card.classList.toggle("on", on);
    e.card.classList.toggle("heating", heating);
    e.card.style.setProperty("--sumi-seam-opacity", on ? 1 : 0);
    e.card.style.setProperty("--sumi-active", on ? 1 : 0);

    // pill
    let pill = "Idle", cls = "off";
    if (on && heating) { pill = "Heating"; cls = "live"; }
    else if (on) { pill = "Ready"; cls = "ok"; }
    else if (Number.isFinite(cur) && cur > 40) { pill = "Cooling"; cls = "cool"; }
    e.pill.textContent = pill;
    e.pill.className = `pill ${cls}`;

    this._paintGauge();
    this._paintGeta();

    // heating row
    e.heatTg.classList.toggle("on", on);
    e.heatTg.setAttribute("aria-checked", on);
    e.heatTg.disabled = clim.state === "unavailable";
    if (on) {
      const since = fmtWhen(clim.last_changed, lang);
      e.heatSub.textContent = heating && Number.isFinite(tgt) && Number.isFinite(cur)
        ? `${Math.round(cur)}° → ${Math.round(tgt)}° · since ${since}`
        : `Holding ${Number.isFinite(tgt) ? Math.round(tgt) + "°" : ""} · since ${since}`;
    } else {
      e.heatSub.textContent = clim.last_changed ? `Last · ${fmtWhen(clim.last_changed, lang)}` : "";
    }

    // session chips
    const sel = this._st(c.session.select);
    if (sel) {
      const opts = sel.attributes.options || [];
      const key = opts.join("|");
      if (e.chips.dataset.key !== key) {
        e.chips.innerHTML = opts.map((o) => `<button class="mchip" data-opt="${o}">${/^\d+$/.test(o) ? `${o} m` : o}</button>`).join("");
        e.chips.dataset.key = key;
      }
      e.chips.querySelectorAll(".mchip").forEach((b) => b.classList.toggle("on", b.dataset.opt === sel.state));
      e.sessionRow.hidden = false;
    } else {
      e.sessionRow.hidden = true;
    }

    // lights
    const vest = c.lights.vestibule?.entity ? this._st(c.lights.vestibule.entity) : null;
    e.vestRow.hidden = !vest;
    if (vest) { e.vestTg.classList.toggle("on", vest.state === "on"); e.vestTg.setAttribute("aria-checked", vest.state === "on"); }

    const bench = c.lights.bench?.entity ? this._st(c.lights.bench.entity) : null;
    e.benchRow.hidden = !bench;
    if (bench) {
      const benchOn = bench.state === "on";
      e.benchTg.classList.toggle("on", benchOn);
      e.benchTg.setAttribute("aria-checked", benchOn);
      const modes = bench.attributes.supported_color_modes || [];
      const hasColor = modes.some((m) => COLOR_MODES.has(m));
      const colors = c.lights.bench.colors || [];
      e.swrow.hidden = !hasColor || colors.length === 0;
      const activeName = paintSwatches(e.swrow, colors, bench);
      const effect = bench.attributes.effect;
      e.benchSub.textContent = !benchOn ? "off" : activeName ? `${activeName} · ${effect && effect !== "None" ? effect.toLowerCase() : "solid"}` : effect && effect !== "None" ? effect.toLowerCase() : `${bench.attributes.brightness ? Math.round(bench.attributes.brightness / 2.55) + " %" : "on"}`;
    }

    // media — the strip always reflects the single SpotifyPlus entity, regardless
    // of which Spotify Connect device (speaker) is currently selected
    const speakerCfg = c.media.speakers || [];
    const player = c.media.entity ? this._st(c.media.entity) : null;
    e.media.hidden = speakerCfg.length === 0 || !player;
    if (player) {
      const a = player.attributes;
      const playing = player.state === "playing";
      e.mt.textContent = a.media_title || (player.state === "off" || player.state === "unavailable" ? "Speaker off" : "Nothing playing");
      e.ma.textContent = a.media_artist || a.media_album_name || (this._playlist !== null ? c.media.playlists[this._playlist]?.name : "") || "";
      e.play.innerHTML = svgIcon(playing ? "pause" : "play");
      if (a.entity_picture) e.art.innerHTML = `<img src="${a.entity_picture}" alt="">`; else e.art.innerHTML = "";
      if (document.activeElement !== e.vol && !this._volTimer) {
        const v = Math.round((a.volume_level ?? 0) * 100);
        e.vol.value = v; e.vol.style.setProperty("--v", `${v}%`); e.volpct.textContent = `${v}%`;
      }
      if (e.speaker.value !== this._speaker) e.speaker.value = this._speaker;
    }

    // cost
    const m = c.cost.monthly ? this._st(c.cost.monthly) : null;
    const y = c.cost.yearly ? this._st(c.cost.yearly) : null;
    e.cost.hidden = !m && !y;
    if (m || y) {
      const month = new Date().toLocaleDateString(lang || undefined, { month: "long" });
      e.costMl.textContent = month;
      e.costM.innerHTML = m ? `${fmtNumber(m.state, lang)}<span>${c.cost.currency}</span>` : "–";
      e.costY.innerHTML = y ? `${fmtNumber(y.state, lang)}<span>${c.cost.currency}</span>` : "–";
      const h = c.cost.hours_monthly ? this._st(c.cost.hours_monthly) : null;
      e.cost.title = h ? `${fmtNumber(h.state, lang, 1)} h this month` : "";
    }
  }

  // ── playlists: SpotifyPlus owns the queue once it has a context uri, so the
  // card only ever fires one service call per playlist choice (spec §7) ──────
  async _playPlaylist(pl) {
    if (!pl || !this._speaker) return;
    await this._call("spotifyplus", "player_media_play_context", {
      entity_id: this._config.media.entity,
      context_uri: pl.uri,
      device_id: this._speaker,
      shuffle: this._config.media.shuffle,
    });
  }

  // Moving the speaker dropdown while something is already playing carries the
  // session to the newly selected device instead of leaving audio behind (spec §7.4).
  async _transferPlayback() {
    if (!this._speaker) return;
    const player = this._st(this._config.media.entity);
    if (!player || player.state !== "playing") return;
    await this._call("spotifyplus", "player_transfer_playback", {
      entity_id: this._config.media.entity,
      device_id: this._speaker,
      play: true,
    });
  }
}

// ── visual editor: the essentials; everything else is YAML ───────────────────
class SumiSaunaCardEditor extends HTMLElement {
  setConfig(config) { this._config = { ...config }; this._render(); }
  set hass(hass) { this._hass = hass; this._render(); }
  _render() {
    if (!this._hass || !this._config) return;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => ({ entity: "Sauna climate entity", name: "Name", kanji: "Kanji", accent: "Accent", gauge: "Gauge" }[s.name] || s.name);
      this._form.addEventListener("value-changed", (ev) => {
        this._config = { ...this._config, ...ev.detail.value };
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
      const note = document.createElement("p");
      note.style.cssText = "color: var(--secondary-text-color); font-size: 12px; margin: 8px 0 0;";
      note.textContent = "Lights, media, session and cost are configured in YAML — see docs/cards/sauna.md.";
      this.appendChild(note);
    }
    this._form.hass = this._hass;
    this._form.data = this._config;
    this._form.schema = [
      { name: "entity", required: true, selector: { entity: { domain: "climate" } } },
      { name: "name", selector: { text: {} } },
      { name: "kanji", selector: { text: {} } },
      { name: "accent", selector: { select: { mode: "dropdown", options: Object.keys(ACCENTS).map((v) => ({ value: v, label: v })) } } },
      { name: "gauge", selector: { select: { mode: "dropdown", options: ["arc", "ring"].map((v) => ({ value: v, label: v })) } } },
    ];
  }
}

if (!customElements.get(CARD)) customElements.define(CARD, SumiSaunaCard);
if (!customElements.get(`${CARD}-editor`)) customElements.define(`${CARD}-editor`, SumiSaunaCardEditor);

window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === CARD)) {
  window.customCards.push({
    type: CARD,
    name: "Sumi Sauna",
    description: "One card for the whole sauna: temperature, session, lights, music, cost.",
    preview: false,
    documentationURL: "https://github.com/trozanek/ha-sumi-house/blob/main/docs/cards/sauna.md",
  });
}

console.info(`%c${CARD} %c${VERSION}`, "color:#DE9163;font-weight:600", "color:#99907F");
