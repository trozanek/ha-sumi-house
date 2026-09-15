# Sumi House — Home Assistant Theme Specification

**Repo:** `trozanek/ha-sumi-house`
**Theme id:** `sumi_house`
**Version:** 1.0 (spec — no implementation yet)
**Audience:** Claude Code, implementing from an empty repo.

---

## 0. How to use this document

This spec has three layers. Implement them in order; each depends on the one above.

| Layer | What it is | Where it lives | Can HA theme YAML do it? |
|---|---|---|---|
| **1 — Tokens** | The named palette, type scale, radii, motion | §3 (this doc) + `themes/sumi_house.yaml` | Yes — as custom CSS variables |
| **2 — Theme map** | Every HA frontend variable bound to a token | `themes/sumi_house.yaml` | Yes |
| **3 — Styling** | Grain, kintsugi seams, typography application, card anatomy | `card-mod` blocks in the theme + `www/sumi-house/` | **No** — needs card-mod / custom elements |

**Hard rule:** a Home Assistant theme file can only declare CSS custom properties. It cannot contain selectors, `@font-face`, pseudo-elements, media queries, or `@import`. Everything in Layer 3 therefore runs through `card-mod` theme blocks or a loaded JS module. Do not attempt to express Layer 3 in plain theme YAML.

**Treat §2 as a fixed contract.** The Sumi House visual language is already established and approved in the `sumi-house-mock.html` prototype. Extend it; do not redesign it. Where this spec and the prototype disagree on a value, the prototype wins — flag the discrepancy rather than silently picking one.

---

## 1. What this theme is for

The house is a barn-form building with a charred black *shou sugi ban* facade; interiors are wood, cast concrete and copper, laid out in a Japandi idiom. The dashboard is not a control panel styled to look nice — it is meant to read as a surface of the same building.

Rooms and zones the theme must eventually serve: entrance hall, interior hall, living room (integrated with kitchen and dining), terrace, mezzanine (multimedia + work), attic, pantry, master bedroom + ensuite, main bathroom, Olaf's bedroom, Zoja's bedroom, laundry, garage, guest suite (own entrance, bathroom, kitchenette). Outdoors: sauna, hot tub, pool, sprinklers, front-garden mower, back-garden mower, garden lighting. Systems: solar production, consumption, cameras, lighting, vacuums, washer/dryer, media servers.

Family: Tomek, Ania, Olaf, Zoja.

---

## 2. Design contract (non-negotiable)

1. **Ground is charred, not black.** Never `#000`. The darkest surface keeps a warm brown-grey cast.
2. **Cards are cast concrete**, not floating glass. Matte, grained, lit by a single soft gradient from the upper left. No glassmorphism, no blur, no drop shadows that imply float.
3. **Copper is kintsugi — semantic, never decorative.** A copper seam appears on a card *only* while something is actively running, heating, flowing, or drawing power. Idle cards have no copper anywhere. This is the single most important rule in the system.
4. **Text is washi**, a warm off-white. Never `#FFF`.
5. **Per-person colour is a system**, applied consistently across seals, dots, row borders and active highlights: **Tomek = copper · Ania = oak · Olaf = moss · Zoja = mizu**.
6. **Restraint over verbosity.** Headers, descriptions and labels get cut before they get styled. If a title can be inferred from context, remove it.
7. **No default Material blue, no HA amber, no saturated UI colour anywhere.** Every hue in the theme is drawn from the token palette.
8. **Typography:** Zen Old Mincho (display) · Zen Kaku Gothic New (UI) · IBM Plex Mono (all numerals and data).
9. **Motion is slow and settled.** Nothing bounces. Nothing pulses for attention except an actual alert.

---

## 3. Layer 1 — Token palette

All tokens are declared in the theme as custom variables (`sumi-*`, written without the leading `--` in YAML; HA adds it). Layer 2 and Layer 3 reference **only** these tokens — no raw hex outside this section.

### 3.1 Surfaces — dark mode (`sumi` / 墨, the default)

| Token | Hex | Role |
|---|---|---|
| `sumi-ground` | `#0F0E0C` | App background, sidebar, header — deepest char |
| `sumi-view` | `#16140F` | View / dashboard background |
| `sumi-surface` | `#2B2925` | **Card surface (fixed — from prototype)** |
| `sumi-surface-raised` | `#36332E` | Hover, popup, dialog, nested card |
| `sumi-line` | `#4A4640` | Dividers, card borders, outlines |
| `sumi-muted` | `#6B665E` | Disabled elements, inactive icons |

### 3.2 Surfaces — light mode (`washi` day)

| Token | Hex | Role |
|---|---|---|
| `sumi-ground` | `#E6E1D7` | App background, sidebar, header |
| `sumi-view` | `#F2EEE6` | View background |
| `sumi-surface` | `#FAF7F1` | Card surface |
| `sumi-surface-raised` | `#FFFDF8` | Hover, popup, dialog |
| `sumi-line` | `#D6D0C4` | Dividers, borders |
| `sumi-muted` | `#A39C90` | Disabled |

Light mode is the same building at midday — not a different design. Grain opacity halves, the light gradient inverts to a cooler top-left wash, and copper darkens. Everything else holds.

### 3.3 Ink

| Token | Dark | Light | Role |
|---|---|---|---|
| `sumi-ink` | `#EDE7DC` | `#1E1C19` | Primary text |
| `sumi-ink-soft` | `#B8B0A2` | `#5A544B` | Secondary text, labels |
| `sumi-ink-faint` | `#8A8277` | `#7A7368` | Tertiary, units, timestamps |
| `sumi-ink-disabled` | `#5C574F` | `#B0A99C` | Disabled text |

### 3.4 Accents

| Token | Dark | Light | Meaning |
|---|---|---|---|
| `sumi-copper` | `#C98A4B` | `#8C5626` | Kintsugi seam, active state, Tomek |
| `sumi-copper-deep` | `#8C5626` | `#6E4219` | Seam shadow, pressed state |
| `sumi-copper-glow` | `#D08B4F` | `#A6692F` | Seam highlight core |
| `sumi-oak` | `#C2A06B` | `#8A6D3B` | Warm wood, Ania |
| `sumi-moss` | `#8FA06A` | `#566338` | Growth / outdoor / OK, Olaf |
| `sumi-mizu` | `#7FA3B8` | `#3F5C6E` | Water / cool / climate, Zoja |
| `sumi-stone` | `#8A8277` | `#7A7368` | Neutral data, grid import |

### 3.5 Status

| Token | Dark | Light | Use |
|---|---|---|---|
| `sumi-alert` | `#CF7B6B` | `#9B4437` | Error, leak, offline, fault |
| `sumi-caution` | `#D4A23F` | `#8A6A16` | Warning, low battery, filter due |
| `sumi-ok` | `#8FA06A` | `#566338` | Success, armed, complete |
| `sumi-info` | `#7FA3B8` | `#3F5C6E` | Information, idle-but-connected |

### 3.6 Contrast — verified

Measured against the card surface in each mode (WCAG 2.1 relative luminance):

| Token | Dark on `#2B2925` | Light on `#FAF7F1` | Verdict |
|---|---|---|---|
| `sumi-ink` | 11.80 | 15.90 | AAA body |
| `sumi-ink-soft` | 6.75 | 7.00 | AAA body |
| `sumi-ink-faint` | 3.83 | 4.38 | AA large / non-text only |
| `sumi-copper` | 4.99 | 5.65 | AA body |
| `sumi-oak` | 5.90 | 4.53 | AA body |
| `sumi-moss` | 5.12 | 6.07 | AA body |
| `sumi-mizu` | 5.42 | 6.62 | AA body |
| `sumi-alert` | 4.63 | 6.00 | AA body |
| `sumi-caution` | 6.25 | 4.73 | AA body |

`sumi-copper-deep` at `#8C5626` measures 2.4 on dark card — **it is a seam-shadow and border colour only, never text or an icon.** Same for `sumi-ink-faint` used as text below 16px.

**Acceptance:** any new colour added later must clear 4.5:1 against `sumi-surface` in its own mode before it ships. Re-run `scripts/contrast.py` (Layer 4 deliverable).

### 3.7 Typography tokens

| Token | Value |
|---|---|
| `sumi-font-display` | `'Zen Old Mincho', serif` |
| `sumi-font-ui` | `'Zen Kaku Gothic New', -apple-system, sans-serif` |
| `sumi-font-mono` | `'IBM Plex Mono', ui-monospace, monospace` |

Scale (bind HA's own `ha-font-size-*` tokens to these):

| Step | Size | Use |
|---|---|---|
| `2xs` | 10px | Units, micro-labels — always uppercase, `letter-spacing: 0.12em` |
| `xs` | 11px | Card sub-labels |
| `s` | 13px | Secondary text |
| `m` | 14px | Body / default |
| `l` | 16px | Card header |
| `xl` | 20px | Section header (display font) |
| `2xl` | 28px | Primary metric |
| `3xl` | 36px | Hero metric (mono) |
| `4xl` | 48px | View title (display font) |

Weights: light 300 · normal 400 · medium 500 · bold 600. **Never 700+** — the type is quiet.

### 3.8 Geometry & motion

| Token | Value | Note |
|---|---|---|
| `sumi-radius-card` | `4px` | ⚠️ **Confirm against `sumi-house-mock.html` before committing.** Japandi favours a near-square corner; HA's default 12px is wrong here. |
| `sumi-radius-control` | `2px` | Chips, buttons, toggles |
| `sumi-gap` | `8px` | Grid gutter |
| `sumi-pad-card` | `16px` | Card interior padding |
| `sumi-ease` | `cubic-bezier(0.22, 1, 0.36, 1)` | The only easing curve |
| `sumi-dur-fast` | `180ms` | Hover, focus |
| `sumi-dur-base` | `420ms` | State change |
| `sumi-dur-slow` | `900ms` | Seam ignition, arcs, flow animation |

All Layer 3 animation must be wrapped in `@media (prefers-reduced-motion: reduce)` guards that collapse to a static end-state.

---

## 4. Layer 2 — `themes/sumi_house.yaml`

### 4.1 Structure

```yaml
Sumi House:
  # --- token layer: every value below this point references these ---
  sumi-surface: "#2B2925"
  # …all §3 tokens…

  # --- HA variable map (mode-independent values) ---
  ha-card-border-radius: "var(--sumi-radius-card)"
  # …

  modes:
    dark:
      sumi-ground: "#0F0E0C"
      # …dark overrides of §3.1–3.5…
    light:
      sumi-ground: "#E6E1D7"
      # …light overrides…
```

Tokens that differ per mode are declared **only** inside `modes:`. The HA variable map sits outside `modes:` and references tokens with `var(--sumi-…)`, so it is written once and resolves correctly in both modes. Do not duplicate the HA map inside each mode.

Wire it up with:

```yaml
# configuration.yaml
frontend:
  themes: !include_dir_merge_named themes/
  extra_module_url:
    - /local/sumi-house/sumi-fonts.js
```

### 4.2 Required variable map

Every variable below must be present and bound to a token. Values shown are the token, not the hex.

**Text**

| HA variable | Token |
|---|---|
| `primary-text-color` | `sumi-ink` |
| `secondary-text-color` | `sumi-ink-soft` |
| `text-primary-color` | `sumi-ground` *(text drawn on top of `primary-color`)* |
| `disabled-text-color` | `sumi-ink-disabled` |

**Core**

| HA variable | Token |
|---|---|
| `primary-color` | `sumi-copper` |
| `dark-primary-color` | `sumi-copper-deep` |
| `light-primary-color` | `sumi-oak` |
| `accent-color` | `sumi-copper` |
| `divider-color` | `sumi-line` |
| `outline-color` | `sumi-line` |
| `outline-hover-color` | `sumi-copper` |

**Backgrounds**

| HA variable | Token |
|---|---|
| `primary-background-color` | `sumi-view` |
| `secondary-background-color` | `sumi-ground` |
| `card-background-color` | `sumi-surface` |
| `clear-background-color` | `sumi-surface` |
| `ha-card-background` | `sumi-surface` |

**Card**

| HA variable | Value |
|---|---|
| `ha-card-border-radius` | `var(--sumi-radius-card)` |
| `ha-card-border-width` | `1px` |
| `ha-card-border-color` | `sumi-line` |
| `ha-card-box-shadow` | `none` — concrete does not float |
| `ha-card-header-color` | `sumi-ink` |
| `ha-card-header-font-size` | `var(--ha-font-size-l)` |
| `ha-card-header-font-family` | `var(--sumi-font-display)` |

**Sidebar & header** — both sit on `sumi-ground`, one shade below the view, so the dashboard reads as the lit surface.

| HA variable | Token |
|---|---|
| `sidebar-background-color` | `sumi-ground` |
| `sidebar-text-color` | `sumi-ink-soft` |
| `sidebar-icon-color` | `sumi-ink-faint` |
| `sidebar-selected-text-color` | `sumi-ink` |
| `sidebar-selected-icon-color` | `sumi-copper` |
| `app-header-background-color` | `sumi-ground` |
| `app-header-text-color` | `sumi-ink` |

**States & icons**

| HA variable | Token |
|---|---|
| `state-icon-color` | `sumi-ink-faint` |
| `state-icon-active-color` | `sumi-copper` |
| `state-icon-unavailable-color` | `sumi-muted` |
| `state-icon-error-color` | `sumi-alert` |
| `state-active-color` | `sumi-copper` |
| `state-inactive-color` | `sumi-ink-faint` |
| `state-unavailable-color` | `sumi-muted` |

**Per-domain state colours** — HA resolves `state-{domain}-{device_class}-{state}-color` → `state-{domain}-{state}-color` → `state-{domain}-(active|inactive)-color` → `state-(active|inactive)-color`. Set these for the house's actual devices:

| HA variable | Token | Why |
|---|---|---|
| `state-light-active-color` | `sumi-copper` | Light is warmth |
| `state-switch-active-color` | `sumi-copper` | |
| `state-binary_sensor-active-color` | `sumi-copper` | |
| `state-climate-heat-color` | `sumi-copper` | Sauna, hot tub, heating |
| `state-climate-cool-color` | `sumi-mizu` | |
| `state-climate-auto-color` | `sumi-oak` | |
| `state-water_heater-active-color` | `sumi-copper` | |
| `state-media_player-active-color` | `sumi-oak` | Mezzanine + media servers |
| `state-media_player-inactive-color` | `sumi-ink-faint` | |
| `state-vacuum-active-color` | `sumi-moss` | |
| `state-lawn_mower-active-color` | `sumi-moss` | Front + back mowers |
| `state-valve-active-color` | `sumi-mizu` | Sprinklers |
| `state-cover-active-color` | `sumi-oak` | |
| `state-lock-locked-color` | `sumi-ok` | |
| `state-lock-unlocked-color` | `sumi-caution` | |
| `state-alarm_control_panel-armed_away-color` | `sumi-ok` | |
| `state-alarm_control_panel-triggered-color` | `sumi-alert` | |
| `state-sensor-battery-low-color` | `sumi-caution` | |
| `state-person-home-color` | `sumi-copper` | |
| `state-person-not_home-color` | `sumi-ink-faint` | |
| `state-update-active-color` | `sumi-info` | |

**Energy** — solar production is the one place copper is allowed to be generous, because production *is* flow.

| HA variable | Token |
|---|---|
| `energy-solar-color` | `sumi-copper` |
| `energy-grid-consumption-color` | `sumi-stone` |
| `energy-grid-return-color` | `sumi-moss` |
| `energy-battery-in-color` | `sumi-oak` |
| `energy-battery-out-color` | `sumi-mizu` |
| `energy-non-fossil-color` | `sumi-moss` |
| `energy-gas-color` | `sumi-copper-deep` |
| `energy-water-color` | `sumi-mizu` |

**Status**

`error-color` → `sumi-alert` · `warning-color` → `sumi-caution` · `success-color` → `sumi-ok` · `info-color` → `sumi-info`

**Controls**

| HA variable | Token |
|---|---|
| `switch-checked-color` / `switch-checked-button-color` | `sumi-copper` |
| `switch-checked-track-color` | `sumi-copper-deep` |
| `switch-unchecked-button-color` | `sumi-ink-faint` |
| `switch-unchecked-track-color` | `sumi-line` |
| `slider-color` | `sumi-copper` |
| `slider-secondary-color` | `sumi-copper-deep` |
| `slider-track-color` | `sumi-line` |

**Inputs** — bind all of: `input-idle-line-color`, `input-hover-line-color` (`sumi-copper`), `input-disabled-line-color`, `input-outlined-idle-border-color`, `input-outlined-hover-border-color`, `input-outlined-disabled-border-color`, `input-fill-color` (`sumi-surface-raised`), `input-disabled-fill-color`, `input-ink-color` (`sumi-ink`), `input-label-ink-color` (`sumi-ink-soft`), `input-disabled-ink-color`, `input-dropdown-icon-color`.

**Material bridge** — HA still resolves parts of the UI (dialogs, menus, some pickers) through MDC and, in newer builds, `md-sys-color-*`. Bind at minimum: `mdc-theme-primary` → `sumi-copper`, `mdc-theme-secondary` → `sumi-oak`, `mdc-theme-surface` → `sumi-surface`, `mdc-theme-background` → `sumi-view`, `mdc-theme-on-primary` → `sumi-ground`, `mdc-theme-on-surface` → `sumi-ink`, `mdc-theme-error` → `sumi-alert`, plus `mdc-dialog-heading-ink-color`, `mdc-dialog-content-ink-color`, `mdc-dialog-scroll-divider-color`.

**Data tables**

`data-table-background-color` → `sumi-surface` · `table-header-background-color` → `sumi-ground` · `table-row-background-color` → `sumi-surface` · `table-row-alternative-background-color` → `sumi-surface-raised`

**Typography** — bind HA's font tokens so the whole frontend picks up the type system, not just cards:

`ha-font-family-body` → `sumi-font-ui` · `ha-font-family-heading` → `sumi-font-display` · `ha-font-family-code` → `sumi-font-mono` · `ha-font-family-longform` → `sumi-font-display` · `ha-font-size-2xs`…`4xl` → §3.7 scale · `ha-font-weight-light/normal/medium/bold` → 300/400/500/600 · `ha-font-weight-heading` → 400 · `ha-font-weight-action` → 500 · `ha-line-height-condensed` `1.2` · `ha-line-height-normal` `1.5` · `ha-line-height-expanded` `1.75` · `ha-font-smoothing` `antialiased`.

**Graph / chart colours** — `graph-color-1` … `graph-color-10`, in this order, so multi-series charts degrade gracefully:
`sumi-copper`, `sumi-mizu`, `sumi-moss`, `sumi-oak`, `sumi-stone`, `sumi-copper-deep`, `#5E7F91` (mizu-deep), `#6B7A4E` (moss-deep), `#9A7F52` (oak-deep), `#5C574F` (stone-deep).

**Palette overrides** — HA's named colour variables (`red-color`, `blue-color`, `green-color`, `amber-color`, …) leak into badges, labels and some custom cards. Override the full set to the nearest Sumi token so no stock Material hue can appear: red→`sumi-alert`, pink/purple/deep-purple/indigo→`sumi-copper-deep`, blue/light-blue/cyan→`sumi-mizu`, teal/green/light-green/lime→`sumi-moss`, yellow/amber/orange/deep-orange/brown→`sumi-oak`, grey/dark-grey/blue-grey→`sumi-stone`, black→`sumi-ground`, white→`sumi-ink`. Also override the `rgb-*` variants (`rgb-primary-color`, `rgb-accent-color`, `rgb-card-background-color`, `rgb-primary-text-color`, `rgb-secondary-text-color`, `rgb-text-primary-color`) — several community cards compute `rgba()` from these, and an unset one falls back to Material blue.

---

## 5. Layer 3 — Styling layer

Everything here requires **card-mod** (HACS). The theme activates it by declaring `card-mod-theme: Sumi House` and then supplying CSS in `card-mod-card`, `card-mod-view`, `card-mod-root`, `card-mod-sidebar`, `card-mod-more-info`.

### 5.1 Fonts

Theme YAML cannot declare `@font-face`. Ship `www/sumi-house/sumi-fonts.js` as a tiny module that injects a stylesheet into `document.head`, and register it under `frontend.extra_module_url`. Self-host the WOFF2 files in `www/sumi-house/fonts/` — do not rely on Google Fonts at runtime; the dashboard must render correctly with no internet.

Subsets: Zen Old Mincho and Zen Kaku Gothic New need Latin + Latin-Ext (Polish diacritics: ą ć ę ł ń ó ś ź ż) and the Japanese subset for the 墨の家 mark. `font-display: swap`.

### 5.2 Card surface — concrete

Applied to every `ha-card` via `card-mod-card`:

1. **Base:** `background: var(--sumi-surface)`, 1px `var(--sumi-line)` border, `border-radius: var(--sumi-radius-card)`, no box-shadow.
2. **Grain:** a `::before` overlay carrying an inline SVG `feTurbulence` (`type="fractalNoise"`, `baseFrequency="0.8"`, `numOctaves="4"`) as a data URI, at `opacity: 0.035` dark / `0.02` light, `mix-blend-mode: overlay`, `pointer-events: none`, `inset: 0`. URL-encode `#` as `%23` inside the data URI or the CSS breaks silently.
3. **Light:** a `::after` radial gradient, `radial-gradient(120% 90% at 20% 0%, rgba(255,246,232,0.045), transparent 60%)` in dark mode; in light mode invert to a cool wash, `radial-gradient(120% 90% at 20% 0%, rgba(255,255,255,0.7), transparent 65%)`. One light source, upper-left, always.
4. Both pseudo-elements sit below content (`z-index: 0`) with card content raised to `z-index: 1`.

### 5.3 Kintsugi seams

The defining mechanic. A seam is a copper vein along a card edge that exists **only while that card's subject is active**.

- **Geometry:** an irregular path, not a straight rule. Implement as an SVG `<path>` (preferred — real kintsugi is jagged) or, where SVG cannot be injected, a `linear-gradient` with hard colour stops at irregular positions to fake the break. Never a plain 2px solid line.
- **Placement:** one seam per card, entering from a card edge and travelling 30–60% of that edge. Vary the path per card so no two seams are identical; a fixed set of 4–6 seam paths, assigned by card, is sufficient.
- **Colour:** core `sumi-copper-glow`, body `sumi-copper`, shadow `sumi-copper-deep` at the edges of the stroke. Stroke width 1.5–2px.
- **Trigger:** a card-mod Jinja template on the card sets `--sumi-seam-opacity: 1` when the entity is active (on / heating / running / flowing / producing) and `0` when not. The seam element is always in the DOM; only opacity animates. Never add or remove nodes on state change.
- **Ignition:** `transition: opacity var(--sumi-dur-slow) var(--sumi-ease)`. It warms in, it does not blink.
- **Prohibited:** seams on cards that are merely *selected*, *hovered*, *expanded*, or showing a non-zero-but-idle reading. Prohibited on headers, the sidebar, view backgrounds and any container. If you cannot name the device that is running, there is no seam.

**Active means, per domain:** light on · switch on · climate actively heating or cooling (not merely `on` at setpoint) · water_heater heating · media_player playing · vacuum/lawn_mower cleaning or mowing · valve open · washer/dryer running · solar producing > 0 W · camera streaming while viewed.

### 5.4 Typography application

- View titles and section headers: `sumi-font-display`, weight 400, `letter-spacing: 0.02em`.
- Card headers: `sumi-font-display`, 16px, weight 400. Lowercase-preserving — do not uppercase headers.
- Body, labels, buttons: `sumi-font-ui`, weight 400/500.
- **Every numeral is mono.** Temperatures, wattage, battery %, timers, clock, humidity — all `sumi-font-mono`, `font-variant-numeric: tabular-nums`, so digits do not jitter as values update. This includes numbers inside HA's stock cards, which needs a card-mod rule targeting `.state`, `.value`, and the gauge/statistic value slots.
- Units are separate from values: `sumi-font-ui`, `2xs`, uppercase, `letter-spacing: 0.12em`, `sumi-ink-faint`, and never the same size as the value.

### 5.5 Iconography

MDI outline weight throughout; no filled icon variants. Icons are `sumi-ink-faint` at rest and `sumi-copper` when active, size 22px default. No emoji, anywhere, in any card, label or view name.

### 5.6 Per-person identity

Expose as tokens: `sumi-person-tomek` → `sumi-copper`, `sumi-person-ania` → `sumi-oak`, `sumi-person-olaf` → `sumi-moss`, `sumi-person-zoja` → `sumi-mizu`. Every person-scoped element — presence badge, vote dot, seal, row left-border, calendar entry, task assignment — reads from these and nothing else. A fifth person added later gets a new token, not a reused one.

### 5.7 Sidebar, header, view

- Sidebar: `sumi-ground`, no separator shadow; the selected item carries a 2px copper left-edge rule, not a filled pill.
- Header: `sumi-ground`, no elevation shadow, 1px `sumi-line` bottom border.
- View background: `sumi-view`, with the same grain overlay at half opacity (`0.018`) applied via `card-mod-view` — the room itself is textured, not only the objects in it.
- Scrollbars: `sumi-line` thumb on transparent track, 6px, no arrows.

### 5.8 Motion

| Event | Duration | Property |
|---|---|---|
| Hover / focus | `sumi-dur-fast` | border-color, icon color |
| Toggle, state change | `sumi-dur-base` | color, background |
| Seam ignition | `sumi-dur-slow` | opacity |
| Progress arcs (sauna heat-up, mower battery, wash cycle) | continuous | `stroke-dashoffset` |
| Energy flow | continuous, ≥ 3s per cycle | `stroke-dashoffset` |

All of it collapses to static end-state under `prefers-reduced-motion: reduce`. No transform-based entrance animations on card load — the dashboard is already there when you look at it.

---

## 6. Repo layout to produce

```
ha-sumi-house/
├─ README.md                      # install + screenshots
├─ THEME_SPEC.md                  # this document
├─ themes/
│  └─ sumi_house.yaml             # Layers 1+2 and the card-mod blocks of Layer 3
├─ www/
│  └─ sumi-house/
│     ├─ sumi-fonts.js            # @font-face injector for extra_module_url
│     └─ fonts/                   # self-hosted woff2 subsets
├─ docs/
│  ├─ tokens.md                   # generated token reference table
│  └─ INSTALL.md                  # HACS + manual, reload steps, troubleshooting
└─ scripts/
   ├─ contrast.py                 # WCAG check over the token table
   └─ lint_theme.py               # YAML parse + variable-name whitelist check
```

Follow the established Sumi House packaging convention: the deliverable includes every file needed plus an `INSTALL.md`; nothing is left as "and then configure X yourself".

---

## 7. HA reality checks

Things that will bite the implementation:

1. **Theme variables in YAML omit the `--`.** `ha-card-background: "#2B2925"`, not `--ha-card-background`. References inside values keep it: `"var(--sumi-surface)"`.
2. **Theme changes need a reload,** not a restart: Developer Tools → YAML → Reload Themes. Font and `extra_module_url` changes need a hard browser refresh and often a cache-busting query string.
3. **Themes do not cascade into Shadow DOM automatically** for everything — custom elements that do not inherit HA's variables need card-mod or their own variable plumbing. Sumi House's own Lovelace components already use Shadow DOM; they must consume `var(--sumi-*)` with sensible fallbacks so they render correctly even if the theme is not active.
4. **HA 2025.5 removed the entire `--paper-*` family.** Do not use `--paper-item-icon-color`, `--paper-font-*` or any `paper-tab` selector. Use `--state-icon-color`, the `--ha-font-*` tokens, and `sl-tab`.
5. **Newer HA components resolve through `--md-sys-color-*`.** If a dialog or picker shows stock Material colours after the map in §4.2 is complete, inspect it and add the `md-sys-color-*` override rather than assuming the variable does not exist.
6. **Verify before inventing.** Any variable name not listed in §4.2 must be confirmed in browser DevTools on a live HA instance before it enters the theme file. A theme that sets non-existent variables is not an error — it is silent dead weight that later reads as intent. Delete anything you could not verify.
7. **Card-mod is a hard dependency for Layer 3.** State it in `INSTALL.md`. Layers 1+2 must degrade gracefully without it: the theme should still look correct, just without grain and seams.
8. **`user` / `frontend` theme selection is per-browser-profile.** The install doc needs to say so, or it will look like the theme did not apply.

---

## 8. Acceptance criteria

The theme is done when all of the following hold:

- [ ] `themes/sumi_house.yaml` parses, loads, and appears in the theme picker as **Sumi House**.
- [ ] Every variable in §4.2 is present and resolves to a token — no raw hex outside the token block.
- [ ] Switching the browser between light and dark produces two coherent modes, not one good and one broken.
- [ ] `scripts/contrast.py` passes: all text tokens ≥ 4.5:1 against `sumi-surface` in their own mode.
- [ ] No stock Material blue, amber or grey is visible anywhere: dashboard, settings, developer tools, history, logbook, energy, media, dialogs, more-info, the entity picker, the code editor.
- [ ] All three typefaces load and render offline, with Polish diacritics correct.
- [ ] All numerals render mono and tabular, including inside stock HA cards and the history/statistics charts.
- [ ] Grain is visible on cards and view background at a glance-level, not obvious at reading distance.
- [ ] **Seam audit:** on a dashboard where nothing is running, there is zero copper on screen except the selected sidebar rule. Turn on one light — exactly one seam ignites.
- [ ] Nothing animates on page load. All motion respects `prefers-reduced-motion`.
- [ ] `INSTALL.md` takes a fresh HA install to a working themed dashboard with no undocumented steps.
- [ ] Rendered side-by-side against `sumi-house-mock.html`, the theme reads as the same design system.

---

## 9. Out of scope / open

Not this deliverable — these come after the theme lands:

- Card templates and view YAML (the agreed next step after the prototype: converting the mock into real `button-card` templates and view YAML).
- The meal planner card, which is already built and must be re-checked against the final tokens once the theme exists.
- Room-by-room view layouts for the 16 interior spaces and the garden zones.
- Dashboard-level information architecture.

**Open questions to resolve before implementation:**

1. `sumi-radius-card` — 4px is proposed; confirm against the approved prototype.
2. Does the prototype's card surface use a border, or only the grain/gradient edge? §5.2 assumes a 1px `sumi-line` border.
3. Light mode has no prototype precedent. The §3.2 palette is a derivation, not an approved design — it needs a visual review before it is treated as contract.