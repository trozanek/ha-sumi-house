# Sumi House — Full Project Context (handoff pack)

Everything accumulated in the "HA" project, in one place. Paste the relevant sections into the new project's instructions / knowledge.

---

## 1. The house

Barn-style home named **Sumi House (墨の家)**, in Jeziory Małe, Wielkopolska, Poland — near forest and lake.

- **Exterior:** black charred timber, shou sugi ban facade
- **Interior materials:** wood, concrete, copper
- **Design language:** Japandi (Japanese × Scandinavian)
- **Household:** family of four — Tomek, Ania, Olaf, Zoja

### Rooms & zones

| Indoor | Outdoor |
|---|---|
| Living room (integrated with kitchen + dining) | Terrace (rear of house) |
| Kitchen (open to living) | Sauna (quaro barrel type) |
| Dining room (open to living) | Hot tub |
| Mezzanine — multimedia section + work section | Pool |
| Attic | Sprinklers |
| Pantry | Back garden (own robot mower) |
| Entrance hall | Front garden (own robot mower) |
| Interior hall | Garden lighting |
| Master bedroom + ensuite bathroom | |
| Main bathroom | |
| Olaf's bedroom | |
| Zoja's bedroom | |
| Laundry room | |
| Garage | |
| Guest room + own bathroom, kitchenette, own entrance | |

### What's under Home Assistant control

Solar production, energy consumption, cameras, lighting, garden lighting, two lawn mowers, vacuum cleaners, washer & dryer, sprinklers, sauna, hot tub, media servers.

---

## 2. Design system — treat as a fixed contract

**Extend it, don't revisit it.** The visual system is settled.

### Palette & materials
- Shou sugi ban charred ground
- Cast-concrete card surfaces: `#2B2925` with fractal-noise grain and radial light gradients
- Washi paper text tones

### Named tokens
`copper` · `oak` · `moss` · `mizu` · `washi` · `stone` · `char` · `seam`

### Kintsugi rule (the core semantic)
Copper is used **exclusively as kintsugi**: crack seams appear only on cards where something is *actively running, heating, or flowing*. Never decorative on idle surfaces. This rule must be preserved on every future card and view.

### Per-person color identity
A system, not a one-off — applies consistently to seals, vote dots, row borders, active highlights:

- Tomek → copper
- Ania → oak
- Olaf → moss
- Zoja → mizu

### Typography
- **Display:** Zen Old Mincho
- **UI:** Zen Kaku Gothic New
- **Numeric data:** IBM Plex Mono

(All Google Fonts.)

---

## 3. What's been built

### Core dashboard prototype — `sumi-house-mock.html`
Fully interactive single-file prototype, four tab-navigated views:

1. Home
2. Living room
3. Master bedroom
4. Garden & wellness

Working features: live kintsugi vein logic, scene chips, cross-view state sync, animated device states (sauna heating arc, mower battery drain, energy flow branching).

**Agreed next step:** convert the HTML prototype into real HA button-card templates and view YAML.

### Weekly meal planner — fully implemented in HA
Delivered as four files:

- YAML package — 12 `input_text` helpers, 2 scripts, 4 automations
- `sumi-meal-planner-card.js` — custom Lovelace web component
- `meal-plan.json` — sample data
- `INSTALL.md`

Features:
- Unassigned weekly pool split into lunch/dinner groups with left-edge accent borders
- Family voting with per-person color dots and seal actions
- Automatic time-based progression (lunch closes 15:00, dinner 22:00)
- Recipe display for meals with recipes; short descriptions for those without
- Eaten-this-week log
- Google Drive sync for the weekly plan JSON

Architecture note: state lives in `input_text` entities using compact identifiers (e.g. `m1|Mon|lunch`) to stay under the 255-character limit; full recipe data is fetched over HTTP from JSON.

### Sauna widget (related, separate thread)
Custom Lovelace card for sauna control, styled on `github.com/coyot/awesome-ha` (dark, Apple Home-inspired):

- Quaro-type sauna — rectangular barrel, shingled arched roof, metal chimney, glazed front door, metal tension straps
- Thermostat climate entity: target + current temperature, large touch-friendly +/- buttons, plus a circular slider around the temperature number for smooth selection
- Two light entities: vestibule top light, and RGB LED strip under the benches (color + mode/effect control)
- Music Assistant `media_player` integration with playlist selection from local file source
- 3D visualization was **dropped** (took too much space) — replaced by a small sauna-shaped background watermark icon matching the real sauna; freed space went to more controls
- Target device: Sonoff NSPanel — **landscape**, not square; use the landscape space well

---

## 4. Ways of working

- **Prototype first, implement second.** Iterate fully in single-file HTML before touching real HA infrastructure — design refinement without infrastructure cost.
- **Design decisions are constraints, not suggestions.** Once settled, extend rather than re-litigate.
- **Restraint over verbosity.** Recurring preference: headers, titles and descriptive text get cut when they feel visually heavy. Reduce noise by default.
- **Full deliverable packaging.** Ship every file needed plus an `INSTALL.md`.
- **Shadow DOM** for Lovelace web components, to isolate styles from HA's global CSS.
- **Respect HA's hard limits.** The 255-char `input_text` ceiling shapes architecture — compact identifiers + external JSON fetching is the established pattern.

---

## 5. Tools & resources

- **Platform:** Home Assistant — Lovelace, custom web components, `input_text` helpers, automations, scripts
- **Repo:** `github.com/trozanek/ha-sumi-house` (branch `main`) — synced into the project
- **Styling reference:** `github.com/coyot/awesome-ha`
- **Fonts:** Google Fonts — Zen Old Mincho, Zen Kaku Gothic New, IBM Plex Mono
- **External storage:** Google Drive (JSON sync for meal plan data)
- **Prior HA work:** weather-conditional sprinkler automation; Zigbee2MQTT; Google Home integration

---

## 6. Suggested instructions block for the new project

> This project builds on **Sumi House** — a Japandi-styled Home Assistant system for a barn-style home with a shou sugi ban facade and wood/concrete/copper interiors, in Jeziory Małe, Poland. Family of four: Tomek, Ania, Olaf, Zoja.
>
> The design system is a fixed contract: charred ground, cast-concrete cards (`#2B2925` with noise grain and radial gradients), washi text tones; tokens `copper`, `oak`, `moss`, `mizu`, `washi`, `stone`, `char`, `seam`; Zen Old Mincho for display, Zen Kaku Gothic New for UI, IBM Plex Mono for numbers. Copper is used **only** as kintsugi seams on cards where something is actively running, heating or flowing — never decorative. Per-person colors: Tomek=copper, Ania=oak, Olaf=moss, Zoja=mizu.
>
> Work prototype-first in single-file HTML, then convert to real HA YAML / Lovelace web components (Shadow DOM). Ship complete file sets with an `INSTALL.md`. Favor restraint — cut headers and descriptive text that add visual weight. Respect the 255-char `input_text` limit: compact identifiers in state, full data fetched from external JSON.
>
> Rooms: living/kitchen/dining (open plan), mezzanine (multimedia + work), attic, pantry, entrance hall, interior hall, master bedroom + ensuite, main bathroom, Olaf's room, Zoja's room, laundry, garage, guest suite with own entrance/bathroom/kitchenette. Outdoors: terrace, sauna, hot tub, pool, sprinklers, two robot mowers (front and back gardens), garden lighting. Controlled: solar production, energy consumption, cameras, lighting, mowers, vacuums, washer/dryer, sprinklers, sauna, hot tub, media servers.