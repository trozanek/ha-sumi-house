/* Fake `hass` for exercising sumi-hot-tub-card (and, side by side, sumi-sauna-card)
   without Home Assistant. Actions mutate the fake state and are logged; cards
   re-render from state, exactly as they would against a real connection. */

const log = document.getElementById("log");
const say = (msg) => { log.innerHTML = `<b>${new Date().toLocaleTimeString()}</b> ${msg}\n` + log.innerHTML; };

const states = {
  "climate.hot_tub": { entity_id: "climate.hot_tub", state: "heat", last_changed: new Date().toISOString(),
    attributes: { current_temperature: 38.5, temperature: 38.5, min_temp: 20, max_temp: 40, friendly_name: "Hot tub" } },
  "switch.hot_tub_heater": { entity_id: "switch.hot_tub_heater", state: "on", attributes: {} },
  "switch.hot_tub_pump": { entity_id: "switch.hot_tub_pump", state: "on", attributes: {} },
  "switch.hot_tub_bubbles": { entity_id: "switch.hot_tub_bubbles", state: "off", attributes: {} },
  "binary_sensor.hot_tub_heating": { entity_id: "binary_sensor.hot_tub_heating", state: "off", attributes: {} },

  // light: one entity, rgb + effect, mirroring the sauna's bench LED (spec §7)
  "light.hot_tub": { entity_id: "light.hot_tub", state: "on",
    attributes: { supported_color_modes: ["rgb"], rgb_color: [124, 145, 158], effect: "None", effect_list: ["None", "Slow Fade"], brightness: 160 } },

  "input_boolean.tub_schedule_enabled": { entity_id: "input_boolean.tub_schedule_enabled", state: "on", attributes: {} },
  "sensor.hot_tub_scheduled_temperature": { entity_id: "sensor.hot_tub_scheduled_temperature", state: "38.5", attributes: {} },
  "input_datetime.tub_slot_1_time": { entity_id: "input_datetime.tub_slot_1_time", state: "06:00:00", attributes: {} },
  "input_number.tub_slot_1_temp": { entity_id: "input_number.tub_slot_1_temp", state: "36", attributes: {} },
  "input_datetime.tub_slot_2_time": { entity_id: "input_datetime.tub_slot_2_time", state: "14:00:00", attributes: {} },
  "input_number.tub_slot_2_temp": { entity_id: "input_number.tub_slot_2_temp", state: "37.5", attributes: {} },
  "input_datetime.tub_slot_3_time": { entity_id: "input_datetime.tub_slot_3_time", state: "17:30:00", attributes: {} },
  "input_number.tub_slot_3_temp": { entity_id: "input_number.tub_slot_3_temp", state: "38.5", attributes: {} },
  "input_datetime.tub_slot_4_time": { entity_id: "input_datetime.tub_slot_4_time", state: "22:30:00", attributes: {} },
  "input_number.tub_slot_4_temp": { entity_id: "input_number.tub_slot_4_temp", state: "35", attributes: {} },

  // service counters: controller-owned "days since" sensors + reset entities
  // (spec §9) — one of each reset domain, to exercise the RESET_SERVICE map.
  "sensor.hot_tub_chloride_days": { entity_id: "sensor.hot_tub_chloride_days", state: "9", attributes: {} },
  "switch.hot_tub_chloride_reset": { entity_id: "switch.hot_tub_chloride_reset", state: "off", attributes: {} },
  "sensor.hot_tub_filter_days": { entity_id: "sensor.hot_tub_filter_days", state: "2", attributes: {} }, // due soon
  "button.hot_tub_filter_reset": { entity_id: "button.hot_tub_filter_reset", state: "unknown", attributes: {} },
  "sensor.hot_tub_rinse_days": { entity_id: "sensor.hot_tub_rinse_days", state: "10", attributes: {} }, // overdue (every 7d)
  "input_boolean.hot_tub_rinse_reset": { entity_id: "input_boolean.hot_tub_rinse_reset", state: "off", attributes: {} },
  "sensor.hot_tub_water_days": { entity_id: "sensor.hot_tub_water_days", state: "unavailable", attributes: {} }, // sensor down
  "script.hot_tub_water_reset": { entity_id: "script.hot_tub_water_reset", state: "off", attributes: {} },

  "sensor.hot_tub_cost_monthly": { entity_id: "sensor.hot_tub_cost_monthly", state: "386.4", attributes: {} },
  "sensor.hot_tub_cost_yearly": { entity_id: "sensor.hot_tub_cost_yearly", state: "4120", attributes: {} },

  // sauna, for the side-by-side (spec §2) — same fixture as preview/sauna-harness.js
  "climate.sauna": { entity_id: "climate.sauna", state: "off", last_changed: new Date(Date.now() - 26 * 3600e3).toISOString(),
    attributes: { current_temperature: 24, temperature: 85, min_temp: 20, max_temp: 110, target_temp_step: 1, hvac_action: "off", friendly_name: "Sauna" } },
  "binary_sensor.sauna_heating": { entity_id: "binary_sensor.sauna_heating", state: "off", attributes: {} },
  "input_select.sauna_session_length": { entity_id: "input_select.sauna_session_length", state: "90", attributes: { options: ["60", "90", "120"] } },
  "timer.sauna_session": { entity_id: "timer.sauna_session", state: "idle", attributes: {} },
};

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

const listeners = new Set();
function publish() { const hass = makeHass(); listeners.forEach((el) => { el.hass = hass; }); }
function set(id, patch) {
  const s = states[id];
  const next = { ...s, ...patch, attributes: { ...s.attributes, ...(patch.attributes || {}) } };
  if (patch.state !== undefined && patch.state !== s.state) next.last_changed = new Date().toISOString();
  states[id] = next;
}

function callService(domain, service, data) {
  say(`${domain}.${service} ${JSON.stringify(data)}`);
  const id = data.entity_id;
  switch (`${domain}.${service}`) {
    case "climate.set_temperature": set(id, { attributes: { temperature: data.temperature } }); break;
    case "climate.set_hvac_mode":
      set(id, { state: data.hvac_mode, attributes: { hvac_action: data.hvac_mode === "heat" ? "heating" : "off" } });
      set("binary_sensor.sauna_heating", { state: data.hvac_mode === "heat" ? "on" : "off" });
      break;
    case "input_select.select_option": set(id, { state: data.option }); break;
    case "switch.toggle": set(id, { state: states[id].state === "on" ? "off" : "on" }); break;
    case "switch.turn_on": set(id, { state: "on" }); resetCounterFor(id); break;
    case "switch.turn_off": set(id, { state: "off" }); break;
    case "input_boolean.turn_on": set(id, { state: "on" }); resetCounterFor(id); break;
    case "input_boolean.turn_off": set(id, { state: "off" }); break;
    case "light.toggle": set(id, { state: states[id].state === "on" ? "off" : "on" }); break;
    case "light.turn_on": {
      const attrs = {};
      if (data.rgb_color) { attrs.rgb_color = data.rgb_color.map((v) => v + 2); attrs.effect = "None"; }
      if (data.effect) attrs.effect = data.effect;
      set(id, { state: "on", attributes: attrs }); break;
    }
    case "input_datetime.set_datetime": {
      const time = data.time.length === 5 ? `${data.time}:00` : data.time;
      set(id, { state: data.date ? `${data.date} ${time}` : time });
      break;
    }
    case "input_number.set_value": set(id, { state: String(data.value) }); break;
    // service counter resets: the controller "does its thing" and its own days-since
    // sensor drops to 0 — the card never writes that sensor itself (spec §9.2).
    case "button.press": resetCounterFor(id); break;
    case "input_button.press": resetCounterFor(id); break;
    case "script.turn_on": set(id, { state: "on" }); resetCounterFor(id); break;
    case "scene.turn_on": resetCounterFor(id); break;
  }
  setTimeout(publish, 120);
  return Promise.resolve();
}

const RESET_TO_SENSOR = {
  "switch.hot_tub_chloride_reset": "sensor.hot_tub_chloride_days",
  "button.hot_tub_filter_reset": "sensor.hot_tub_filter_days",
  "input_boolean.hot_tub_rinse_reset": "sensor.hot_tub_rinse_days",
  "script.hot_tub_water_reset": "sensor.hot_tub_water_days",
};
function resetCounterFor(resetEntity) {
  const sensor = RESET_TO_SENSOR[resetEntity];
  if (sensor) set(sensor, { state: "0" });
}

function makeHass() {
  return { states, locale: { language: "pl" }, language: "pl", callService, callWS: () => Promise.resolve({}) };
}

// ── mount ─────────────────────────────────────────────────────────────────
const tubConfig = {
  entity: "climate.hot_tub", accent: "mizu", gauge: "ring",
  temperature: { min: 20, max: 40 },
  switches: {
    heater: { entity: "switch.hot_tub_heater", name: "Heater" },
    pump: { entity: "switch.hot_tub_pump", name: "Pump" },
    bubbles: { entity: "switch.hot_tub_bubbles", name: "Bubbles" },
  },
  light: {
    entity: "light.hot_tub", name: "Light",
    colors: [
      { name: "Mizu", rgb: [126, 147, 160] }, { name: "Ember", rgb: [192, 117, 74] }, { name: "Oak", rgb: [200, 159, 110] },
      { name: "Washi", rgb: [239, 231, 215] }, { name: "Moss", rgb: [139, 150, 120] }, { name: "Deep", rgb: [74, 58, 107] },
      { name: "Fade", effect: "Slow Fade", gradient: ["#7E93A0", "#4A3A6B"] },
    ],
  },
  schedule: {
    enable: "input_boolean.tub_schedule_enabled",
    scheduled_temperature: "sensor.hot_tub_scheduled_temperature",
    slots: [
      { time: "input_datetime.tub_slot_1_time", temp: "input_number.tub_slot_1_temp" },
      { time: "input_datetime.tub_slot_2_time", temp: "input_number.tub_slot_2_temp" },
      { time: "input_datetime.tub_slot_3_time", temp: "input_number.tub_slot_3_temp" },
      { time: "input_datetime.tub_slot_4_time", temp: "input_number.tub_slot_4_temp" },
    ],
  },
  service: {
    confirm: true,
    confirm_seconds: 3,
    items: [
      { key: "chloride", label: "Chloride", sensor: "sensor.hot_tub_chloride_days", reset: "switch.hot_tub_chloride_reset", every: "14d" },
      { key: "filter", label: "Filter", sensor: "sensor.hot_tub_filter_days", reset: "button.hot_tub_filter_reset", every: "14d" },
      { key: "rinse", label: "Rinse", sensor: "sensor.hot_tub_rinse_days", reset: "input_boolean.hot_tub_rinse_reset", every: "7d" },
      { key: "water", label: "Water", sensor: "sensor.hot_tub_water_days", reset: "script.hot_tub_water_reset", every: "2mo" },
    ],
  },
  cost: { monthly: "sensor.hot_tub_cost_monthly", yearly: "sensor.hot_tub_cost_yearly", currency: "zł" },
};
const saunaConfig = { entity: "climate.sauna", accent: "oak", gauge: "arc" };

customElements.whenDefined("sumi-hot-tub-card").then(() => {
  const tub = document.getElementById("tub"); tub.setConfig(tubConfig); listeners.add(tub);
  const sauna = document.getElementById("sauna"); sauna.setConfig(saunaConfig); listeners.add(sauna);
  publish();
  fetch("cardmod.css").then((r) => r.text()).then((css) => {
    const m = css.match(/\/\* ── card-mod-card ── \*\/([\s\S]*?)(?=\/\* ── card-mod-|$)/);
    if (!m) return;
    for (const el of listeners) { const st = document.createElement("style"); st.textContent = m[1]; el.shadowRoot.appendChild(st); }
  });
});

// ── harness controls ─────────────────────────────────────────────────────
const html = document.documentElement;
const q = new URLSearchParams(location.search);
function setMode(mode) { html.dataset.mode = mode; document.querySelector("#mode-toggle .t").textContent = mode === "dark" ? "Dark · 墨" : "Light · washi"; }
document.getElementById("mode-toggle").addEventListener("click", () => setMode(html.dataset.mode === "dark" ? "light" : "dark"));
setMode(q.get("mode") || "dark");

let heatTimer = null;
function simulateHeatUp() {
  set("climate.hot_tub", { attributes: { temperature: 39.5 } });
  set("binary_sensor.hot_tub_heating", { state: "on" });
  publish();
  clearInterval(heatTimer);
  heatTimer = setInterval(() => {
    const s = states["climate.hot_tub"];
    const tgt = s.attributes.temperature;
    if (s.attributes.current_temperature >= tgt) { set("binary_sensor.hot_tub_heating", { state: "off" }); clearInterval(heatTimer); publish(); return; }
    set("climate.hot_tub", { attributes: { current_temperature: Math.min(tgt, s.attributes.current_temperature + 0.2) } });
    publish();
  }, 400);
}
document.getElementById("sim-heat").addEventListener("click", simulateHeatUp);
document.getElementById("sim-bubbles").addEventListener("click", () => callService("switch", "toggle", { entity_id: "switch.hot_tub_bubbles" }));
document.getElementById("sim-manual").addEventListener("click", () => callService("climate", "set_temperature", { entity_id: "climate.hot_tub", temperature: 39.5 }));
document.getElementById("sim-overdue").addEventListener("click", () => { set("sensor.hot_tub_filter_days", { state: "20" }); publish(); });

if (q.get("heat") === "1") setTimeout(simulateHeatUp, 300);
if (q.get("bubbles") === "1") setTimeout(() => callService("switch", "toggle", { entity_id: "switch.hot_tub_bubbles" }), 300);
if (q.get("manual") === "1") setTimeout(() => callService("climate", "set_temperature", { entity_id: "climate.hot_tub", temperature: 39.5 }), 300);
if (q.get("overdue") === "1") setTimeout(() => { set("sensor.hot_tub_filter_days", { state: "20" }); publish(); }, 300);
if (q.get("edit")) setTimeout(() => { document.getElementById("tub")._openEditor(Number(q.get("edit"))); }, 500);
if (q.get("editflow")) setTimeout(() => {
  const tub = document.getElementById("tub");
  tub._openEditor(Number(q.get("editflow")));
  setTimeout(() => {
    const root = tub.shadowRoot;
    root.querySelector('[data-step="1"]').click();
    root.querySelector('[data-step="1"]').click();
    root.querySelector("[data-confirm]").click();
  }, 200);
}, 500);
// arm=<key> arms one counter's reset; arm=<key>,fire taps it a second time too
if (q.get("arm")) setTimeout(() => {
  const [key, fire] = q.get("arm").split(",");
  const tub = document.getElementById("tub");
  tub._tapService(key);
  if (fire === "fire") setTimeout(() => tub._tapService(key), 200);
}, 500);
void daysAgo;
