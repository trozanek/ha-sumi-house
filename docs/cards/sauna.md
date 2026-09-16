# sumi-sauna-card — specification

A single Lovelace card for the whole sauna: temperature, heating, session length,
both lights, music, and running cost. One device, one box — the rule the Wellness
view is built on.

Implemented as a custom web component in Shadow DOM, registered as a dashboard
resource at `/local/sumi-house/cards/sumi-sauna-card.js`. Prototype:
[`Concepts/sumi-house-mock.html`](../../Concepts/sumi-house-mock.html), Wellness tab.

- **Status:** built (v0.1.0) — `www/sumi-house/cards/sumi-sauna-card.js`, exercised against a fake `hass` in `preview/sauna.html`; not yet run on a live instance
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
| Now playing, playlist, speaker | `media_player` entities + media source folders |
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
| `media_player.*` speakers | Google Cast | no — media strip hides if absent |

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
  default_speaker: media_player.sauna
  speakers:
    - { entity: media_player.sauna,       name: Sauna }
    - { entity: media_player.terrace,     name: Terrace }
    - { entity: media_player.pool,        name: Pool }
    - { entity: media_player.onsen_group, name: Onsen group }
  playlists:
    - { name: Onsen,        path: "media-source://media_source/local/Music/Onsen" }
    - { name: Shakuhachi,   path: "media-source://media_source/local/Music/Shakuhachi" }
    - { name: Rain,         path: "media-source://media_source/local/Music/Rain" }
    - { name: Koto,         path: "media-source://media_source/local/Music/Koto" }
    - { name: Ambient jazz, path: "media-source://media_source/local/Music/Ambient jazz" }
  shuffle: true
  queue_window: 20                   # tracks pushed to the speaker at once
  queue_refill_at: 5                 # top up when this many remain

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

## 7. Media — and how playlists are defined

You asked how to define playlists over files on a shared drive. Here is the answer,
and the reasoning, because the obvious approach does not work.

### 7.1 Why not .m3u

The natural instinct is an `.m3u` file per playlist. **Do not** — Home Assistant's
Cast integration parses `.m3u` and `.pls` and then plays only the *first* entry
(core [PR #70047](https://github.com/home-assistant/core/pull/70047)). You would get
one track and silence. M3U only becomes useful with Music Assistant in the picture,
which you have chosen not to run for now.

### 7.2 A playlist is a folder

```
//shared-drive/Music/
├── Onsen/           ← a playlist
├── Shakuhachi/      ← a playlist
├── Rain/
├── Koto/
└── Ambient jazz/
```

Setup:

1. Mount the share in HA: **Settings → System → Storage → Add network storage**,
   protocol SMB, usage **Media**. It appears under the local media source
   automatically — no `media_dirs` editing, no restart.
2. Each top-level folder under `Music/` is a playlist. To add one, make a folder
   and drop files in it.
3. List it in the card's `media.playlists` with its `media-source://` path.

Adding a playlist is a one-line YAML edit. That is the cost of not running Music
Assistant, and it is a small one at five playlists.

### 7.3 How the card plays one

There is no queue service without Music Assistant, so the card builds the queue:

1. `hass.callWS({ type: 'media_source/browse_media', media_content_id: <path> })`
2. Keep `children` where `can_play` is true; sort by title, or shuffle if
   `media.shuffle`.
3. First track: `media_player.play_media` with `enqueue: replace`.
4. Next `queue_window − 1` tracks: same action with `enqueue: add`.
5. Watch the speaker; when fewer than `queue_refill_at` tracks remain, push the next
   batch.

`media_content_id` is passed as the `media-source://` URI — the `play_media` service
resolves it to a signed HTTP URL server-side. `media_content_type` is `music`.

**The one weakness of this design, stated plainly:** HA signs those URLs with an
expiry. A forty-track queue pushed at once risks the tail expiring before it plays.
The rolling window above is the mitigation, and it is why `queue_window` is a config
knob rather than "enqueue everything". Verify the real expiry against your instance
when the card is built; if it bites, the fix is Music Assistant, whose whole purpose
is owning the queue properly. Treat that as the documented upgrade path.

### 7.4 Speakers

`media.speakers` is a plain list of Cast `media_player` entities. Selecting one sets
the target for every subsequent media action.

To play to several speakers at once, use a **Google Cast speaker group** created in
the Google Home app and list its entity like any other. Do not target several entity
ids in one call — they drift out of sync by a second or more, which in an open
terrace-and-sauna space is audible and unpleasant.

Transport uses the standard actions: `media_play_pause`, `media_previous_track`,
`media_next_track`, `volume_set`. Now-playing text comes from `media_title` and
`media_artist`, artwork from `entity_picture`.

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
│    [ Onsen            ▾ ]  [ Sauna speaker            ▾ ]          │
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
- [ ] Share mounted as media, one folder per playlist
- [x] Resource registered in `examples/resources.yaml`; full config in `examples/sauna-card.yaml`
- [ ] Verify `hvac_action` is present on your saunaBox firmware — if absent, the
      fallback is in play and the cost model is coarser
- [ ] Verify signed-URL expiry against a long playlist

---

## 11. Implementation notes (v0.1.0)

- The card renders its own `<ha-card>` inside its shadow root and sets `--sumi-seam-opacity`
  and `--sumi-active` on it while the entity is `heat`, so the theme's kintsugi seam and
  frame trace apply with no `card_mod` on the dashboard.
- Queue tracking without Music Assistant matches the speaker's `media_title` against the
  titles the card pushed; when a title is not found it assumes one track advanced. Good
  enough to refill in time, not a real queue position.
- The `- / +` buttons and the drag share one debounce (`commit_delay`), then an optimistic
  hold (`optimistic_hold`) during which inbound `temperature` changes are ignored; the
  entity wins when the hold expires.
- Test harness: `python3 scripts/preview.py` then open `/preview/sauna.html`
  (`?heat=1` starts a simulated heat-up). Every action is logged on the page.
