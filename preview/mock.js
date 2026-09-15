/* Sumi House preview — interaction. Devices toggle their card's --sumi-seam-opacity,
   which is exactly what the card_mod template does on a real dashboard (§5.3). */

// Sidebar items as real custom elements with a `headline` part, so the theme's
// `ha-list-item-button.selected::part(headline)` rule from card-mod-sidebar applies.
customElements.define("ha-list-item-button", class extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `<style>
        :host { display: flex; align-items: center; gap: 16px; }
        span { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      </style><slot name="start"></slot><span part="headline"><slot></slot></span>`;
  }
});

// View tabs as in hui-root: a Web Awesome tab whose label is slotted into `part="base"`.
customElements.define("ha-tab-group-tab", class extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    this.attachShadow({ mode: "open" }).innerHTML =
      `<style>:host{display:inline-flex}div{display:inline-flex;align-items:center;padding:0 16px;height:var(--header-height);cursor:pointer}</style><div part="base" class="tab"><slot></slot></div>`;
  }
});

const html = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ── mode ──────────────────────────────────────────────────────────────────
function setMode(mode) {
  html.dataset.mode = mode;
  $("#mode-toggle").setAttribute("aria-pressed", mode === "light");
  $("#mode-toggle .t").textContent = mode === "dark" ? "Dark · 墨" : "Light · washi";
  try { localStorage.setItem("sumi-preview-mode", mode); } catch (_) {}
  paintSwatches();
}
$("#mode-toggle").addEventListener("click", () => setMode(html.dataset.mode === "dark" ? "light" : "dark"));
window.matchMedia("(prefers-color-scheme: light)");
let initial = "dark";
try { initial = localStorage.getItem("sumi-preview-mode") || initial; } catch (_) {}
const q = new URLSearchParams(location.search);            // ?mode=light&cardmod=off for screenshots
if (q.get("mode")) initial = q.get("mode");

// ── card-mod layer on/off (what the dashboard looks like without card-mod) ──
const cardmod = $("#cardmod-css");
$("#cardmod-toggle").addEventListener("click", (e) => {
  cardmod.disabled = !cardmod.disabled;
  e.currentTarget.setAttribute("aria-pressed", !cardmod.disabled);
  e.currentTarget.querySelector(".t").textContent = cardmod.disabled ? "card-mod off" : "card-mod on";
});

// ── devices: each tile knows how it becomes "active" ─────────────────────
const devices = $$("ha-card.tile[data-device]");
function render(card) {
  const on = card.dataset.on === "1";
  const info = $(".secondary", card);
  card.classList.toggle("active", on);
  card.style.setProperty("--sumi-seam-opacity", on ? 1 : 0);
  info.innerHTML = on ? card.dataset.onText : card.dataset.offText;
  if (card.dataset.icon && card.dataset.iconOn) {
    $(".icon", card).style.setProperty("--m", `url(icons/${on ? card.dataset.iconOn : card.dataset.icon}.svg)`);
  }
  updateAudit();
  if (card.dataset.device === "sauna" && typeof gauge === "function") gauge();
}
devices.forEach((card) => {
  card.addEventListener("click", () => { card.dataset.on = card.dataset.on === "1" ? "0" : "1"; render(card); });
  render(card);
});
$("#all-off").addEventListener("click", () => devices.forEach((c) => { c.dataset.on = "0"; render(c); }));
$("#all-on").addEventListener("click", () => devices.forEach((c) => { c.dataset.on = "1"; render(c); }));
function updateAudit() {
  const n = devices.filter((c) => c.dataset.on === "1").length;
  $("#audit").textContent = n === 0 ? "Seam audit: nothing running — there should be no copper on this page except the sidebar rule."
    : `${n} device${n > 1 ? "s" : ""} running → ${n} seam${n > 1 ? "s" : ""} lit.`;
}

// ── sauna gauge follows the sauna tile ────────────────────────────────────
function gauge() {
  const on = $('ha-card[data-device="sauna"]').dataset.on === "1";
  const pct = on ? 0.62 : 0.18;
  const len = 251; // half-circle arc length for r=80
  $("#gauge-level").setAttribute("stroke-dasharray", `${len * pct} ${len}`);
  $("#gauge-text").textContent = on ? "68" : "24";
}
gauge();

// ── controls specimen ────────────────────────────────────────────────────
$$(".ha-switch").forEach((s) => s.addEventListener("click", () => s.classList.toggle("checked")));
$$(".checkbox").forEach((c) => c.addEventListener("click", () => c.classList.toggle("checked")));
$$("input.ha-slider").forEach((r) => {
  const paint = () => r.style.setProperty("--v", `${((r.value - r.min) / (r.max - r.min)) * 100}%`);
  r.addEventListener("input", paint); paint();
});
$$(".chip[data-toggle]").forEach((c) => c.addEventListener("click", () => c.classList.toggle("active")));

// ── dialog ────────────────────────────────────────────────────────────────
const scrim = $("#scrim");
$("#open-dialog").addEventListener("click", () => { scrim.hidden = false; });
$$("[data-close]").forEach((b) => b.addEventListener("click", () => { scrim.hidden = true; }));
scrim.addEventListener("click", (e) => { if (e.target === scrim) scrim.hidden = true; });

// ── swatches show the resolved hex for the current mode ──────────────────
function paintSwatches() {
  const cs = getComputedStyle(html);
  $$(".swatch[data-token]").forEach((sw) => {
    let v = cs.getPropertyValue(`--${sw.dataset.token}`).trim();
    if (!v.startsWith("#")) v = getComputedStyle($("i", sw)).backgroundColor;   // resolve color-mix()
    $("code", sw).textContent = v;
  });
}

// ── fonts: report which self-hosted faces actually loaded ────────────────
document.fonts.ready.then(() => {
  const want = ["Zen Old Mincho", "Zen Kaku Gothic New", "IBM Plex Mono"];
  const loaded = {};
  for (const face of document.fonts) {
    const fam = face.family.replace(/^["']|["']$/g, "");
    if (face.status === "loaded" && want.includes(fam)) loaded[fam] = (loaded[fam] || 0) + 1;
  }
  const missing = want.filter((f) => !loaded[f]);
  $("#font-status").textContent = missing.length
    ? `Fonts: nothing loaded for ${missing.join(", ")} — is /local/sumi-house/sumi-fonts.js served?`
    : `Fonts: self-hosted · ${want.map((f) => `${f} ×${loaded[f]}`).join(" · ")} (subset slices in use)`;
});

setMode(initial);
if (q.get("cardmod") === "off") $("#cardmod-toggle").click();
if (q.get("all") === "on") $("#all-on").click();
if (q.get("all") === "off") $("#all-off").click();
