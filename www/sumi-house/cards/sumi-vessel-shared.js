/* sumi-vessel-shared — geometry, interaction and small helpers shared by the "vessel"
 * cards (sumi-sauna-card, sumi-hot-tub-card, and any later one: pool, hot tub siblings…).
 *
 * Per docs/cards/sauna.md §4.3 and docs/cards/hot-tub.md §5.2: drag, debounce and the
 * optimistic hold are identical across vessel cards — this module is that shared
 * implementation, not a copy in each card. Each card still owns its own markup, CSS
 * and domain logic; this file only holds what is genuinely the same shape everywhere.
 *
 * Plain ES module, no build step. Imported with a relative specifier, so it must sit
 * next to the cards that use it: www/sumi-house/cards/sumi-vessel-shared.js
 */

export const VESSEL_SHARED_VERSION = "1.0.0";

// ── per-person / per-vessel accent tokens, with fallbacks so a card renders
// sensibly even when the Sumi House theme is not active ─────────────────────
export const ACCENTS = {
  oak: "var(--sumi-oak, var(--accent-color, #C89F6E))",
  mizu: "var(--sumi-mizu, var(--info-color, #7E93A0))",
  moss: "var(--sumi-moss, var(--success-color, #8B9678))",
  copper: "var(--sumi-copper, var(--primary-color, #C0754A))",
};

// ── gauge geometry: viewBox 120×120, angles clockwise from 12 o'clock ───────
export const GEOM = {
  arc: { start: 225, sweep: 270 },  // dry heat, escaping: gap at the bottom
  ring: { start: 0, sweep: 360 },   // contained water: closed circle
};
export const CX = 60, CY = 60, R = 50;

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const deg = (a) => (a * Math.PI) / 180;

export function pt(angleDeg, r = R) {
  const a = deg(angleDeg);
  return { x: CX + r * Math.sin(a), y: CY - r * Math.cos(a) };
}

/** SVG path for the gauge track/fill, `from`→`to` degrees, clockwise. Handles the
 *  full-circle case (ring at 100%), which a single arc command cannot express. */
export function arcPath(from, to) {
  if (to - from >= 359.99) {
    const mid = from + 180;
    const p0 = pt(from), p1 = pt(mid);
    return `M${p0.x} ${p0.y} A${R} ${R} 0 1 1 ${p1.x} ${p1.y} A${R} ${R} 0 1 1 ${p0.x} ${p0.y}`;
  }
  const p0 = pt(from), p1 = pt(to);
  const large = to - from > 180 ? 1 : 0;
  return `M${p0.x} ${p0.y} A${R} ${R} 0 ${large} 1 ${p1.x} ${p1.y}`;
}

/** Pointer position over a gauge element → temperature, given its geometry key and
 *  the live range. For an open arc, a pointer in the gap snaps to whichever end is
 *  angularly closer rather than jumping across it. */
export function angleToTemp(gaugeEl, clientX, clientY, geomKey, range) {
  const rect = gaugeEl.getBoundingClientRect();
  const dx = clientX - (rect.left + rect.width / 2);
  const dy = clientY - (rect.top + rect.height / 2);
  const g = GEOM[geomKey];
  const ang = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
  let local = (ang - g.start + 360) % 360;
  if (local > g.sweep) local = local - g.sweep < (360 - g.sweep) / 2 ? g.sweep : 0;
  const { min, max, step } = range;
  const raw = min + (local / g.sweep) * (max - min);
  return clamp(Math.round(raw / step) * step, min, max);
}

export function tempToAngle(t, geomKey, min, max) {
  const g = GEOM[geomKey];
  return g.start + clamp((t - min) / (max - min), 0, 1) * g.sweep;
}

/**
 * The shared drag / debounce / optimistic-hold state machine for a gauge that writes
 * a target temperature to a climate entity (docs/cards/sauna.md §4.3):
 *
 *   1. every pointer/step event repaints locally at once — no service call
 *   2. one `commit` service call fires `commitDelay` ms after the last movement
 *   3. inbound entity changes are ignored for `holdMs` ms after a commit, so the
 *      handle does not snap back to the old value while the device catches up
 *   4. the entity wins unconditionally once the hold expires
 *
 * A card owns one instance per gauge. It never touches `_local`/`_holdUntil` itself —
 * it calls `set()`/`startDrag()`/`endDrag()` and reads `value()`/`isDragging()`.
 */
export class VesselGauge {
  /**
   * @param {object} opts
   * @param {() => {min:number,max:number,step:number,devMin?:number,devMax?:number}} opts.range
   * @param {() => number} opts.entityValue  current authoritative target, from hass state
   * @param {(t: number) => void} opts.onCommit  write the value via a service call
   * @param {() => void} [opts.onPaint]  called after every local change, for a repaint
   * @param {number} [opts.commitDelay=400]
   * @param {number} [opts.holdMs=2000]
   */
  constructor(opts) {
    this._opts = opts;
    this._local = null;
    this._holdUntil = 0;
    this._dragging = false;
    this._timer = null;
  }

  isDragging() { return this._dragging; }

  /** The value to paint: the live local override while set, else the entity's own. */
  value() {
    return this._local !== null ? this._local : this._opts.entityValue();
  }

  /** Set a new local value (from a drag, a step button, or arrow keys) and schedule
   *  the debounced commit. Always clamped to the current range. */
  set(t) {
    const { min, max } = this._opts.range();
    this._local = clamp(t, min, max);
    this._opts.onPaint?.();
    if (!this._dragging) this._scheduleCommit(this._opts.commitDelay ?? 400);
  }

  startDrag() { this._dragging = true; }

  endDrag() {
    this._dragging = false;
    this._scheduleCommit(0);
  }

  _scheduleCommit(delay) {
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this._commit(), delay);
  }

  _commit() {
    if (this._local === null || this._dragging) return;
    const { devMin, devMax } = this._opts.range();
    let t = this._local;
    if (Number.isFinite(devMin)) t = Math.max(t, devMin);
    if (Number.isFinite(devMax)) t = Math.min(t, devMax);
    const holdMs = this._opts.holdMs ?? 2000;
    this._holdUntil = Date.now() + holdMs;
    setTimeout(() => {
      if (Date.now() >= this._holdUntil) { this._local = null; this._opts.onPaint?.(); }
    }, holdMs + 20);
    if (t !== this._opts.entityValue()) this._opts.onCommit(t);
  }

  /** Call once per hass update: drops a stale local override once its hold window has
   *  passed, without waiting for the timer above (keeps the very next paint correct). */
  reconcile() {
    if (this._local !== null && !this._dragging && Date.now() >= this._holdUntil) this._local = null;
  }
}

// ── small shared helpers ─────────────────────────────────────────────────────

/** Deep-merge a card's user config onto its defaults, one level of nesting deep
 *  (which is all any vessel card's config schema uses). */
export function merge(base, over) {
  const out = { ...base };
  for (const [k, v] of Object.entries(over || {})) {
    out[k] = v && typeof v === "object" && !Array.isArray(v) && base[k] && typeof base[k] === "object" && !Array.isArray(base[k])
      ? merge(base[k], v) : v;
  }
  return out;
}

export function fmtNumber(value, lang, digits = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "–";
  return n.toLocaleString(lang || undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

/** "today 09:03" / "yesterday 21:10" / "3 Sep 09:03" — used for a device's last-changed. */
export function fmtWhen(iso, lang) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const time = d.toLocaleTimeString(lang || undefined, { hour: "2-digit", minute: "2-digit" });
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (sameDay(d, now)) return `today ${time}`;
  const y = new Date(now); y.setDate(now.getDate() - 1);
  if (sameDay(d, y)) return `yesterday ${time}`;
  return `${d.toLocaleDateString(lang || undefined, { day: "numeric", month: "short" })} ${time}`;
}

export function svgIcon(paths, name) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]}"/></svg>`;
}

// ── colour swatches: shared by every light row (sauna's vestibule/bench, the hot
// tub's single light, and any later vessel card) — spec docs/cards/sauna.md §6,
// docs/cards/hot-tub.md §7 ("identical to the sauna's"). ─────────────────────
export const COLOR_MODES = new Set(["hs", "rgb", "rgbw", "rgbww", "xy"]);
export const RGB_TOLERANCE = 12;

export function swatchButtonsHtml(colors) {
  return (colors || []).map((s, i) => {
    const bg = s.gradient ? `linear-gradient(135deg, ${s.gradient.join(", ")})` : `rgb(${(s.rgb || [0, 0, 0]).join(",")})`;
    return `<button class="sw" data-i="${i}" title="${s.name || ""}" style="--c:${bg}"></button>`;
  }).join("");
}

/** Which configured swatch (if any) matches a light entity's live state: effect
 *  first, then rgb_color within ±12 per channel (spec: "bulbs round-trip RGB
 *  imprecisely"). Returns -1 when the light is off or nothing matches. */
export function matchSwatch(entityState, colors) {
  if (!entityState || entityState.state !== "on") return -1;
  const { effect, rgb_color: rgb } = entityState.attributes;
  const solid = !effect || effect === "None" || effect === "none";
  let idx = -1;
  (colors || []).forEach((s, i) => {
    if (s.effect) { if (effect === s.effect) idx = i; }
    else if (solid && Array.isArray(rgb) && s.rgb && s.rgb.every((v, j) => Math.abs(v - rgb[j]) <= RGB_TOLERANCE)) idx = i;
  });
  return idx;
}

/** Disable any swatch whose `effect` the light does not actually support, and
 *  mark the live match as `.on` — call after (re)building or on every update. */
export function paintSwatches(container, colors, entityState) {
  const effects = entityState?.attributes?.effect_list || [];
  const activeIdx = matchSwatch(entityState, colors);
  container.querySelectorAll(".sw").forEach((b) => {
    const s = (colors || [])[Number(b.dataset.i)];
    b.disabled = Boolean(s?.effect) && !effects.includes(s.effect);
    b.classList.toggle("on", Number(b.dataset.i) === activeIdx);
  });
  return activeIdx >= 0 ? colors[activeIdx].name : "";
}

/** CSS shared by every vessel card: the `ha-card` token bridge (theme vars, with
 *  Home Assistant / hard-coded fallbacks), the head/pill, the gauge, the stacked
 *  rows, toggles and chips, the cost footer, and the base responsive/reduced-motion
 *  rules. Each card appends its own additions (media strip, swatches, schedule
 *  stripline, service grid…) after this string. */
export const VESSEL_BASE_STYLE = `
  :host { display: block; container-type: inline-size; }
  * { box-sizing: border-box; }
  button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }
  button:disabled { cursor: default; }

  ha-card {
    position: relative;
    display: flex; flex-direction: column;
    padding: 13px 16px 11px;
    font-family: var(--sumi-font-ui, var(--ha-font-family-body, sans-serif));
    font-weight: var(--ha-font-weight-body, 300);
    color: var(--sumi-ink, var(--primary-text-color));
    --copper: var(--sumi-copper, var(--primary-color, #C0754A));
    --copper-hi: var(--sumi-copper-glow, var(--light-primary-color, #DE9163));
    --copper-lo: var(--sumi-copper-deep, var(--dark-primary-color, #8C4E2E));
    --stone: var(--sumi-ink-soft, var(--secondary-text-color, #99907F));
    --faint: var(--sumi-ink-faint, var(--secondary-text-color, #7A7264));
    --seam: var(--sumi-line, var(--divider-color, #34302A));
    --washi: var(--sumi-ink, var(--primary-text-color, #EFE7D7));
    --char: var(--sumi-view, var(--primary-background-color, #17130E));
    --alert: var(--sumi-alert, var(--error-color, #CF7B6B));
    --caution: var(--sumi-caution, var(--warning-color, #D4A23F));
    --mono: var(--sumi-font-mono, var(--ha-font-family-code, monospace));
    --display: var(--sumi-font-display, var(--ha-font-family-heading, serif));
    --r-chip: var(--sumi-radius-control, 4px);
    --ease: var(--sumi-ease, cubic-bezier(0.22, 1, 0.36, 1));
    --fast: var(--sumi-dur-fast, 180ms);
    --base: var(--sumi-dur-base, 420ms);
  }
  .accent { position: absolute; left: 0; top: 12px; bottom: 12px; width: 2px; border-radius: 0 2px 2px 0; background: var(--accent); opacity: .7; }

  /* head */
  .vhead { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
  .ttl { display: flex; align-items: baseline; gap: 9px; }
  .k { font-family: var(--display); font-size: 13px; letter-spacing: .3em; color: var(--accent); opacity: .85; }
  .name { font-family: var(--display); font-weight: var(--ha-font-weight-heading, 600); font-size: 15px; letter-spacing: .02em; }
  .pill {
    font-family: var(--mono); font-size: 9px; letter-spacing: .2em; text-transform: uppercase;
    color: var(--stone); border: 1px solid var(--seam); border-radius: 2px; padding: 3px 7px; white-space: nowrap;
    transition: color var(--base) var(--ease), border-color var(--base) var(--ease), background-color var(--base) var(--ease);
  }
  .pill.live { color: var(--copper-hi); border-color: var(--copper-lo); background: color-mix(in oklab, var(--copper) 11%, transparent); }
  .pill.ok { color: var(--sumi-moss, var(--success-color)); border-color: color-mix(in oklab, var(--sumi-moss, var(--success-color)) 45%, transparent); }
  .pill.cool { color: var(--sumi-mizu, var(--info-color)); border-color: color-mix(in oklab, var(--sumi-mizu, var(--info-color)) 45%, transparent); }
  .pill.off { color: var(--faint); }

  /* body: gauge beside its controls */
  .vbody { display: flex; gap: 16px; align-items: flex-start; margin-top: 9px; }
  .vleft { width: 110px; flex: none; display: flex; flex-direction: column; align-items: center; }
  .vright { flex: 1; min-width: 0; }

  .gauge { position: relative; width: 104px; height: 104px; flex: none; touch-action: none; cursor: pointer; user-select: none; }
  .gauge svg { width: 100%; height: 100%; display: block; overflow: visible; }
  .gtrack { fill: none; stroke: var(--seam); stroke-width: 3; }
  .gfill { fill: none; stroke: var(--accent); stroke-width: 3; stroke-linecap: round; transition: stroke-dasharray var(--base) var(--ease), stroke var(--base) var(--ease); }
  ha-card.heating .gfill { stroke: var(--copper-hi); }
  .ghandle { fill: var(--washi); stroke: var(--sumi-surface, var(--card-background-color, #211E1A)); stroke-width: 3; transition: cx var(--base) var(--ease), cy var(--base) var(--ease); }
  .gauge.dragging .ghandle, .gauge.dragging .gfill { transition: none; }
  .gcenter { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; }
  .gnum { font-family: var(--mono); font-size: 25px; font-weight: 300; line-height: 1; letter-spacing: -.01em; font-variant-numeric: tabular-nums; }
  .gnum small { font-size: 10px; color: var(--stone); margin-left: 1px; }
  .gtgt { font-family: var(--mono); font-size: 10px; color: var(--stone); letter-spacing: .06em; margin-top: 3px; font-variant-numeric: tabular-nums; }
  .gtgt b { color: var(--accent); font-weight: 400; }
  ha-card.heating .gtgt b { color: var(--copper-hi); }
  .gsteps { display: flex; gap: 6px; margin-top: 7px; }
  .gbtn {
    width: 34px; height: 27px; flex: none; border: 1px solid var(--seam); border-radius: var(--r-chip);
    color: var(--stone); font-family: var(--mono); font-size: 16px; line-height: 1;
    transition: color var(--fast) var(--ease), border-color var(--fast) var(--ease), background-color var(--fast) var(--ease);
  }
  .gbtn:hover { color: var(--copper-hi); border-color: var(--copper-lo); background: color-mix(in oklab, var(--copper) 8%, transparent); }
  .gbtn:active { transform: scale(.94); }
  .gbtn:disabled { opacity: .35; }
  .geta { font-family: var(--mono); font-size: 8px; letter-spacing: .14em; text-transform: uppercase; color: var(--faint); text-align: center; margin: 7px 0 0; min-height: 10px; }

  /* rows */
  .vrow { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 5px 0; border-top: 1px solid var(--seam); }
  .vrow:first-child { border-top: none; padding-top: 0; }
  .nm { font-size: 13px; font-weight: 400; min-width: 0; }
  .nm em { display: block; font-style: normal; color: var(--stone); font-size: 10px; margin-top: 1px; font-family: var(--mono); letter-spacing: .03em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .chiprow { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
  .mchip {
    font-family: var(--mono); font-size: 10px; letter-spacing: .15em; text-transform: uppercase;
    border: 1px solid var(--seam); border-radius: 3px; padding: 5px 10px; color: var(--stone);
    transition: color var(--fast) var(--ease), border-color var(--fast) var(--ease), background-color var(--fast) var(--ease);
  }
  .mchip:hover { color: var(--washi); }
  .mchip.on { color: var(--copper-hi); border-color: var(--copper-lo); background: color-mix(in oklab, var(--copper) 13%, transparent); }
  .mchip:disabled { opacity: .4; }

  .tg { position: relative; width: 40px; height: 22px; flex: none; border-radius: 3px; border: 1px solid var(--seam); background: var(--char); transition: border-color var(--base) var(--ease), background-color var(--base) var(--ease); }
  .tg i { position: absolute; top: 3px; left: 3px; width: 14px; height: 14px; border-radius: 2px; background: var(--stone); transition: left var(--base) var(--ease), background-color var(--base) var(--ease); }
  .tg.on { border-color: var(--copper-lo); background: color-mix(in oklab, var(--copper) 14%, transparent); }
  .tg.on i { left: 21px; background: var(--copper); }
  .tg:disabled { opacity: .4; }

  /* cost footer */
  .cost { display: flex; align-items: baseline; gap: 20px; margin-top: 9px; padding-top: 9px; border-top: 1px solid var(--seam); }
  .cost .c { flex: none; }
  .cost .l { font-family: var(--mono); font-size: 9px; letter-spacing: .2em; text-transform: uppercase; color: var(--faint); }
  .cost .n { font-family: var(--mono); font-size: 13px; margin-top: 2px; font-weight: 300; font-variant-numeric: tabular-nums; }
  .cost .n span { font-size: 10px; color: var(--stone); margin-left: 3px; }

  .swrow { display: flex; gap: 5px; padding: 8px 0 1px; border-top: 1px solid var(--seam); flex-wrap: wrap; }
  .sw { width: 19px; height: 19px; border-radius: 2px; border: 1px solid var(--seam); flex: none; position: relative; background: var(--c); transition: transform var(--fast) var(--ease), border-color var(--fast) var(--ease), box-shadow var(--fast) var(--ease); }
  .sw:hover { transform: translateY(-1px); }
  .sw.on { border-color: var(--washi); box-shadow: 0 0 0 1px var(--washi) inset, 0 0 10px -2px var(--c); }
  .sw:disabled { opacity: .3; }

  .warning { padding: 16px; color: var(--alert); font-family: var(--mono); font-size: 12px; }
  [hidden] { display: none !important; }

  @container (max-width: 420px) {
    .vbody { flex-direction: column; align-items: stretch; }
    .vleft { width: auto; flex-direction: row; justify-content: center; align-items: center; gap: 10px; flex-wrap: wrap; }
    .geta { margin: 0; flex-basis: 100%; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, ::before, ::after { transition: none !important; }
  }
`;
