/* Fake `hass` for exercising sumi-sauna-card without Home Assistant.
   Actions mutate the fake state and are logged; the card re-renders from state. */

const log = document.getElementById("log");
const say = (msg) => { log.innerHTML = `<b>${new Date().toLocaleTimeString()}</b> ${msg}\n` + log.innerHTML; };

const now = () => new Date().toISOString();
const states = {
  "climate.sauna": { entity_id: "climate.sauna", state: "off", last_changed: new Date(Date.now() - 26 * 3600e3).toISOString(),
    attributes: { current_temperature: 64, temperature: 85, min_temp: 20, max_temp: 110, target_temp_step: 1, hvac_action: "off", friendly_name: "Sauna" } },
  "binary_sensor.sauna_heating": { entity_id: "binary_sensor.sauna_heating", state: "off", attributes: {} },
  "input_select.sauna_session_length": { entity_id: "input_select.sauna_session_length", state: "90", attributes: { options: ["60", "90", "120"] } },
  "timer.sauna_session": { entity_id: "timer.sauna_session", state: "idle", attributes: {} },
  "light.sauna_vestibule": { entity_id: "light.sauna_vestibule", state: "on", attributes: { supported_color_modes: ["onoff"] } },
  "light.sauna_bench_led": { entity_id: "light.sauna_bench_led", state: "on",
    attributes: { supported_color_modes: ["rgb"], rgb_color: [190, 118, 76], effect: "None", effect_list: ["None", "Slow Fade"], brightness: 180 } },
  "media_player.spotifyplus": { entity_id: "media_player.spotifyplus", state: "playing",
    attributes: { media_title: "Evening Rain", media_artist: "Shakuhachi", volume_level: 0.28, friendly_name: "SpotifyPlus" } },
  "sensor.sauna_cost_monthly": { entity_id: "sensor.sauna_cost_monthly", state: "214.3", attributes: {} },
  "sensor.sauna_cost_yearly": { entity_id: "sensor.sauna_cost_yearly", state: "1840", attributes: {} },
  "sensor.sauna_hours_monthly": { entity_id: "sensor.sauna_hours_monthly", state: "23.8", attributes: {} },
};

const listeners = new Set();
function publish() {
  const hass = makeHass();
  listeners.forEach((el) => { el.hass = hass; });
}
function set(id, patch) {
  const s = states[id];
  const next = { ...s, ...patch, attributes: { ...s.attributes, ...(patch.attributes || {}) } };
  if (patch.state !== undefined && patch.state !== s.state) next.last_changed = now();
  states[id] = next;
}

const tracks = ["Evening Rain", "Bamboo Grove", "Steam and Stone", "Cedar Smoke", "Cold Plunge", "Lantern", "Ash", "Onsen Dawn"];

function callService(domain, service, data) {
  say(`${domain}.${service} ${JSON.stringify(data)}`);
  const id = data.entity_id;
  switch (`${domain}.${service}`) {
    case "climate.set_temperature": set(id, { attributes: { temperature: data.temperature } }); break;
    case "climate.set_hvac_mode":
      set(id, { state: data.hvac_mode, attributes: { hvac_action: data.hvac_mode === "heat" ? "heating" : "off" } });
      set("binary_sensor.sauna_heating", { state: data.hvac_mode === "heat" ? "on" : "off" });
      if (data.hvac_mode === "heat") {
        const mins = Number(states["input_select.sauna_session_length"].state);
        set("timer.sauna_session", { state: "active", attributes: { finishes_at: new Date(Date.now() + mins * 60000).toISOString() } });
      } else {
        set("timer.sauna_session", { state: "idle", attributes: {} });
      }
      break;
    case "input_select.select_option": set(id, { state: data.option }); break;
    case "light.toggle": set(id, { state: states[id].state === "on" ? "off" : "on" }); break;
    case "light.turn_on": {
      const attrs = {};
      if (data.rgb_color) { attrs.rgb_color = data.rgb_color.map((v) => v + 2); attrs.effect = "None"; }
      if (data.effect) attrs.effect = data.effect;
      set(id, { state: "on", attributes: attrs }); break;
    }
    case "media_player.media_play_pause": set(id, { state: states[id].state === "playing" ? "paused" : "playing" }); break;
    case "media_player.media_next_track":
    case "media_player.media_previous_track": {
      const cur = tracks.indexOf(states[id].attributes.media_title);
      const nxt = tracks[(cur + (service.includes("next") ? 1 : tracks.length - 1)) % tracks.length];
      set(id, { attributes: { media_title: nxt } }); break;
    }
    case "media_player.volume_set": set(id, { attributes: { volume_level: data.volume_level } }); break;
    case "spotifyplus.player_media_play_context": {
      const name = data.context_uri.split(":").pop();
      set(id, { state: "playing", attributes: { media_title: tracks[Math.floor(Math.random() * tracks.length)], media_artist: name } });
      break;
    }
    case "spotifyplus.player_transfer_playback":
      set(id, { state: data.play ? "playing" : states[id].state });
      break;
  }
  setTimeout(publish, 120); // a little latency, like a real device
  return Promise.resolve();
}

function callWS(msg) {
  say(`ws ${JSON.stringify(msg)}`);
  return Promise.resolve({});
}

function makeHass() {
  return { states, locale: { language: "pl" }, language: "pl", callService, callWS };
}

// ── mount the cards ──────────────────────────────────────────────────────────
const full = {
  entity: "climate.sauna", accent: "oak", gauge: "arc",
  temperature: { min: 40, max: 100 },
  lights: {
    vestibule: { entity: "light.sauna_vestibule", name: "Vestibule light" },
    bench: { entity: "light.sauna_bench_led", name: "Bench LED", colors: [
      { name: "Ember", rgb: [192, 117, 74] }, { name: "Oak", rgb: [200, 159, 110] }, { name: "Washi", rgb: [239, 231, 215] },
      { name: "Moss", rgb: [139, 150, 120] }, { name: "Mizu", rgb: [126, 147, 160] }, { name: "Deep", rgb: [74, 58, 107] },
      { name: "Fade", effect: "Slow Fade", gradient: ["#C0754A", "#4A3A6B"] }, { name: "Storm", effect: "Storm", gradient: ["#333", "#7E93A0"] } ] },
  },
  media: { entity: "media_player.spotifyplus", default_speaker: "Sauna Echo",
    speakers: [{ id: "Sauna Echo", name: "Sauna" }, { id: "Terrace Echo", name: "Terrace" }],
    playlists: [{ name: "Onsen", uri: "spotify:playlist:onsen" }, { name: "Rain", uri: "spotify:playlist:rain" }],
    shuffle: true },
  cost: { monthly: "sensor.sauna_cost_monthly", yearly: "sensor.sauna_cost_yearly", currency: "zł", hours_monthly: "sensor.sauna_hours_monthly" },
};
const minimal = { entity: "climate.sauna", name: "Sauna (minimal)", accent: "mizu", gauge: "ring" };

// this standalone harness has no real HA frontend to catch `hass-more-info` and open
// the actual browse-media dialog — just log it, so the button is visibly wired up
document.addEventListener("hass-more-info", (ev) => {
  say(`hass-more-info → ${ev.detail.entityId} <i>(no real more-info dialog outside HA; opens the Spotify library there)</i>`);
});

customElements.whenDefined("sumi-sauna-card").then(() => {
  const c1 = document.getElementById("card"); c1.setConfig(full); listeners.add(c1);
  const c2 = document.getElementById("card2"); c2.setConfig(minimal); listeners.add(c2);
  publish();
  // emulate card-mod: inject the theme's card-mod-card block into each card's shadow root
  fetch("cardmod.css").then((r) => r.text()).then((css) => {
    const m = css.match(/\/\* ── card-mod-card ── \*\/([\s\S]*?)(?=\/\* ── card-mod-|$)/);
    if (!m) return;
    for (const el of listeners) { const st = document.createElement("style"); st.textContent = m[1]; el.shadowRoot.appendChild(st); }
  });
});

// ── harness controls ─────────────────────────────────────────────────────────
const html = document.documentElement;
const q = new URLSearchParams(location.search);
function setMode(mode) { html.dataset.mode = mode; document.querySelector("#mode-toggle .t").textContent = mode === "dark" ? "Dark · 墨" : "Light · washi"; }
document.getElementById("mode-toggle").addEventListener("click", () => setMode(html.dataset.mode === "dark" ? "light" : "dark"));
setMode(q.get("mode") || "dark");

let heatTimer = null;
function simulateHeating() {
  callService("climate", "set_hvac_mode", { entity_id: "climate.sauna", hvac_mode: "heat" });
  clearInterval(heatTimer);
  heatTimer = setInterval(() => {
    const s = states["climate.sauna"];
    if (s.state !== "heat") { clearInterval(heatTimer); return; }
    const cur = Math.min(s.attributes.temperature, s.attributes.current_temperature + 1);
    set("climate.sauna", { attributes: { current_temperature: cur, hvac_action: cur < s.attributes.temperature ? "heating" : "idle" } });
    set("binary_sensor.sauna_heating", { state: cur < s.attributes.temperature ? "on" : "off" });
    publish();
  }, 700);
}
document.getElementById("sim-heat").addEventListener("click", simulateHeating);
document.getElementById("sim-off").addEventListener("click", () => callService("climate", "set_hvac_mode", { entity_id: "climate.sauna", hvac_mode: "off" }));
document.getElementById("sim-unavail").addEventListener("click", () => {
  const s = states["media_player.spotifyplus"];
  set("media_player.spotifyplus", { state: s.state === "unavailable" ? "playing" : "unavailable" }); publish();
});
if (q.get("heat") === "1") setTimeout(simulateHeating, 300);
