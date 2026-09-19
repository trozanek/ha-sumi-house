# Dashboard structure — eight views for the whole house

Proposed information architecture for the Sumi House Overview dashboard, derived from the
pre-migration snapshot in `docs/migration/` (268 devices, ~2,739 entities, 16 areas, 12 live
views) and the design contract in `THEME_SPEC.md` §2. `Concepts/sumi-house-mock.html` is the
visual source of truth and has been updated to this structure; where this document and the
mock disagree, the mock wins — flag the discrepancy rather than silently picking one.

This is a proposal for the *friendly* dashboard: the one the family uses from the wall panel
and phones. It is not the admin surface — see §5 for what is deliberately left out.

---

## 0. Correction — 2026-09-18

The first pass at this document and at the mock described a dashboard, not *this* house: it
kept general placeholder ideas (per-room temperature and climate steppers, blinds, a
house/grid energy meter, pool water-chemistry probes, a DND toggle, sauna cabin lighting, four
camera tiles) that don't correspond to any entity in `docs/migration/entities.csv`. Every card
below has been re-derived from that CSV; **anything without a real entity has been removed**,
not simulated. Two things follow from that:

- **There is no per-room climate.** The whole house runs off one heat pump
  (`BA-SVM 10-200/12 E`, myUplink). Room views link to it rather than pretending to hold a
  setpoint. There are no blinds entities anywhere in the snapshot.
- **Home was rebuilt around what the house is doing**, not a wall of sensors: a "Running now"
  list (kintsugi — copper only on rows that are actually on), the real solar figures, a real
  weather + pollen widget, and doors/cameras built from real contact and motion sensors.

Since that correction, three further changes were requested and made (also reflected in the
mock, not yet re-verified against a live HA instance):

1. The Atrium camera tile moved from Home and from Onsen's exterior section into 庭 Garden,
   next to a new Detection card (`binary_sensor.atrium_person/vehicle/animal`).
2. The Doorbell camera moved into Home's Solar/Weather column (the space freed by Atrium
   leaving), with two quick toggles (Record, Privacy mode) inline.
3. Any `.cam` thumbnail across the mock (Home, Garden, Utility) is now clickable and opens a
   lightbox with the live feed plus that camera's full real switch set — see §3.2.

On 2026-09-19 Home was rebuilt again, to the owner's brief: the Rooms tile grid and the
Openings & motion table were dropped, an AI-written daily brief and a code-protected alarm
bar were added at the top, and the heat pump was cut down to the five figures actually used
(outside, target, flow, compressor, degree minutes) plus a ±3 curve-offset stepper. Full
inventory in §2.1.

## 1. Why twelve views become eight

The live Overview has grown one view per HA area: 家 Home · 温 Onsen · 庭 Garden · 媒体 Media ·
図 Plan · 居間 Living Room · 庖 Kitchen · 寝 Bedroom · 息子 Olaf · 娘 Zoja · 階 Mezzanine ·
屋 Washroom. Each is built from generic HA cards (button / tile / entities / grid stacks —
34 cards on Living Room alone, 66 entities on Washroom), so every view scrolls, most tabs are
visited rarely, and the tab bar no longer fits a phone without scrolling.

The grouping principle for the new set is **how the house is actually walked, not how HA
areas are named**:

| Principle | Applied to |
|---|---|
| **Open-plan rooms merge into one view.** If you can see it from where you stand, it is one dashboard. | Living room + kitchen + dining → 居 Living (three sections, one scroll). |
| **High-traffic distinct zones get a dedicated view.** Somewhere the family goes on purpose, with its own devices and its own mood. | 寝 Bedroom · 子 Kids' rooms · 階 Mezzanine · 温 Onsen · 庭 Garden |
| **Low-traffic utility rooms group into one compact view.** Rooms you check, not rooms you sit in. Each gets one tile, never a tab. | Entrance, halls, main bathroom, laundry, garage, pantry, guest suite → 屋 Utility & guest |
| **Home is a summary, not a copy.** Every tile on Home is a door to exactly one of the other seven views; nothing on Home is a dead end. | 家 Home |

Two people in one room (Olaf and Zoja) share a view with per-person accents rather than two
tabs, because the parent opening the view wants both children at once. Kitchen loses its tab
because nobody walks to the kitchen "dashboard"; they are already in the living view.

---

## 2. The eight views

Tab order is the order of daily use, left to right. Kanji follow `examples/views-kanji.yaml`
except Onsen (see §6). Each view keeps the decorative multi-kanji header phrase from the mock.

| # | Tab | Kanji | HA `path:` | Header phrase | One line |
|---|---|:-:|---|---|---|
| 1 | Home | 家 | `home` | 墨 の 家 | Whole house at a glance; everything links onward |
| 2 | Living | 居 | `living` | 居 間 · 台 所 | Open-plan living, kitchen and dining as sections |
| 3 | Bedroom | 寝 | `bedroom` | 主 寝 室 | Master bedroom, en-suite, sleep and wake |
| 4 | Kids' rooms | 子 | `kids` | 子 供 部 屋 | Olaf (moss) and Zoja (mizu) side by side |
| 5 | Mezzanine | 階 | `mezzanine` | 中 二 階 | Multimedia section and work section |
| 6 | Onsen | 温 | `onsen` | 湯 の 間 | Sauna, hot tub, pool, onsen lighting, onsen exterior |
| 7 | Garden | 庭 | `garden` | 庭 の 手入れ | Sprinklers, mowers, garden lighting, solar, camera |
| 8 | Utility & guest | 屋 | `utility` | 奥 の 間 | Entrance and halls, bathroom, laundry and garage, pantry, guest suite |

### 2.1 家 Home

Rewritten 2026-09-19 around the question "what does this house need from me today?" The old
Rooms tile grid and the Openings & motion table are gone — navigation moved into the
temperature strip (every cell is a link to that room's view) and the contact sensors
collapsed into a single chip row.

| # | Section / card | Source |
|---|---|---|
| 1 | Header — greeting, clock, outside temp, sunset | `weather.openweathermap`, `sun.sun` |
| 2 | **Today** — a written brief of the house and the day, in Mincho, with a Rewrite button | `ai_task.google_ai_task` (the same engine the sprinkler forecast uses); the automation that writes it each morning still needs building |
| 3 | **Alarm bar** — disarmed is a quiet strip with Arm away / Arm night; armed is the loudest thing on the page (alert-toned band, left rail, pulsing dot, uppercase mono state). Disarm opens a four-digit keypad; a wrong code shakes and clears. | `input_boolean.alarm_armed` plus the three automations already keyed to it. **Real code validation needs Alarmo's `alarm_control_panel` entity** — Alarmo is installed but exposes no panel in the snapshot, so the mock validates a demo code locally |
| 4 | People — presence chips + a doorbell alert chip | `person.*`, `binary_sensor.main_entrance_doorbell_visitor` |
| 5 | **Needs a hand** — the single place attention collects: mower fault, filter due, dryer, printer toner, vacuum dustbin, low batteries | the real fault/level sensors behind each |
| 6 | Running now — kintsugi list, copper only on rows genuinely running | sauna, hot tub, pool filter, dryer, heat pump, media, mowers, sprinklers, Deebot |
| 7 | Solar + **energy used** — production today / month / YTD, then a Used row: week, month, year | `sensor.stodola_total_current_day_energy`, `_month_`, `_year_`, `sensor.stodola_current_year_consumption`. Week and month consumption are blank — see §6.10 |
| 8 | Outside — condition, feels-like, UV, gust, cloud, precipitation, pollen risk + species | OpenWeatherMap + Polleninformation |
| 9 | **Quick controls** — Lights (garden lamps, border uplights, porch bulbs, porch LEDs, entrance, entrance outside, driveway, all-off), whole-home **Music** (zone select defaulting to All speakers, source, group volume), **Deebot** (battery, last clean, water flow, dustbin, Clean / Send home) | the real light groups; `media_player.all_speakers` + 11 zone groups; `vacuum.herunohazumi_gmail_com`; `input_boolean.all_lights` |
| 10 | **Temperature strip** — one slim cell per room, each linking to that room's view | four real sensors (living room, guest suite, NSPanel, outdoors); eleven cells show `—` because no sensor exists there yet |
| 11 | **Doors & gate** — a chip per contact, coloured only when open; plus **Bins** | garage door, bathroom, both entrance closets, kitchen drawer. Bins is an empty frame — no collection schedule source exists |
| 12 | Doorbell — thumbnail opening the camera lightbox, Record and Privacy quick toggles | `camera.main_entrance_doorbell_fluent` + its switches |
| 13 | **Heating** (compact) — outside / target / flow, a ±3 curve-offset stepper, compressor and degree minutes | `sensor.outdoor_temperature_40004`, `sensor.calculated_supply_climate_system_1_43009`, `sensor.external_supply_line_bt25_40071`, **`number.offset_47011`** clamped to ±3, `sensor.slave_1_eb101_status_compressor_eb101_44064`, `sensor.degree_minutes_40941` |
| 14 | **Hot water** (compact) — temperature, mode, temporary lux | `sensor.hot_water_temperature_50325`, `sensor.current_hot_water_mode_43109`, `switch.temporary_lux_50004` |
| 15 | **Water used** — main gauge / garden gauge | empty frame; **no water meter of any kind exists on this instance** |
| 16 | **Agenda** — the day's events | empty frame; the only calendars here mirror the to-do lists plus Radarr |
| 17 | **School tomorrow** — Olaf and Zoja, with a Week popout (Olaf/Zoja tabs, 5×8 timetable scaffold) | empty frame; needs a Vulcan/Librus integration or an ICS export per child |
| 18 | **Coach** — training status, readiness, recovery, VO₂ max, last activity | `sensor.garmin_connect_training_status`, `_training_readiness`, `_recovery_time`, `_vo2_max`, `_last_activity`. "Next workout" is blank: the integration does not expose the coach plan |
| 19 | Scenes, then To-do (Tasks / Regular tasks / Groceries) | real scenes; `todo.inbox`, `todo.regular_tasks`, `todo.lista_zakupow` |

Five cards have no data source on this instance: water usage, bins, the agenda, the school
timetable, and weekly/monthly consumption. They carry **representative sample data plus a
footer line naming the integration they need** — the owner chose this over empty frames so the
finished layout can be judged. The rule that follows from it: *if a reading has no footer
caveat, a real entity publishes it.* Never widen the sample data beyond those five cards, and
never drop a footer line while its integration is still missing — those footers are the build
list, and they are the only thing separating mocked values from live ones.

Sample values in the mock, for consistency if they are ever regenerated: water 9.4 m³ main /
21.6 m³ garden for September; bins on a Polish commune cycle (zmieszane + bio fortnightly,
plastik i metal, papier, szkło); a Saturday agenda ending with Ania's train; Olaf in klasa 6
starting 08:00 with WF first and Zoja in klasa 4 starting 08:55, both ending 12:45 on Monday;
119 kWh this week and 342 kWh this month against 4.6 MWh year to date. The Home brief names
Olaf's PE lesson, so the Monday timetable and the brief have to stay in step.

### 2.2 居 Living

| Section | Card | Source |
|---|---|---|
| Living | Lights — Top LED, Beam LED, Cabinet LED (shared with kitchen) sliders + three on/off circuits | GLEDOPTO LED controllers, wall-switch gangs |
| | Media — now playing, transport, speaker/source select, veined while playing | Music Assistant, Spotify, Jellyfin |
| | Room — presence, temperature, humidity, "Heat pump" link (no local climate) | mmWave presence (iHseno), LR temperature/humidity sensor · battery 84% |
| | Projector & screen — projector toggle, Screen down/up, Chromecast state | entertainment-switch gangs, Tuya screen scenes |
| | Fan — on/off, fan light, "beep on change" | `fan.fan` (Tuya) |
| | Deebot T9+ — docked/cleaning state, battery, last clean, Clean/Send home | `vacuum.herunohazumi_gmail_com` |
| Kitchen 台所 | Kitchen circuits — Island, Island spots, Island+sofa, Gable wall, Cabinet, Outside | island/gable-wall switch gangs |
| | Piekarnik — main/second cavity temp, job state, door, oven light, drawer socket, child lock | Samsung SmartThings oven integration |

No blinds, no per-room climate stepper, and no dining-room card exist as real entities — the
dining table sits under the "Island and sofa" light circuit, so it lives in the kitchen
lighting list rather than getting its own section.

### 2.3 寝 Bedroom

Ceiling LED (GLEDOPTO) and Neon light sliders · main and terrace-side wall switches (3-gang,
2-gang) · Bedside knob (Zigbee rotary dimmer, battery 78%) · Room-occupied toggle
(`input_boolean`, drives the night rules — there is no dedicated presence sensor) · real scene
chips · **Last night** section: Garmin sleep score, total sleep duration, deep sleep, 7-day
average resting heart rate. No blinds, no climate stepper, no DND toggle.

### 2.4 子 Kids' rooms

Two person-accented cards, identical anatomy: LED strip slider (Zoja also has a separate
dimmer), main-light wall switch, bed-light belt above the bed, Nest Mini speaker row. Zoja's
card adds an outside-window light. Below: a shared Kids' bathroom tile (GLEDOPTO LED, mirror
switch, cast speaker) and a Bedtime card (`scene.bedrooms_lights_off`, pause the kids' speaker
cast group). Olaf = `.a-moss`, Zoja = `.a-mizu`, the fixed per-person system. Neither room has
a climate or temperature entity.

### 2.5 階 Mezzanine

| Section | Card | Source |
|---|---|---|
| Multimedia | Smart TV Pro — now-playing strip, source/speaker selects, mute | TCL TV (two integrations — Android TV + `homekit_controller` for mute), Jellyfin |
| | PlayStation 5 — console/PSN state | `media_player.playstation_5` |
| | Lights — Main light, Work corner (3-gang switch), Stairs LED | wall-switch gangs |
| Work corner | Brother HL-1210W — sleep/idle pill, black toner %, drum life %, pages left | Brother printer sensors |
| | Desk — no dedicated desk-lighting entity yet; nearest speaker is the Hall Nest Mini | honest gap, not simulated |

### 2.6 温 Onsen

Existing vessel cards, corrected to real entities:

| Card | Source |
|---|---|
| Sauna | `climate.sauna`, session length chips, heater state (9 kW element, modelled not metered), nearest speaker is the Atrium speaker via Music Assistant — **no cabin lighting entity exists**, so none is shown |
| Hot tub | Lay-Z-Spa (`layzspa_*`): heater, pump/bubbles/jets chips, in-tub toggle, real 4-slot MQTT schedule, chlorine age / filter age / rinse-due / error service line |
| Pool | Filter power draw (power-monitored socket), today's kWh, chlorine timer (`timer.chlor`) with Reset, filtration schedule toggle — **no water-chemistry probes exist**, so no pH/ORP readouts |
| Onsen & porch lights | `light.porch_led_1…5` (Corner, Hot side, Swing, Atrium, Hot tub+bulb), Atrium ceiling socket, "keep porch on" override |

Section **Onsen exterior** (外), after the lighting card:

| Card | Source |
|---|---|
| Fire pit | `Lampa ognisko` (Tuya breaker — no auto-off entity yet), "On terrace" `input_boolean` |
| By the tub | SwitchBot 73EA temperature/humidity, and an "Atrium camera → Open" link now that the camera itself lives in 庭 Garden |

### 2.7 庭 Garden

Existing: Sprinklers card with the AI forecast text (`ai_task.google_ai_task`, reads
OpenWeatherMap — the automation still needs writing), Next-cycle schedule, four zone tiles,
14-day zone history, Vision Tyl (back garden mower) and Vision M 1 (front garden mower, shown
with its real E1 blade-jam fault).

Section **Camera** (目) — new, holds what moved out of Home and Onsen:

| Card | Source |
|---|---|
| Atrium | Live thumbnail, opens the camera lightbox with the real Atrium switch set | `camera.atrium_fluent` |
| Detection | Person / vehicle / animal / day-night state | `binary_sensor.atrium_person/vehicle/animal`, `sensor.atrium_day_night_state` |

Section **Solar & lighting** (陽):

| Card | Source |
|---|---|
| Garden lighting | Perimeter lamps (8 bollards), Driveway light (motion after 23:30), Border uplights, "All garden lights off" | `Garden lamps`, garage/driveway outside lights |
| Solar | kW now, forecast today/tomorrow, today's kWh, self-sufficiency, "View energy" → Home. Veined while producing. | `sensor.bt2180260306_active_power`, Forecast.Solar |

Note: the Garden view's mini Solar card and Home's main Solar card are two different elements
and must keep distinct ids (`gs-card` vs `solar-card`) — they collided in an earlier draft.

### 2.8 屋 Utility & guest

| Section | Card | Source |
|---|---|---|
| Entrance & halls 玄 | Entrance — main/entrance/closet lights, outside light, last-visitor pill, closet/motion service line | `Zha entrance` switch, doorbell visitor sensor |
| | Doorbell — live thumbnail (opens the camera lightbox), last visitor, chime toggle, Sound-siren button | `camera.main_entrance_doorbell_fluent`, `switch.main_entrance_doorbell_doorbell_button_sound`, `siren.main_entrance_doorbell_siren` |
| | Hall — rooms/entrance/LED lights, motion, link-rules note | hall main switch gangs, hall LED |
| Bathroom 風呂 | Main bathroom — LED, sink light, main switch, presence (mmWave · iHseno), door | GLEDOPTO controller, Sonoff contact |
| | Hot water — hot water temp/top, mode, temporary-lux boost, "Full heat pump" link | `BA-SVM 10-200/12 E` |
| Laundry & garage 洗 | Laundry — Pralka state, Suszarka countdown, wrinkle-prevent toggle, room light, per-appliance energy, motion. Veined while an appliance runs. | `sensor.pralka_*`, `sensor.suszarka_*`, `switch.*_wrinkle_prevent` |
| | Garage — door (battery 61%), light, outside light, motion | contact sensor, wall switches |
| Pantry & guest suite 客 | Pantry — 2-gang Tuya light, motion (battery 88%) | Tuya switch, motion sensor |
| | Guest suite — SwitchBot 4C23 temperature/humidity, Yeelight Color4 lamp; **own entrance and kitchenette are explicitly marked as not connected** (no lock, no smart socket) rather than simulated | SwitchBot, Yeelight |

There is no attic device on this HA instance, so the Attic row from the first draft is gone —
the attic is a physical space with nothing smart in it yet.

---

## 3. The reusable room template

Every room view (寝, 子, 階, and each section of 居) is the same card shape, minus rows that
don't apply. A new room is a copy of the template with rows removed, not a new design.

```
dash-head       header phrase (kanji) · title · one-line status
                right: clock · one relevant fact (not a fake room temperature)
grid g2         Lights card         — one .light slider per dimmable circuit,
                                      or .vrow + .toggle per on/off circuit
                (stacked under it)  — the room's one "special" card: media, en-suite, TV
grid g3         Room-specific toggles/readings, three to a row:
                doors · routines · sensors · appliances
```

There is **no climate card** in the template — no room on this instance has its own
thermostat or setpoint. A room that needs to reference heating links to the one heat pump
card on Home or Utility instead of pretending to hold a target temperature.

Rules that go with it:

- **Header phrase**: two to four Mincho kanji with spaces (`主 寝 室`), the English title
  beneath it. The tab shows one kanji only.
- **Person accent**: a card owned by one person carries `.person .a-<colour>` (left rail),
  never copper. Tomek copper is an identity colour on the rail only; it is not kintsugi.
- **Kintsugi tiers per domain**, from `examples/seam-tile-card.yaml`:
  - *Tier 1, frame trace* (`--sumi-active`): light on, media playing, vacuum cleaning, fan
    running, washer/dryer running, fire pit lit, sprinkler zone running.
  - *Tier 2, vein* (`.veined`): sauna heating, hot tub heating or bubbling, pool filtering,
    solar producing, mower cutting. Hero cards only.
  - Idle rooms show zero copper. The header crack and selected tab are the only exceptions.
- **Numerals** are always `IBM Plex Mono`, tabular. Units follow with a space (`18.9 °C`, `0.31 kW`).
- **Cut labels before styling them**: a `.vrow` name plus a one-line `em` caption replaces
  a header. Section headers (`.sect`) only when a view has more than one room in it.
- **Polish appliance names stay Polish** where that is what the household says:
  Pralka, Suszarka, Piekarnik, Lampa ognisko. Everything else is English.
- **Missing hardware is a labelled gap, not a placeholder.** "No lock or kitchenette
  connected", "no dedicated entity yet" — say it plainly instead of inventing a control.

### 3.1 Compact utility-tile variant

For rooms in 屋 and the third row of any room view:

```
.card
  .vhead   label (mono, uppercase) · .pill state
  .vrow    name / em caption          .toggle | .val | .chiprow
  .vrow    …                          (three to five rows, no more)
  .act.ghost  optional one action, full width
```

No big number, no slider, no gauge. If a room needs more than five rows it has outgrown the
tile and should become a section of its own.

### 3.2 Camera tile + lightbox

Any `.cam` thumbnail (16:10 aspect by default, 2:1 in a stack) is clickable and keyboard-
operable (`tabindex`, `role="button"`, Enter/Space). Clicking opens a shared lightbox
(`#camlb`) that is populated from a small JS registry (`CAMS`) keyed by camera id: kanji,
title, feed label, the same SVG placeholder art as the thumbnail, one "sub" fact (last
visitor / day-night state), and the camera's full real switch list rendered as toggles
(record, privacy mode, push notifications, FTP upload, infrared-in-night-mode, …) plus any
`siren`/`button` domain control as an action button. Add a new camera by adding one entry to
`CAMS` and one `data-cam="<key>"` attribute — the open/close wiring, Escape-to-close and
backdrop-click are generic.

---

## 4. Navigation off Home

The room tile grid is gone (2026-09-19). Navigation to the other seven views now happens two
ways, and both must keep working:

- **The temperature strip.** Every cell is a button with a `data-goto` (HA:
  `tap_action: navigate`) to the view that owns that room — including the cells showing `—`,
  because a room without a sensor still has a dashboard. The strip is deliberately the
  smallest card on the page: one line of kanji, one line of figures.
- **Attention and status rows.** Each "Needs a hand" note, each Running-now row and the
  doorbell presence chip links to the view where the thing can be dealt with.

There is no `data-goto="none"` placeholder anywhere, and nothing on Home is a dead end. A
room's status phrase is no longer carried on Home at all — Home answers "does anything need
me?", the room views answer "what is this room doing?"

---

## 5. Deliberately excluded from the friendly dashboards

| Excluded | Why | Where it should live |
|---|---|---|
| Radarr, Sonarr, NZBGet, VLC | Backend media plumbing; nobody in the family operates them from a wall panel | a later 設 System view, or not at all |
| Starlink | Network status, not a room | 設 System |
| Zigbee2MQTT / ZHA bridges, LQI / RSSI / linkquality sensors, `_2` / `_3` duplicate entities (including the duplicate `todo.*_2` lists) | Device health and sync duplicates, not house state | 設 System, HA's own device pages |
| FusionSolar's 128 entities beyond active power, today's yield and self-sufficiency | The headline is enough on a dashboard; the rest is analysis | HA's native **Energy** panel covers history, MPPT strings and cost |
| BA-SVM 10-200's 93 myUplink entities beyond hot water, system temp, outdoor temp and compressor Hz | Same reasoning; Home and Utility expose the readings a person actually checks | 設 System or the myUplink app |
| Lay-Z-Spa diagnostics (IP, SSID, restart reason, button pressed) | Already off the hot-tub card; debugging, not living-with | 設 System |
| Phone and watch sensors (Galaxy Watch, SM-A415F, SM-S921B) | Presence and battery feed automations, not a view | automations only |
| Music Assistant's 38 players and groups | A picker inside media cards, never a list of 38 chips | the speaker `select` on each media card |
| `todo.domowe`, `todo.ogrod`, `todo.do_ugotowania` | Real lists that exist but weren't asked for in the To-do card (Tasks / Regular tasks / Groceries only) | fold into Tasks, or give the To-do card a fourth/fifth tab later if wanted |

Per-room climate, blinds, house/grid energy meters, pool water-chemistry probes, a DND toggle
and sauna cabin lighting are not "excluded" — they simply don't exist as entities on this
instance, so they were removed rather than filed here.

---

## 6. Open items

1. **媒体 Media and 図 Plan** — the live dashboard has both. This proposal folds Media into the
   rooms (each room's media card picks its own player) and leaves Plan untouched. Decide whether
   the floor-plan view stays as a ninth tab, moves to its own dashboard, or is retired.
2. **湯 vs 温** — `examples/views-kanji.yaml` maps `wellness / sauna` to 湯; the live dashboard's
   view is 温 Onsen. Recommendation: **温 for the view** (it is the live convention and reads as
   "warm / spring"), **湯 stays the hot-tub card's own mark** and the Sauna-night scene chip.
   Update `views-kanji.yaml` and `card-mod-root` to match.
3. **Per-room speaker groups** — Music Assistant exposes `All speakers`, `All speakers no kids`,
   `Living room and garden`, `Kids' speakers`, `Garden`, `Hall`, `Bathroom`, `Bedroom`. The mock
   hardcodes a short list per card; the real cards need a curated per-room subset, not the full
   38. Decide the subset per view.
4. **Scenes and scripts that do not exist yet** — a fire-pit 3-hour auto-off, and any
   Dinner/Focus-style scenes the household actually wants — are mock-only conveniences and are
   automation work, not dashboard work.
5. **Guest suite lock and kitchenette** — no lock or smart-socket entity exists for the guest
   suite's own entrance or kitchenette. Either add hardware or leave the honest "not connected"
   rows in place.
6. **Attention strip source** — the "Needs a hand" items are hand-picked in the mock from real
   entities. In HA this should be a conditional-card stack (or a template) that shows only true
   problems and hides itself when the list is empty.
7. **Cameras** — resolved: there are exactly two real streams (`camera.main_entrance_doorbell_fluent`,
   `camera.atrium_fluent`), now placed at Home/Solar (doorbell), Utility/Entrance (doorbell,
   same feed) and Garden (atrium) with a shared click-to-expand lightbox (§3.2). No fourth
   camera exists anywhere in the snapshot.
8. **To-do card is UI-only** — the mock's checkboxes and "Add" input change local state, not
   the real `todo.*` lists. Wiring it to HA needs the `todo.get_items` / `todo.add_item` /
   `todo.update_item` services rather than a generic entities card.
9. **Weather/pollen widget thresholds** — the Home weather card colours the pollen pill `ok`
   (moss) for "Low"; the real `allergy_risk` scale (Polleninformation) needs its bands mapped
   to `ok` / `caution` / `alert` once the automation exists, rather than hardcoding "Low".

10. **Weekly and monthly consumption** — FusionSolar publishes consumption for the current
    year only. `utility_meter` helpers with weekly and monthly cycles (a small
    `packages/sumi_energy.yaml`) would replace the sample figures on Home's energy card.
11. **Water metering** — nothing measures water anywhere on this instance. Both the main and
    the garden gauge need a pulse reader (ESPHome or Zigbee counter); until then the Water
    used card shows sample figures.
12. **Waste collection** — no schedule source. The commune's calendar as an ICS feed, or a
    waste-collection integration, would make the Bins card real; it currently shows a sample
    fortnightly cycle.
13. **Family calendar** — the only `calendar.*` entities mirror the to-do lists, plus Radarr.
    The Agenda card needs Google, CalDAV or a local ICS connected; it currently shows a
    sample day.
14. **School timetables** — no source for either child. The weekly popout (Olaf/Zoja tabs,
    5 days × 8 periods with period times) is built and filled with a sample Polish primary
    timetable, waiting on a Vulcan/Librus integration or an ICS export per child.
15. **Alarmo panel entity** — Alarmo is installed (its `update` entity is present) but no
    `alarm_control_panel` is exposed, so the Home alarm bar drives `input_boolean.alarm_armed`
    and validates its code locally. Wiring the real panel gives code validation, arming modes
    and exit delays for free.
16. **Room temperature sensors** — eleven rooms have none. The temperature strip's dashes are
    the shopping list, in rough priority order: master bedroom, both kids' rooms, mezzanine,
    main bathroom, hall, kitchen.

