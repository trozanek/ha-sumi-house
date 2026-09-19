# sumi-hot-tub-card — specification

A single Lovelace card for the whole hot tub: temperature, heater, pump and
bubbles, lighting, the daily schedule, four service counters, and running cost.
One device, one box — the rule the Wellness view is built on.

Sibling to [`sauna.md`](sauna.md). Everything structural is shared; everything
sensory is different, on purpose. See §2.

- **Status:** built (v0.2.0) — `www/sumi-house/cards/sumi-hot-tub-card.js`, sharing gauge
  geometry, drag/debounce and the swatch strip with `sumi-sauna-card` via
  `sumi-vessel-shared.js`; exercised side-by-side with the sauna card against a fake
  `hass` in `preview/hot-tub.html`. Not yet run on a live instance.
- **Hardware:** hot tub controller exposing one `climate` entity, switches for
  heater / pump / bubbles / light, four service counters with reset entities, and
  its own energy totals
- **Packages:** [`sumi_hot_tub.yaml`](../../packages/sumi_hot_tub.yaml) — required ·
  [`sumi_common.yaml`](../../packages/sumi_common.yaml) — required (tariff)

---

## 1. What the card owns

| Region | Source of truth |
|---|---|
| Ring gauge, current and target temperature | the `climate` entity |
| Heater, pump, bubbles | three `switch` entities |
| Light and its colour | a `light` entity with `rgb_color` / `effect` |
| Schedule on/off | `input_boolean` from the package |
| The four daily setpoints | `input_datetime` + `input_number` pairs |
| Four service counters | the controller's own "days since" sensors |
| Resetting a counter | the controller's own reset entities |
| Month and year-to-date cost | template sensors over the controller's energy totals |

The card holds no state of its own beyond transient drag and edit state. Reload the
browser and nothing is lost. Note how little of the above the package supplies — the
controller does most of the work, which is the main way this card differs from the
sauna's.

---

## 2. How it differs from the sauna card, and why

The two cards sit side by side in the Wellness view. They must read as a matched
pair without ever being mistaken for each other. The skeleton is identical; the
distinguishing marks are deliberate:

| | Sauna | Hot tub |
|---|---|---|
| Gauge | **270° open arc**, gap at the bottom | **360° closed ring** |
| Meaning | dry heat, escaping | contained water |
| Kanji | 蒸 | 湯 |
| Accent | `oak` | `mizu` |
| Range | 20–110 °C, ±5° steps | 20–40 °C, ±0.5° steps |
| On/off | one `climate` mode | separate `switch` entities |
| Time model | a **session** you start, with an end | a **schedule** that runs every day |
| Lights | two entities — vestibule + bench LED | one entity |
| Lower strips | now playing · playlist and speaker | schedule · service |
| Service tracking | — | four device counters |
| Energy | modelled from a 9 kW element | metered by the controller |

Both cards carry a light row with a swatch strip in the same position, so the colour
control is muscle memory across the pair. Form carries the difference, not colour —
copper cannot be spent on identity, it belongs to the seam.

---

## 3. Entity contract

### 3.1 The controller

| What | Where |
|---|---|
| Current temperature | `state_attr('climate.hot_tub', 'current_temperature')` |
| Target temperature | `state_attr('climate.hot_tub', 'temperature')` |
| Range the device accepts | `min_temp` / `max_temp` attributes |
| Heater | `switch.hot_tub_heater` |
| Circulation pump | `switch.hot_tub_pump` |
| Bubbles / blower | `switch.hot_tub_bubbles` |
| Light | `light.hot_tub` |
| Days since chloride / filter / rinse / water change | four sensors, counting **up** |
| Reset each counter | four entities, one per counter |
| Energy this month | `sensor.hot_tub_energy_monthly` (kWh) |
| Energy year to date | `sensor.hot_tub_energy_yearly` (kWh) |

The `climate` entity is used for **temperature only** — read current, read and
write target. Its own `hvac_mode` is ignored; `switch.hot_tub_heater` is
authoritative for whether the heater runs. Two sources of truth for one fact is
how a card ends up arguing with itself.

Actions used:

```yaml
climate.set_temperature: { entity_id: climate.hot_tub, temperature: 38.5 }
switch.turn_on:          { entity_id: switch.hot_tub_bubbles }
light.turn_on:           { entity_id: light.hot_tub, rgb_color: [126, 147, 160] }
```

> Entity ids above are placeholders. Replace them with your controller's real ids
> in the package — they appear in a handful of places, all flagged in its header.

### 3.2 From the packages

| Entity | Purpose |
|---|---|
| `input_boolean.tub_schedule_enabled` | the schedule toggle |
| `input_datetime.tub_slot_{1..4}_time` | when each setpoint takes effect |
| `input_number.tub_slot_{1..4}_temp` | what temperature it sets |
| `sensor.hot_tub_scheduled_temperature` | what the schedule says *right now* |
| `binary_sensor.hot_tub_heating` | climbing toward target, not merely "heater on" |
| `sensor.hot_tub_cost_monthly` / `_yearly` | PLN |
| `input_number.energy_price` | shared house tariff |

---

## 4. Card configuration

```yaml
type: custom:sumi-hot-tub-card
entity: climate.hot_tub              # required

name: Hot tub                        # default: Hot tub
kanji: 湯                            # default: 湯
accent: mizu                         # default mizu
gauge: ring                          # default ring

temperature:
  min: 20                            # default: entity min_temp, else 20
  max: 40                            # default: entity max_temp, else 40 — see §5.1
  step: 0.5
  step_button: 0.5
  commit_delay: 400                  # ms of stillness before set_temperature fires
  optimistic_hold: 2000              # ms to ignore inbound state after writing

switches:
  heater:  { entity: switch.hot_tub_heater,  name: Heater }
  pump:    { entity: switch.hot_tub_pump,    name: Pump }
  bubbles: { entity: switch.hot_tub_bubbles, name: Bubbles }

light:
  entity: light.hot_tub
  name: Light
  colors:
    - { name: Mizu,  rgb: [126, 147, 160] }
    - { name: Ember, rgb: [192, 117,  74] }
    - { name: Oak,   rgb: [200, 159, 110] }
    - { name: Washi, rgb: [239, 231, 215] }
    - { name: Moss,  rgb: [139, 150, 120] }
    - { name: Deep,  rgb: [ 74,  58, 107] }
    - { name: Fade,  effect: "Slow Fade", gradient: ["#7E93A0", "#4A3A6B"] }

schedule:
  enable: input_boolean.tub_schedule_enabled
  scheduled_temperature: sensor.hot_tub_scheduled_temperature
  slots:
    - { time: input_datetime.tub_slot_1_time, temp: input_number.tub_slot_1_temp }
    - { time: input_datetime.tub_slot_2_time, temp: input_number.tub_slot_2_temp }
    - { time: input_datetime.tub_slot_3_time, temp: input_number.tub_slot_3_temp }
    - { time: input_datetime.tub_slot_4_time, temp: input_number.tub_slot_4_temp }

service:
  confirm: true                      # tap arms, second tap resets — see §8.3
  confirm_seconds: 3
  items:
    - { key: chloride, label: Chloride, sensor: sensor.hot_tub_chloride_days, reset: switch.hot_tub_chloride_reset, every: 14d }
    - { key: filter,   label: Filter,   sensor: sensor.hot_tub_filter_days,   reset: switch.hot_tub_filter_reset,   every: 14d }
    - { key: rinse,    label: Rinse,    sensor: sensor.hot_tub_rinse_days,    reset: switch.hot_tub_rinse_reset,    every: 14d }
    - { key: water,    label: Water,    sensor: sensor.hot_tub_water_days,    reset: switch.hot_tub_water_reset,    every: 2mo }

cost:
  monthly: sensor.hot_tub_cost_monthly
  yearly: sensor.hot_tub_cost_yearly
  currency: "zł"
```

`entity` is the only required key. Every other block hides itself when absent.

---

## 5. Temperature

### 5.1 Range

From `temperature.min` / `max` when set, else the entity's `min_temp` / `max_temp`,
else **20–40 °C**.

Forty is the default ceiling on purpose. Most controllers enforce it in firmware,
and forty is already the top of the comfortable range. If yours reports a higher
`max_temp`, the card still honours the YAML value — set it explicitly and leave it
there.

### 5.2 The ring

A full 360° ring, starting at twelve o'clock and running clockwise. Filled arc is
current temperature across the range; the handle is target. Because a hot tub lives
near the top of its range, the ring reads as nearly closed most of the time — that
near-complete circle *is* the resting state, and a visibly open ring means something
is off.

Drag, debounce and optimistic hold are **identical to the sauna card** — paint at
60 fps, write once `commit_delay` ms after the last movement, then ignore inbound
state for `optimistic_hold` ms. Share the implementation; do not fork it.

### 5.3 The kintsugi seam — the hot tub's own rule

A sauna is off most of the time, so a seam while it runs is a real signal. **A hot
tub is on essentially always.** Binding the seam to "heater on" would leave copper
permanently on the Wellness view, which is precisely what the kintsugi rule exists
to prevent.

So the seam ignites when the tub is doing something *beyond holding*:

```
seam  =  binary_sensor.hot_tub_heating  OR  switch.hot_tub_bubbles is on
```

- **Heating** — climbing toward a setpoint it has not reached (more than 0.3 °C
  below target, heater on). Reaching temperature puts the seam out.
- **Bubbles** — chosen, transient, unmistakably active.
- **Pump alone does not ignite it.** Circulation is the tub's resting heartbeat, not
  an event.
- **The light does not ignite it either.** A lit tub at rest is still at rest.

Holding 38.5 °C with the pump ticking over is a hot tub at rest. No copper.

---

## 6. Heater, pump and bubbles

Three independent switches, two rows:

```
Heater            Holding 38.5° · 0.4 kW              [toggle]
Pump & bubbles    Circulation only            [Pump] [Bubbles]
```

Pump and bubbles are `.chiprow` chips, **not** `.steppers` — they are independent
toggles, and any chip group inside `.steppers` is made mutually exclusive by the
theme's own handler. This bit the prototype once already.

The heater sub-line is derived, not stored:

| Condition | Sub-line |
|---|---|
| heater off | `Off` |
| `binary_sensor.hot_tub_heating` on | `Heating · <n>° to go` |
| otherwise | `Holding <current>°` |

---

## 7. Lighting

One `light` entity: a toggle row plus a swatch strip, in the same position and with
the same behaviour as the sauna's bench LED. Learn it once, use it on both cards.

```
Light             Mizu · solid                        [toggle]
● ● ● ● ● ● ●
```

A swatch calls:

```yaml
# a colour swatch
light.turn_on: { entity_id: light.hot_tub, rgb_color: [126, 147, 160] }

# an effect swatch
light.turn_on: { entity_id: light.hot_tub, effect: "Slow Fade" }
```

Rules, identical to the sauna's:

- Tapping a swatch on an off light turns it on at that colour. Two taps to change a
  colour is one tap too many.
- The active swatch is derived from the entity, not from what was last clicked:
  match `effect` first, then `rgb_color` within ±12 per channel, because bulbs
  round-trip RGB imprecisely.
- A swatch whose `effect` is not in the entity's `effect_list` renders disabled
  rather than failing at tap time.
- If `supported_color_modes` contains no colour mode, the swatch strip hides and
  only the toggle shows.

The default swatch order leads with **Mizu** rather than Ember — the tub's own accent,
and the colour most people leave it on. The sauna leads with Ember for the same reason.
Same palette, different first step.

---

## 8. Schedule

One schedule, **the same every day** — four setpoints that differ only in time and
temperature. This is the whole model; there is no per-weekday variation and the card
must not imply one.

### 8.1 Display

A `.stripline` below the control rows:

```
06:00 · 36.0°     14:00 · 37.5°     17:30 · 38.5°     22:30 · 35.0°
```

Slots render in **time order**, regardless of the order the helpers are listed in.
The slot currently in force is marked with the accent; the rest are `--sumi-faint`.
Toggling the schedule off dims the whole line (`.stripline.off`), it does not empty it.

### 8.2 Editing

Tapping a slot swaps that strip into an inline editor — no dialog:

```
[ 17:30 ]   [ −  38.5°  + ]   [ ✓ ]
```

Writes go on confirm, never per keystroke: `input_datetime.set_datetime` for the
time, `input_number.set_value` for the temperature. Escape or tapping elsewhere
cancels.

### 8.3 What the automation does

`sensor.hot_tub_scheduled_temperature` resolves which setpoint is in force right now.
It contains `now()`, so HA re-renders it at the top of every minute. A single
automation reads it and applies it — triggered at each slot time, **and** whenever
the schedule is switched back on, so enabling it at 15:00 applies the 14:00 setpoint
immediately instead of waiting until 17:30.

Two behaviours worth knowing:

- **The heater is never scheduled off.** A slot sets a temperature and ensures the
  heater is on. A hot tub cools by lowering its setpoint, not by killing the heater —
  an overnight slot at 35 ° is the correct way to let it drop.
- **Before the day's first slot, the last slot of the day is still in force.** At
  04:00, the 22:30 setpoint is what should be applied, because it was set last night
  and nothing has superseded it. The sensor handles the wrap; the card does not need to.

The slot-picking logic is tested against fourteen cases including exact-boundary
times, out-of-order slot definitions, an unavailable helper, and all four slots
identical.

### 8.4 Manual override

If the schedule is enabled but the `climate` target differs from
`sensor.hot_tub_scheduled_temperature`, someone has moved the dial by hand. The card
shows a quiet note under the strip:

```
Manual 39.5° · schedule resumes 22:30
```

No banner, no warning colour. It resolves itself at the next slot, and saying so is
more useful than flagging it as a problem.

---

## 9. Service

Four counters, all owned by the controller:

```
CHLORIDE 5 d      FILTER 12 d      RINSE 4 d      WATER 51 d
```

### 9.1 The counters count up

Each sensor reports **days since that job was last done**, climbing from zero. The
interval lives in card config (`every:`), and the card shows what is left:

```
remaining = every − sensor_value
```

Display the remaining figure, not the raw sensor — "5 d" means five days until the
chloride is due, which is what you want to know standing next to the tub. The raw
days-since value belongs in the tooltip.

`every` grammar:

| Form | Meaning |
|---|---|
| `14d` | 14 days |
| `2w` | 2 weeks |
| `2mo` | two months, treated as 60 days |

Because the sensor is a day count rather than a date, months here are **60 days, not
calendar months** — there is no anchor date to add months to. The card must not
pretend otherwise.

> The starting intervals in §4 came from the six-way split discussed earlier
> (chloride tablet 14 d, filter clean 14 d, rinse 14 d, water 2 mo). Now that the
> device owns one counter per category, check what each one actually tracks and
> adjust — a "filter" counter measuring replacement rather than cleaning wants a
> month, not a fortnight.

### 9.2 Resetting

Each item names a `reset` entity that the controller exposes. The card fires it by
domain, so it works whatever the controller provides:

| Reset entity domain | Action called |
|---|---|
| `button`, `input_button` | `button.press` / `input_button.press` |
| `switch`, `input_boolean` | `switch.turn_on` / `input_boolean.turn_on` |
| `script`, `scene` | `script.turn_on` / `scene.turn_on` |

For a momentary `switch` that latches on, the card does not turn it back off — that is
the controller's business, and a card that tidies up after a device it does not
understand causes more trouble than it prevents.

### 9.3 Confirming

The reset happens **on the device** and cannot be undone — there is no stored
timestamp to put back, unlike a helper-based clock. So a single tap **arms** the item
for `confirm_seconds` (3 by default):

```
CHLORIDE 5 d   →  tap  →   CHLORIDE tap again   →  tap  →  CHLORIDE 14 d
```

The armed state uses `--sumi-caution` and reverts on its own if the second tap does
not come. This is deliberately lighter than a dialog: you do this standing next to a
hot tub with wet hands, and a modal is the wrong instrument. Set `confirm: false` for
plain single-tap if the armed step annoys you.

### 9.4 States

| State | Token | Shown as |
|---|---|---|
| Normal | `--sumi-ink` | `5 d` |
| Due soon — within 20% of the interval, minimum one day | `--sumi-caution` | `2 d` |
| Overdue | `--sumi-alert` | `overdue 3 d` |
| Sensor unavailable | `--sumi-faint` | `—` |

> **Correction to carry back into the prototype.** The mock paints overdue service
> items in `--copper-hi`. That is a decorative use of copper and it violates the
> kintsugi contract. Overdue is `--sumi-alert`, due-soon is `--sumi-caution` — the
> theme has both tokens for exactly this. Not yet applied to
> `Concepts/sumi-house-mock.html`.

---

## 10. Cost

Unlike the sauna, the controller meters itself — no synthetic power chain is needed.

```
sensor.hot_tub_energy_monthly  (kWh, from the controller)
        ↓  × input_number.energy_price
sensor.hot_tub_cost_monthly    (PLN)
```

Same for the yearly pair. The tariff is the **shared** house helper in
`sumi_common.yaml`, not a hot-tub-specific one, so a tariff change is a single edit
and the sauna and tub can never silently disagree about the price of a kilowatt-hour.

Both cost sensors carry an `availability` template, so if the controller drops offline
the cost block goes unavailable rather than quietly reading `0.00 zł`.

Add `sensor.hot_tub_energy_monthly` to the HA Energy dashboard as an individual device
for a real history alongside the sauna's.

---

## 11. Layout

```
┌─ vhead ─────────────────────────────── 湯 HOT TUB       [ HOLDING ] ─┐
│ ┌ vleft ──────┐  ┌ vright ──────────────────────────────────────────┐│
│ │  ring 104px │  │ Heater          Holding 38.5° · 0.4 kW      [⊙]  ││
│ │    38.5 °C  │  │ Pump & bubbles  Circulation only  [Pump][Bubbles]││
│ │    → 38.5°  │  │ Schedule        4 setpoints · daily         [⊙]  ││
│ │   [−]  [+]  │  │ Light           Mizu · solid                [⊙]  ││
│ │   AT TEMP   │  │ ● ● ● ● ● ● ●                                    ││
│ └─────────────┘  └──────────────────────────────────────────────────┘│
│ ── 06:00·36.0°   14:00·37.5°   17:30·38.5°   22:30·35.0° ─────────── │
│ ── CHLORIDE 5 d   FILTER 12 d   RINSE 4 d   WATER 51 d ───────────── │
│ ── SEPTEMBER 386 zł    YEAR TO DATE 4 120 zł ─────────────────────── │
└──────────────────────────────────────────────────────────────────────┘
```

Four control rows plus a swatch strip, then two full-width strips, then cost —
structurally identical to the sauna card, which is four rows plus swatches, then
its now-playing strip and its selects, then cost. The light row sits last in both.

Tokens, spacing and seam behaviour come from the theme. The card consumes
`var(--sumi-*)` and defines no colours of its own.

---

## 12. Build checklist

- [x] `www/sumi-house/cards/sumi-hot-tub-card.js` — Shadow DOM, shares the gauge,
      debounce and swatch implementations with the sauna card rather than forking them
      (`sumi-vessel-shared.js`)
- [ ] `packages/sumi_common.yaml` installed, `input_number.energy_price` set to `0.98`
- [x] `packages/sumi_hot_tub.yaml` installed, controller entity ids substituted — bound
      to the live Bestway/Lay-Z-Spa MQTT integration (see the package's own header)
- [ ] Schedule starting values set from the UI — 06:00/36.0, 14:00/37.5, 17:30/38.5,
      22:30/35.0. No `initial:` is set on the helpers by design, so HA restores your
      edits across restarts instead of stamping on them
- [ ] Confirm what each of the four device counters actually tracks, and set `every:`
      to match (§9.1)
- [ ] Confirm the reset entities fire cleanly — press one and watch its counter go to 0
- [x] Confirm the controller's energy sensors reset on the calendar month and year —
      if they are lifetime totals instead, wrap them in `utility_meter` the way the
      sauna package does — `sensor.layzspa_energia` is lifetime-only, now wrapped
- [x] Resource registered in `examples/resources.yaml`; full config in
      `examples/hot-tub-card.yaml`

---

## 13. Note on service intervals

The counters themselves are device entities, so an automation *can* read them — "days
since chloride" is available to anything in HA, and a notification is straightforward
to build.

The **intervals** are still card config, so an automation has to repeat the threshold
rather than share it. At four items with stable intervals that is a fair trade for
keeping the card self-describing. If the thresholds ever start moving, lift them into
`input_number` helpers and have both the card and the automation read those.
