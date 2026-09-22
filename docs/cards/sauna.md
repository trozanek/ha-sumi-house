# sumi-sauna-card — specification

A single Lovelace card for the whole sauna: temperature, heating, session length,
both lights, music, and running cost. One device, one box — the rule the Wellness
view is built on.

Implemented as a custom web component in Shadow DOM, registered as a dashboard
resource at `/local/sumi-house/cards/sumi-sauna-card.js`. Prototype:
[`Concepts/sumi-house-mock.html`](../../Concepts/sumi-house-mock.html), Wellness tab.

- **Status:** built (v0.3.0) — `www/sumi-house/cards/sumi-sauna-card.js`, exercised against a fake `hass` in `preview/sauna.html`; not yet run on a live instance
- **Hardware:** BleBox saunaBox (WiFi sauna controller), 9 kW element
- **Package:** [`packages/sumi_sauna.yaml`](../../packages/sumi_sauna.yaml) — required

---

## 1. What the card owns

| Region | Source of truth |
|---|---|
| Arc gauge, current and target temperature | the `climate` entity |
| Heating on/off | the `climate` entity |
| Session length and auto-off countdown | `input_select` + `timer` from the package |
| Vestibule light | a `light` entity |
| Bench LED and its colour | a `light` entity with `rgb_color` / `effect` |
| Now playing, playlist, speaker | the SpotifyPlus `media_player` entity, targeting a Spotify Connect device |
| Month and year-to-date cost | template sensors from the package |

The card **reads state and calls actions**. It holds no state of its own except
transient UI state during a drag. Everything survives a browser reload because it
lives in HA.

---

## 2. Entity contract

### 2.1 The saunaBox climate entity

The BleBox integration adds saunaBox as a **single `climate` entity** — there is no
separate temperature sensor, switch or power meter. Everything the card knows about
the sauna comes from this one entity:

| What | Where |
|---|---|
| Current temperature | `state_attr(entity, 'current_temperature')` |
| Target temperature | `state_attr(entity, 'temperature')` |
| On / off | entity state is `heat` or `off` |
| Range the device accepts | `min_temp` / `max_temp` attributes |
| Step | `target_temp_step` attribute, if present |
| Element actually firing | `hvac_action` — `heating` or `idle`, **if the firmware reports it** |

Actions:

```yaml
climate.set_temperature:   { entity_id: climate.sauna, temperature: 85 }
climate.set_hvac_mode:     { entity_id: climate.sauna, hvac_mode: heat }   # or "off"
```

`hvac_action` is the one attribute that may be missing. The package's
`binary_sensor.sauna_heating` handles both cases, and the card reads that sensor
rather than the attribute, so the card does not need to care.

### 2.2 Everything else

| Entity | Provided by | Required |
|---|---|---|
| `input_select.sauna_session_length` | package | yes |
| `timer.sauna_session` | package | yes |
| `binary_sensor.sauna_heating` | package | yes |
| `sensor.sauna_cost_monthly` / `_yearly` | package | no — cost block hides if absent |
| `light.*` vestibule and bench | your lighting setup | no — rows hide if absent |
| `media_player.spotifyplus` | SpotifyPlus | no — media strip hides if absent |

Every optional block degrades by disappearing, never by rendering empty.

---

## 3. Card configuration

```yaml
type: custom:sumi-sauna-card
entity: climate.sauna                # required

name: Sauna                          # default: Sauna
kanji: 蒸                            # default: 蒸
accent: oak                          # oak | mizu | moss | copper — default oak
gauge: arc                           # arc | ring — default arc

temperature:
  min: 20                            # default: entity min_temp, else 20
  max: 110                           # default: entity max_temp, else 110
  step: 1                            # drag granularity — default target_temp_step, else 1
  step_button: 5                     # what − and + move by — default 5
  commit_delay: 400                  # ms of stillness before set_temperature fires
  optimistic_hold: 2000              # ms to ignore incoming state after writing

session:
  select: input_select.sauna_session_length
  timer: timer.sauna_session

lights:
  vestibule:
    entity: light.sauna_vestibule
    name: Vestibule light
  bench:
    entity: light.sauna_bench_led
    name: Bench LED
    colors:
      - { name: Ember, rgb: [192, 117,  74] }
      - { name: Oak,   rgb: [200, 159, 110] }
      - { name: Washi, rgb: [239, 231, 215] }
      - { name: Moss,  rgb: [139, 150, 120] }
      - { name: Mizu,  rgb: [126, 147, 160] }
      - { name: Deep,  rgb: [ 74,  58, 107] }
      - { name: Fade,  effect: "Slow Fade", gradient: ["#C0754A", "#4A3A6B"] }

media:
  entity: media_player.spotifyplus     # the one SpotifyPlus entity — always used, default shown
  default_speaker: "Sauna Echo"        # Spotify Connect device id or name — default: first of `speakers`
  speakers:
    - { id: "Sauna Echo",   name: Sauna }
    - { id: "Terrace Echo", name: Terrace }
    - { id: "Pool Echo",    name: Pool }
    - { id: "Onsen group",  name: Onsen group }
  playlists:
    - { name: Onsen,        uri: "spotify:playlist:REPLACE_WITH_ONSEN_PLAYLIST_ID" }
    - { name: Shakuhachi,   uri: "spotify:playlist:REPLACE_WITH_SHAKUHACHI_PLAYLIST_ID" }
    - { name: Rain,         uri: "spotify:playlist:REPLACE_WITH_RAIN_PLAYLIST_ID" }
    - { name: Koto,         uri: "spotify:playlist:REPLACE_WITH_KOTO_PLAYLIST_ID" }
    - { name: Ambient jazz, uri: "spotify:playlist:REPLACE_WITH_AMBIENT_JAZZ_PLAYLIST_ID" }
  shuffle: true

cost:
  monthly: sensor.sauna_cost_monthly
  yearly: sensor.sauna_cost_yearly
  currency: "zł"
  hours_monthly: sensor.sauna_hours_monthly    # optional, shown as a tooltip
```

`entity` is the only required key. Everything else has a default or hides itself.

---

## 4. Temperature and the gauge

### 4.1 Range

The card takes its range from `temperature.min` / `temperature.max` when set,
otherwise from the entity's own `min_temp` / `max_temp`, otherwise 20–110 °C.
A YAML range narrower than the device's is respected — this is the intended way
to stop anyone dialling 110 °C by accident. A YAML range **wider** than the device's
is clamped to the device's on write, and the card logs once to the console.

### 4.2 What the two indicators mean

- The **filled arc** is the current temperature across the range. It grows as the
  room heats.
- The **handle** is the target. It does not move while heating.

So "how far along am I" and "where am I going" are two different marks. The arc
reaching the handle is the sauna being ready.

Sweep is 270°, gap at the bottom, starting bottom-left and running clockwise.
Local angle → temperature: `min + (angle / 270) × (max − min)`.

### 4.3 Writing a temperature — debounce and optimistic hold

saunaBox is a small WiFi device on a local HTTP API. A `pointermove` handler that
calls `climate.set_temperature` on every frame will flood it and the card will
stutter as stale states arrive.

The card must:

1. Update its own display immediately on every pointer event — 60 fps, no service call.
2. Call `climate.set_temperature` once, `commit_delay` ms after the last movement.
3. Ignore inbound `temperature` attribute changes for `optimistic_hold` ms after
   writing, so the handle does not snap back to the old value while the device
   catches up.
4. Re-sync to the entity unconditionally once the hold expires. The device wins.

The same debounce covers the − and + buttons, so holding + does one write, not twenty.

### 4.4 The kintsugi seam

The seam ignites while the entity state is **`heat`** — that is, while the session
is running — not while `binary_sensor.sauna_heating` is on.

This is deliberate and is the one place the card departs from "seam follows the
element". A thermostat at temperature cycles its element every minute or two; a seam
bound to `hvac_action` would blink on and off for the whole session, which is both
ugly and meaningless. The sauna being *on* is the true state worth marking.

`binary_sensor.sauna_heating` still drives the status pill (`Heating` vs `Ready`)
and all the cost accounting.

---

## 5. Session length

The chips write `input_select.sauna_session_length`; the package's automations turn
that into a real auto-off. The card never schedules anything itself — a countdown
held in a browser tab dies with the tab.

Behaviour:

| Event | Result |
|---|---|
| Heater turns on | start time stamped, timer starts at the selected length |
| Timer finishes | `climate.set_hvac_mode: off` |
| Heater turned off by hand (or from the card) | timer cancelled |
| Length changed mid-session | timer restarts at `new length − elapsed` |
| Length changed to one already elapsed | session ends now |

That last pair is the part worth getting right: picking 90 m twenty minutes into a
session leaves seventy minutes, not ninety. The start time, not the moment of the
change, is the anchor.

The card displays `timer.sauna_session`'s remaining time in the `.geta` line
(`Auto-off in 68 min`). Read it from the `finishes_at` attribute while the timer is
`active` and tick locally; do not poll.

---

## 6. Lights

Two independent `light` entities, two toggle rows, one swatch row.

**Vestibule** — a plain `light.toggle`. No colour.

**Bench LED** — toggle plus swatches. A swatch calls:

```yaml
# a colour swatch
light.turn_on: { entity_id: light.sauna_bench_led, rgb_color: [192, 117, 74] }

# an effect swatch
light.turn_on: { entity_id: light.sauna_bench_led, effect: "Slow Fade" }
```

Rules:

- Tapping a swatch on an off light turns it on at that colour. Two taps to change
  a colour is one tap too many.
- The active swatch is derived from the entity, not from what was last clicked:
  match `effect` first, then `rgb_color` within a tolerance of ±12 per channel
  (bulbs round-trip RGB imprecisely).
- A swatch whose `effect` is not in the entity's `effect_list` renders disabled
  rather than failing at tap time.
- If the entity's `supported_color_modes` contains no colour mode, the swatch row
  hides and only the toggle shows.

---

## 7. Media — SpotifyPlus

Music runs through [SpotifyPlus](https://github.com/thlucas1/homeassistantplugin-spotifyplus),
a custom integration that adds a single `media_player` entity you control like any
other, plus the ability to target playback at any Spotify Connect device on the
network. This replaced an earlier Cast/media-source-folder design built around
*not* running Music Assistant — that assumption no longer holds on the live
instance (`CLAUDE.md` §5), so the card now speaks SpotifyPlus directly instead of
building its own playback queue.

### 7.1 One entity, always

Every media action the card performs — playlist selection, transport, volume — is a
service call against a single `media.entity` (default `media_player.spotifyplus`).
There is no per-speaker `media_player` entity the way Cast had one; instead, which
physical speaker that one entity is heard on is a `device_id` parameter passed on
the calls that need it. This is deliberate: one entity is one source of truth for
what's playing, and the speaker is just where it's routed.

### 7.2 Playlists are Spotify context URIs

```yaml
playlists:
  - { name: Onsen, uri: "spotify:playlist:37i9dQZF1DXbcx..." }
```

Find a playlist's URI in Spotify: **⋯ → Share → Copy Spotify URI** on the playlist,
or the last segment of its share link (`open.spotify.com/playlist/<id>` →
`spotify:playlist:<id>`). No folders, no file management — adding a playlist is a
one-line YAML edit, same as before, just pointed at Spotify instead of a share.

Selecting one calls:

```yaml
spotifyplus.player_media_play_context:
  entity_id: media_player.spotifyplus
  context_uri: spotify:playlist:37i9dQZF1DXbcx...
  device_id: "Sauna Echo"       # the currently selected speaker, if any
  shuffle: true                 # media.shuffle
```

A context URI **is** a queue — Spotify shuffles and advances it server-side, so all
of the old queue-building/refill logic (browsing a media-source folder, pushing a
rolling window of tracks, waiting for the receiver to confirm the opening track
before enqueueing the rest) is gone. That entire design existed to work around Cast
having no server-owned queue; SpotifyPlus doesn't have that problem.

### 7.3 Speakers are Spotify Connect devices

```yaml
speakers:
  - { id: "Sauna Echo", name: Sauna }
```

`id` is passed as `device_id` on the SpotifyPlus service calls — verify against
`spotifyplus.get_spotify_connect_devices` in **Developer Tools → Actions** whether
your instance wants the device's ID or its exact display name; both are shown
side by side in the dev-tools response. `default_speaker` seeds `id`; if unset, the
first entry in `speakers` is used.

Picking a speaker in the dropdown does one of two things:

- **Nothing is playing** — the picked device becomes the target the next playlist
  (or library pick) plays to. No service call happens until playback starts.
- **Something is already playing** — the session moves live via
  `spotifyplus.player_transfer_playback` (`device_id`, `play: true`), so switching
  speakers mid-track doesn't stop the music.

Transport uses the standard actions against `media.entity`: `media_play_pause`,
`media_previous_track`, `media_next_track`, `volume_set`. Now-playing text comes
from `media_title` and `media_artist`, artwork from `entity_picture` — unchanged
from before, since those are just the entity's own state.

### 7.4 Browsing the full library

Next to the playlist dropdown, a small grid-icon button opens HA's own media
browser against `media.entity`:

```js
this.dispatchEvent(new CustomEvent("hass-more-info", {
  detail: { entityId: this._config.media.entity },
  bubbles: true, composed: true,
}));
```

This is the same more-info dialog any entity opens, and SpotifyPlus's
`async_browse_media` support (mirroring the core Spotify integration) gives it a
built-in "browse media" affordance there — categories, albums, artists, shows, your
saved tracks — with no picker UI or callback plumbing to build in the card itself.
Selecting a playable item in that browser plays it on whatever device
`media.entity` is currently targeting (i.e. your last speaker pick), the same as
choosing a playlist from the dropdown.

Two things worth verifying on the live instance before relying on this, same as the
service names below: that the `media_player.spotifyplus` entity actually reports
`browse_media` among its supported features, and that its browse tree is populated
(it depends on the SpotifyPlus config entry's Spotify account scopes).

### 7.5 What's unverified

This design is built from SpotifyPlus's documented service surface, not a live
Developer Tools session (no internet access when this card was written). Before
wiring it up for real, check **Developer Tools → Actions** on your instance for:

- `spotifyplus.player_media_play_context` — field names `context_uri`, `device_id`,
  `shuffle`
- `spotifyplus.player_transfer_playback` — field names `device_id`, `play`
- `spotifyplus.get_spotify_connect_devices` — to read real device ids/names for
  `media.speakers`

If a name is off, it's a small, contained fix in `_playPlaylist` / `_transferPlayback`
in `www/sumi-house/cards/sumi-sauna-card.js` — the rest of the card (entity contract,
UI, everything else in this doc) is unaffected.

---

## 8. Cost

saunaBox has no power metering, so cost is modelled rather than measured.

```
binary_sensor.sauna_heating          element on?  (hvac_action, or the fallback)
        ↓
sensor.sauna_power                   9000 W while on, 0 while off
        ↓  Riemann sum, left method
sensor.sauna_energy                  kWh, monotonic
        ↓  utility_meter
sensor.sauna_energy_monthly / _yearly    calendar month and calendar year
        ↓  × input_number.energy_price          (shared — sumi_common.yaml)
sensor.sauna_cost_monthly / _yearly      PLN
```

Both rates are `input_number` helpers, not constants. The heater rating is
sauna-specific (`input_number.sauna_heater_power`); the tariff is **house-wide**
(`input_number.energy_price`, in
[`packages/sumi_common.yaml`](../../packages/sumi_common.yaml)) and shared with the
hot tub, so a tariff change is one edit and the two can never silently diverge.

Notes:

- **Left** Riemann is correct here. The element is a step function: it holds its
  value until the next change, so the rectangle to the *left* of each transition is
  the true area. `method: trapezoidal` would systematically under-count.
- `max_sub_interval: "00:01:00"` keeps the integral advancing during a long unbroken
  heating run, when no state change would otherwise trigger it.
- `utility_meter` cycles on the **calendar** month and year, so "September" means
  1–30 September, and the counter resets itself.
- Expect this to land within roughly 10% of a real meter. It assumes the element is
  either at full rated load or off. If the heater has multiple stages, or a soft
  start, the model will read slightly high.
- `sensor.sauna_energy` can be added to the HA Energy dashboard as an individual
  device, which gets you a real history for free.

If you later fit a clamp meter or an energy-monitoring relay, replace
`sensor.sauna_power` with the real one and the entire chain below it keeps working
unchanged. That is why the chain is built in this order.

---

## 9. Layout

Follows the vessel skeleton established in the Wellness view of the prototype —
gauge beside its controls, never above them:

```
┌─ vhead ──────────────────────────────── 蒸 SAUNA          [ IDLE ] ─┐
│ ┌ vleft ──────┐  ┌ vright ───────────────────────────────────────┐ │
│ │   arc 104px │  │ Heating            Last · yesterday 21:10 [⊙] │ │
│ │     64 °C   │  │ Session            [60m] [90m] [120m]         │ │
│ │     → 85°   │  │ Vestibule light                           [⊙] │ │
│ │   [−]  [+]  │  │ Bench LED          Ember · solid          [⊙] │ │
│ │  COOLING    │  │ ● ● ● ● ● ● ●                                 │ │
│ └─────────────┘  └───────────────────────────────────────────────┘ │
│ ── [art] Shakuhachi — Evening Rain          ◁◁  ▷  ▷▷   28% ────── │
│    [ Onsen            ▾ ]  [⊞]  [ Sauna speaker        ▾ ]          │
│ ── SEPTEMBER 214 zł    YEAR TO DATE 1 840 zł ───────────────────── │
└────────────────────────────────────────────────────────────────────┘
```

Tokens, spacing and the seam behaviour come from the theme — the card must consume
`var(--sumi-*)` and define no colours of its own, so switching the theme re-skins it.

---

## 10. Build checklist

- [x] `www/sumi-house/cards/sumi-sauna-card.js` — Shadow DOM, `setConfig`, `hass` setter
- [x] `getConfigElement` / `getStubConfig` for the visual editor (entity, name, kanji, accent, gauge; the rest stays YAML)
- [ ] `packages/sumi_sauna.yaml` installed and reloaded ✔ *(written)*
- [ ] `packages/sumi_common.yaml` installed, `input_number.energy_price` set to `0.98`
- [ ] `input_number.sauna_heater_power` set to `9`
- [ ] SpotifyPlus integration configured; `media.entity` resolves to a real `media_player.spotifyplus`
- [x] Resource registered in `examples/resources.yaml`; full config in `examples/sauna-card.yaml`
- [ ] Verify `hvac_action` is present on your saunaBox firmware — if absent, the
      fallback is in play and the cost model is coarser
- [ ] Verify `spotifyplus.player_media_play_context` / `player_transfer_playback` service
      and field names in Developer Tools → Actions (§7.5); replace placeholder playlist
      URIs in `examples/sauna-card.yaml` with real ones
- [ ] Verify the SpotifyPlus entity reports `browse_media` support before relying on the
      library button (§7.4)

---

## 11. Implementation notes (v0.1.0)

- The card renders its own `<ha-card>` inside its shadow root and sets `--sumi-seam-opacity`
  and `--sumi-active` on it while the entity is `heat`, so the theme's kintsugi seam and
  frame trace apply with no `card_mod` on the dashboard.
- The `- / +` buttons and the drag share one debounce (`commit_delay`), then an optimistic
  hold (`optimistic_hold`) during which inbound `temperature` changes are ignored; the
  entity wins when the hold expires.
- Test harness: `python3 scripts/preview.py` then open `/preview/sauna.html`
  (`?heat=1` starts a simulated heat-up). Every action is logged on the page.

### v0.2.1

- Fixed: the (now removed) Cast queue-builder waited for the speaker to confirm the
  opening track before enqueueing the rest of the batch, instead of firing every
  `play_media` call back-to-back — the previous behaviour was the reported "plays only
  one song" bug. See v0.3.0 below: this whole design was later replaced.

### v0.3.0

- **Replaced Cast/media-source-folder playback with SpotifyPlus** (§7). One
  `media_player.spotifyplus` entity is now always used; the playlist dropdown lists
  Spotify context URIs (`spotifyplus.player_media_play_context`) and the speaker
  dropdown lists Spotify Connect device targets (`device_id`), carried over live via
  `spotifyplus.player_transfer_playback` when playback is already running. The old
  queue-building/refill code (`_pushQueue`, `_waitForTrack`, `_maybeRefillQueue`) is
  gone — a Spotify context URI is itself a server-owned queue.
- **Added a library-browse button** next to the playlist dropdown. It opens HA's
  standard more-info dialog for the SpotifyPlus entity (`hass-more-info` event),
  which — via SpotifyPlus's `async_browse_media` support — exposes the full Spotify
  library (albums, artists, shows, saved tracks), not just the preset playlists
  (§7.4). No custom picker UI was needed for this.
- Config schema change: `media.speakers[].entity` → `media.speakers[].id` (a Connect
  device id/name, not an entity id); `media.playlists[].path` → `media.playlists[].uri`
  (a `spotify:playlist:<id>` context URI); `media.queue_window` / `queue_refill_at`
  removed (no longer meaningful).
