# Sumi House — Home Assistant theme & widgets: full project context

Portable export, 18 Sep 2026. Paste this into a new Claude account as the first message
of a project (or save it as project knowledge) to carry the work over. Everything below
is either stated by me or a decision already made and accepted — nothing here is a
suggestion still awaiting approval unless it says so.

---

## 1. Who / where

- Tomek, lives in Jeziory Małe, Wielkopolska, Poland (near forest and lake).
- Works in both Polish and English.
- Energy price: **0.98 PLN/kWh** (Sep 2026). Costs display in `zł`.

## 2. The house

Barn-style home, **black wooden shou sugi ban facade**. Interiors are **wood, concrete and
copper**. Designed in **japandi** style. The theme and widgets must be stylistically in
line with the house.

**Rooms:** living room; terrace at the back of the house; kitchen integrated with the
living room; dining room integrated with the living room; mezzanine (multimedia section +
work section); attic; pantry; entrance hall; interior hall; master bedroom with its own
bathroom; main bathroom; Olaf's bedroom; Zoja's bedroom; laundry room; garage; guest room
with its own bathroom, kitchenette and its own separate entrance.

**Garden:** sauna, hot tub, pool, sprinklers. Back garden has an automatic lawn mower;
front garden has its own separate lawn mower.

**Already controlled in Home Assistant:** solar energy production, energy consumption,
cameras around the house, lighting, lawn mowers, vacuum cleaners, washer and dryer,
sprinklers, sauna, hot tub, media servers, garden lighting.

## 3. Repo / file layout

- `Concepts/sumi-house-mock.html` — the working prototype. All views live in this one
  file, edited in place, never split into per-view files.
- `docs/cards/<card>.md` — card specifications. Written so far: `sauna.md`, `hot-tub.md`
  (15–16 Sep 2026).
- `packages/sumi_<card>.yaml` — the HA config a card depends on.
- `packages/sumi_common.yaml` — house-wide values every package reads.
- `/local/sumi-house/cards/<name>.js` — the custom cards themselves.

**Note for migration:** these files live on my machine, not in this export. This document
is the accumulated design context and decisions, not the code.

---

## 4. Dashboard structure — six tabs, one per area

Home 家 · Living room 居 · Bedroom 寝 · Kids' rooms 子 · **Wellness 湯** · **Garden 庭**

Wellness and Garden are **separate top-level tabs**, not two halves of one scrolling view.
They started as one "Garden" view split by `.sect major` headers; those headers are gone
because the tab name now carries the section name. Each view has its own `dash-head`
(湯 の 間 / Wellness, 庭 の 手入れ / Garden) and its own clock id (`clock3` / `clock5` —
the tick loop updates an array of clock ids; add to it when adding a view).

- **Wellness** = sauna, hot tub, pool, onsen lighting.
- **Garden** = sprinklers (forecast, schedule, zones, history), mowers.
- Home-view tiles route accordingly: sauna/hot tub/pool → `data-goto="wellness"`,
  sprinklers → `data-goto="garden"`.

**Height budget:** each view fits a tablet screen without scrolling — ~915px and ~885px at
1120px wide. Treat that as the budget; anything new has to earn its height.

## 5. One device, one box

Two versions were rejected for being too heavy. Everything belonging to a device lives in
that device's card. There are no separate "ambience" or "schedule" cards and they should
not come back.

- **Sauna card** = temperature + heating + session length + vestibule light + bench LED and
  its swatches + now-playing strip + playlist/speaker selects + running cost.
- **Hot tub card** = temperature + heater + pump/bubbles + schedule toggle + the schedule
  itself + service intervals + running cost.

## 6. The condensed vessel layout

Both share one skeleton so they read as a matched pair:

`vhead → .vbody (.vleft gauge | .vright control rows) → full-width strips → .cost`

The **gauge sits beside its controls, never above them** — that side-by-side move is what
halved the height. `.vleft` is 110px: a 104px gauge, a ± pair beneath it, then the ETA line.

Distinguished by **form first, colour second**, because copper cannot be spent on identity:

| | form | glyph | accent | range | step |
|---|---|---|---|---|---|
| Sauna | 270° **open arc** (dry heat, escaping) | 蒸 | oak | 20–110 °C | ±5° |
| Hot tub | 360° **closed ring** (contained water) | 湯 | mizu | 10–42 °C | ±0.5° |

## 7. Kintsugi — the copper rule

**Copper appears only while something is actively running.** `.card.veined::after` paints
an actual copper crack (the `--crack` SVG) along a card's top edge, not just a border tint.
Added ONLY by `seam(el, on)` in JS.

What counts as "running" depends on the device's **resting state** — ask of every new
device: *what is this thing's resting state?* The seam marks departure from rest, not power
draw.

- **Sauna** — off most of the time, so the seam follows the climate entity being in `heat`
  (session running), *not* `hvac_action`. A thermostat cycles its element every minute or
  two and an element-bound seam would blink for the whole session.
- **Hot tub** — on essentially always, so "heater on" would mean permanent copper on the
  Wellness view. Seam = `binary_sensor.hot_tub_heating` (climbing toward a setpoint it has
  not reached, >0.3° below target) **OR** bubbles running. Pump alone does not ignite it —
  circulation is the tub's resting heartbeat. Nor does the light: a lit tub at rest is
  still at rest.
- Pool seam follows filtration; a running sprinkler zone and a mowing Landroid ignite
  theirs. The Home-view sauna tile stays in sync across tabs.
- Covered by tests: idle sauna has no seam; the hot tub seam clears when the heater is off
  and re-ignites on bubbles alone.

**Alert colours are not copper.** Overdue / due-soon service items use `--sumi-alert` and
`--sumi-caution`; the theme has both tokens for exactly this. **Open issue:** the prototype
currently paints overdue items in `--copper-hi`, a decorative use of copper that violates
the kintsugi contract. Flagged in `docs/cards/hot-tub.md` §9.4, **not yet applied** to
`Concepts/sumi-house-mock.html` — offered twice, still awaiting a yes.

## 8. Accent ladder (identity, never copper)

sauna = oak · hot tub = mizu · pool = mizu · garden/mowers = moss · kids: **Olaf = moss,
Zoja = mizu** (per-person system). Set with `.a-oak` / `.a-mizu` / `.a-moss`, drawn as a 2px
left edge via `.vessel::before` / `.person::before`.

Cards consume `var(--sumi-*)` and **define no colours of their own**.

## 9. Schedules are basic — hard rule

Three forms, in order of preference. **Never a table, never a chip per row.**

1. **`.stripline`** — one wrapped line of label+value pairs:
   `MON–FRI 17:30 · 38.5°   SAT 14:00 · 39.0°`. Add `.off` to dim it when paused.
2. **`.svcline`** — service intervals the same way: `CHLORIDE 9 d · FILTER 2 d`, never
   `in 9 days`, never a grid of `.svcitem` boxes. Copper on the overdue item only.
3. **`.srow` with an `.sdot`** — when per-row state matters (sprinkler next cycle). Filled
   moss dot = will run; hollow dot plus `.skip` (42% opacity) = won't. No verdict chips, no
   day column when every row shares a day.

Selects (`select.sel`) beat chip rows for one-of-many choices — playlist and speaker were
four lines of chips, now one line of two dropdowns. They also map onto HA `input_select`.

## 10. Other density rules

- Gauges 104px, numerals 25px. **No cost sparklines** — two mono numbers is enough.
- Zone history is a 9px track with 5px bars, four rows, no gaps. A glance, not a chart.
- Mowers: two data lines (next run, blade hours) beside a 50px battery ring.
- Cards that run short beside a taller neighbour use `display:flex;flex-direction:column`
  with `margin-top:auto` on the last block, so the gap lands at the bottom as deliberate
  negative space (`#spr-card`, `#pool-card`, `.cost` inside both vessels).

---

## 11. Card spec conventions (`docs/cards/<card>.md`)

Follow this structure for the next card:

1. **What the card owns** — a table mapping each region of the card to its source of truth.
2. **How it differs from its sibling card, and why** — a comparison table. Added for the
   hot tub because I asked for "in line with the sauna but easily distinguishable"; it is
   the section that makes the pairing deliberate rather than accidental.
3. **Entity contract** — what HA must provide. Every optional block **degrades by
   disappearing, never by rendering empty**.
4. **Card configuration** — the complete YAML schema with defaults. Only `entity` is
   required.
5. **One section per region**, each ending with the non-obvious constraint rather than
   restating the happy path.
6. **Layout** — an ASCII sketch. Build checklist. Known limitations, stated plainly.

### Two cards side by side must be structurally identical

Sauna and hot tub both land on: 4 control rows + a light swatch strip, then two full-width
strips, then cost. The light row is last in both, so colour control is muscle memory.
Sauna's strips are now-playing + selects; the tub's are schedule + service. Keep any third
card in the pair on the same skeleton.

### Prefer the device's own entities over helpers

**The strongest recurring correction: if the controller exposes it, use it.** The hot tub
spec was rewritten twice on this — six helper-based service clocks became four device
"days since" sensors plus four device reset entities, and the package lost ten helpers.
When speccing a new card, ask what the hardware already publishes before inventing a
helper for it. Helpers are for what the device genuinely cannot do (schedules, session
timers, tariffs).

### Decisions that generalise to other cards

- Cards are **custom web components in Shadow DOM** at
  `/local/sumi-house/cards/<name>.js`. button-card templates cannot do the drag gauges.
- Cards hold **no state of their own** except transient drag and edit state. Anything that
  must survive a reload lives in HA helpers or on the device.
- **Debounce every write to a physical device**: paint at 60fps optimistically, call the
  service `commit_delay` ms (400) after the last input, then ignore inbound state for
  `optimistic_hold` ms (2000) so the control does not snap back. The sauna and hot tub
  share one implementation — do not fork it per card.
- **One source of truth per fact.** The hot tub's `climate` entity is used for temperature
  only; its `hvac_mode` is ignored because `switch.hot_tub_heater` is authoritative. Two
  sources for one fact is how a card argues with itself.
- Helpers get **no `initial:`** — HA restores the last value across restarts, and an
  `initial:` stamps on the user's edits every reboot. Put starting values in the spec's
  install checklist instead.
- **Fire reset/trigger entities by domain**, so the card works whatever the controller
  provides: `button`/`input_button` → `press`; `switch`/`input_boolean` → `turn_on`;
  `script`/`scene` → `turn_on`. Do not turn a latching momentary switch back off — that is
  the controller's business.
- **Match the safeguard to reversibility.** A reset held in a helper can be undone, so it
  gets a timed undo toast. A reset that happens *on the device* cannot, so it gets
  tap-to-arm + tap-to-confirm (3 s, `--sumi-caution`), never a modal — you do this standing
  next to a hot tub with wet hands.

---

## 12. Hardware facts

- **BleBox saunaBox** exposes exactly one `climate` entity — no separate sensor, switch or
  power meter. Current temp is `current_temperature`, target is `temperature`, on/off is
  the state (`heat`/`off`), range is `min_temp`/`max_temp`.
- saunaBox `hvac_action` **may be missing** depending on firmware. The package's
  `binary_sensor.sauna_heating` tries `hvac_action == 'heating'` and falls back to "mode is
  heat AND more than 1° below target". Cards read that sensor, never the attribute directly.
- **Hot tub controller** exposes a lot: a `climate` entity, switches for heater / pump /
  bubbles, a `light` entity with colour, four "days since" service sensors (chloride,
  filter, rinse, water) each with a reset entity, and its own monthly + year-to-date energy
  totals. It needs no synthetic power chain and no service helpers.
- Sauna heater **9 kW**.
- Energy price **0.98 PLN/kWh** (Sep 2026), in the **shared** `input_number.energy_price`.
- Hot tub temperature ceiling defaults to **40 °C** — top of the comfortable range and what
  most controllers enforce.
- The physical sauna is a **quaro-type barrel** (rectangular barrel shape): shingled arched
  roof, metal chimney pipe, glazed front door, metal tension straps around the barrel.
- Sauna lighting is **two separate light entities**: a top light in the vestibule, and RGB
  LED lighting below the benches (needs colour and mode/effect control).

## 13. Daily schedule pattern (hot tub; reusable for sprinklers/pool)

My schedules are **the same every day**, differing only by time and value. So:

- N slots, each an `input_datetime` (time only) + an `input_number` (value).
- A **template sensor resolves which slot is in force right now** — it contains `now()`, so
  HA re-renders it every minute. Single definition; automations read the sensor instead of
  repeating slot-picking logic.
- Before the day's first slot, the **last slot of the day is still in force** (it was set
  last night and nothing superseded it). The sensor handles the wrap.
- One automation, triggered at each slot time **and** when the enable boolean flips on, so
  enabling at 15:00 applies the 14:00 setpoint instead of waiting for 17:30.
- The heater is never scheduled off — a hot tub cools by lowering its setpoint.
- The slot-picking Jinja is verified against 14 cases (exact boundaries, out-of-order slot
  definitions, an unavailable helper, all slots identical). Re-run that harness if the
  template changes.

## 14. Service counters (hot tub pattern)

Device sensors count **up** — days since the job was last done. The interval lives in card
config (`every: 14d | 2w | 2mo`); the card shows `every − sensor`, i.e. what is left,
because that is what you want to know standing next to the tub. Raw days-since goes in the
tooltip.

Because the sensor is a day count with no anchor date, **`2mo` means 60 days, not calendar
months** — the opposite of the earlier helper-based design, where months were added as
calendar months. Do not mix the two models.

Trade-off, accepted: the counters are device entities so automations can read them and
notify, but the *intervals* are card config, so an automation must repeat the threshold.
Fine at four stable items; lift intervals into `input_number` helpers if they start moving.

## 15. Synthetic energy cost (only when the device has no metering)

Chain, in this order so a real meter can be dropped in later at step 2:

`binary_sensor.<x>_heating` → `sensor.<x>_power` (template, rated W or 0) →
`sensor.<x>_energy` (Riemann sum) → `utility_meter` monthly + yearly →
template cost sensors × `input_number.energy_price`

- Use **`method: left`** — the element is a step function, so the rectangle to the left of
  each transition is the true area. Trapezoidal systematically under-counts.
- `max_sub_interval: "00:01:00"` keeps the integral advancing during a long unbroken run.
- `utility_meter` cycles on the calendar month/year and resets itself.
- `history_stats` can only match entity **state**, never attributes — that is why the
  heating template binary_sensor exists at all.
- Accuracy: about ±10% of a real meter; reads high if the heater has stages or soft start.
- Cost sensors over an external energy sensor carry an `availability` template, so a
  controller going offline makes cost unavailable rather than quietly reading `0.00 zł`.

## 16. Playlists without Music Assistant — the researched answer

I run plain `media_player` (Google Cast), no Music Assistant, music on an SMB share.

- **`.m3u` files do not work.** HA's Cast integration parses m3u/pls and then plays only
  the *first* entry (core PR #70047). You get one track and silence.
- **A playlist is a folder.** Mount the share via Settings → System → Storage → Add network
  storage, usage "Media"; each top-level folder under `Music/` is a playlist, listed in card
  YAML by its `media-source://media_source/local/...` path.
- The card builds the queue itself: `hass.callWS({type:'media_source/browse_media'})`, then
  `media_player.play_media` with `enqueue: replace` for the first track and `enqueue: add`
  for the rest. `media_content_id` takes the `media-source://` URI directly —
  `play_media` resolves it server-side.
- **Known weakness:** HA signs those URLs with an expiry, so a long queue pushed at once
  risks the tail expiring. Mitigation is a rolling window (`queue_window: 20`,
  `queue_refill_at: 5`). Music Assistant is the documented upgrade path.
- Multi-room = a **Google Cast speaker group** entity, never several entity_ids in one
  call; they drift audibly.

## 17. Light + swatch control (shared by both cards)

Toggle row plus a swatch strip. Tapping a swatch on an *off* light turns it on at that
colour — two taps to change a colour is one too many. The active swatch is derived from the
entity (match `effect` first, then `rgb_color` within ±12 per channel, because bulbs
round-trip RGB imprecisely), never from what was last clicked. A swatch whose `effect` is
not in `effect_list` renders disabled rather than failing at tap time. Same palette on both
cards, different first swatch: **sauna leads with Ember, tub with Mizu**.

---

## 18. Gotchas hit while building

- The original `$$(".steppers .mchip")` handler makes any chip group inside `.steppers`
  mutually exclusive. Independent toggles (hot tub pump / bubbles) must use `.chiprow`.
- `.grid > *{min-width:0}` is required — otherwise a card with a wide scrolling child widens
  its own grid track and overflows the app frame on narrow screens.
- Micro-labels use `--faint: #6B655A`, never `--seam`. `--seam` is a border colour; text set
  in it is invisible on the concrete card surface.
- Writing into the mounted folder leaves the file hardlinked for a second or two and
  `device_stage_files` refuses it. Rewrite via temp file + `shutil.move`, then poll
  `stat -c %h` until it reports 1.
- The `~/mnt/` mount can drop out of `device_bash` entirely mid-session. Fallback that
  works: `device_stage_files` to read, do the work in the cloud container, then
  `SendUserFile` + `device_commit_files` to write back (`force: true` when re-committing a
  file staged earlier in the session).

## 19. Where things stand

**Done:** Wellness and Garden views built into `Concepts/sumi-house-mock.html`
(15 Sep 2026). Specs written for sauna and hot tub. Kintsugi seam logic implemented and
tested.

**Open / not yet done:**
- Converting the cards to real HA button-card templates and view YAML — **no entity IDs are
  wired; every value in the prototype is a placeholder.**
- Repainting overdue service items from `--copper-hi` to `--sumi-alert` / `--sumi-caution`
  in the mock (offered twice, awaiting a decision).
- **Still to spec: pool, sprinklers, mowers.** Sauna and hot tub are the templates.

---

## 20. Earlier, separate but related work (pre-dates this project)

An earlier standalone sauna Lovelace card, styled on `github.com/coyot/awesome-ha` (dark,
Apple Home-inspired), intended to fit a **Sonoff NSPanel** (landscape, not square).
Decisions from it that may still matter:

- 3D visualisation was **dropped entirely** — too much space. Replaced by a small sauna icon
  as a background watermark, shaped like the real quaro barrel, with the freed space given
  to more controls.
- Larger temperature +/- buttons for easier touch targeting.
- A round/circular slider around the temperature number for smooth selection, in addition to
  discrete +/- stepping.
- Distinct from the separate Three.js WebGL visualisation of the physical sauna building.

Other HA context: a sprinkler automation with weather-based rain conditions; long-standing
Zigbee2MQTT / HA / Google Home setup; `coyot/awesome-ha` used as a styling reference.
