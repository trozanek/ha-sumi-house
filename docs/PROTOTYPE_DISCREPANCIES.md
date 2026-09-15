# Spec vs. prototype — what the theme follows

THEME_SPEC.md §0: *where this spec and the prototype disagree on a value, the prototype
wins — flag the discrepancy rather than silently picking one.* After a side-by-side review
of the rendered theme against `Concepts/sumi-house-mock.html`, the theme now follows the
**prototype** everywhere the two differ in look. This file is the flag: it lists each
divergence, what the prototype does, and what the theme does.

## Palette — prototype adopted (dark mode)

| Role | Spec §3 | Prototype `:root` | Theme |
|---|---|---|---|
| ground (sidebar/header) | `#0F0E0C` | one step under `--char` | `#14100A` |
| view | `#16140F` | `--char #17130E` | `#17130E` |
| card surface | `#2B2925` | `--char-2 #211E1A` | `#211E1A` |
| raised | `#36332E` | `--char-3 #292620` | `#292620` |
| line | `#4A4640` | `--seam #34302A` | `#34302A` |
| ink | `#EDE7DC` | `--washi #EFE7D7` | `#EFE7D7` |
| secondary text | `#B8B0A2` | `--stone #99907F` | `#99907F` |
| copper | `#C98A4B` | `--copper #C0754A` | `#C0754A` |
| copper glow (text) | `#D08B4F` | `--copper-hi #DE9163` | `#DE9163` |
| copper deep | `#8C5626` | `--copper-lo #8C4E2E` | `#8C4E2E` |
| oak / moss / mizu | `#C2A06B / #8FA06A / #7FA3B8` | `#C89F6E / #8B9678 / #7E93A0` | prototype |
| alert / caution | `#CF7B6B / #D4A23F` | not defined | spec values kept |
| ok / info | `#8FA06A / #7FA3B8` | not defined | mapped to moss / mizu |

Consequence: `sumi-copper` on the card surface measures about 4.7:1 — enough for icons, tight for small text — so copper is an
**icon and UI colour**; copper **text** (links, active chip labels, selected sidebar
item, tab indicator) uses `sumi-copper-glow`, exactly as the prototype uses `--copper-hi`.
`scripts/contrast.py` enforces 3:1 for copper and 4.5:1 for copper-glow.

Light mode has no prototype. It keeps the spec's washi surfaces with the prototype's
accent hues darkened; it still needs a visual review.

## Surface and texture — prototype adopted

| Item | Spec | Prototype | Theme |
|---|---|---|---|
| Card light | one radial highlight | highlight `140% 120% at 12% -10%` **and** shadow `130% 140% at 108% 118%`, absolute colours | both, one step stronger (`#2D2924` / `#151210`) so they read at dashboard scale |
| Grain | 4 octaves, overlay blend | 160px tile, 2 octaves, plain layer at 0.035 | prototype |
| Ground | flat `sumi-view` | `.planks`: vertical boards every 96px | `sumi-planks` under the view grain |
| Radii | 4px / 2px | `--r-card 6px`, `--r-chip 4px` | 6px / 4px |
| Card border | 1px `sumi-line` | 1px `--seam` | same |

## Typography — prototype adopted

| Item | Spec | Prototype | Theme |
|---|---|---|---|
| Body weight | 400 | `body { font-weight: 300 }` | `ha-font-weight-body: 300` |
| Heading weight | 400 | `.sect h3 { font-weight: 600 }` | `ha-font-weight-heading: 600` |
| Card header size | 16px | 17px | 17px |
| Micro-labels / units | UI face, 0.12em | `.label`: **mono**, 10px, uppercase, 0.22em | mono, 0.22em |
| Max weight | never 700+ | loads 700 | 600 remains the cap; Kaku Gothic's 500 face answers 600 |

## Kintsugi — prototype adopted, plus the spec's card seam

| | Spec §5.3 | Prototype | Theme |
|---|---|---|---|
| Header | seams prohibited | one long crack under the header, always on | **implemented** in `card-mod-root` (`.header::after`) |
| Active card | irregular seam, 30–60% of an edge | copper-tinted frame, "no crack" | frame tint (`--sumi-active`) on any running device; the vein (`--sumi-seam-opacity`) only on hero cards such as sauna or solar |
| Seam geometry | 1.5–2px stroke | 600×14 box, wide 3.5px halo at 0.16, 1.2px core, 0.8px branches, full width | prototype geometry; seams run the full edge (variant 5 is the 62% spec-style one) |
| Seam colour | core glow, body copper, shadow deep | gradient `copper-lo → #E8A56F → copper-lo` along the vein | gradient `copper-deep → copper-glow → copper-deep` |

The header crack contradicts the spec's "no copper on idle surfaces" rule. It is kept
because it is the prototype's signature and the approved look. To remove it, delete the
`.header::after` block in `card-mod-root`.

## Kept from the spec

- **Hover**: border steps toward ink instead of the prototype's `filter: brightness(1.08)`;
  a filter on `ha-card` breaks `position: fixed` descendants in some cards.
- **Fonts self-hosted**, subset, weights 300–600 (prototype loads Google Fonts at runtime).
- **Copper only while running** on cards; the spec's per-domain "active" rules stand
  (`examples/seam-tile-card.yaml`).

## Dropped after verification against the frontend source (§7.6)

| Spec variable | Finding | Theme |
|---|---|---|
| `state-icon-active-color` | does not exist in the frontend | omitted |
| `ha-font-size-2xs` | HA's scale starts at `xs` | kept as `sumi-font-size-2xs`; HA `xs…4xl` bound by name, `5xl` extrapolated |
| `switch-checked-color` family | gone from current `ha-switch`; still read by older frontends and community cards | kept, marked legacy; `ha-switch-*` bound too |
| `graph-color-1…10` | valid override hook, falls back to `color-1…54` | both bound |
| `md-sys-color-*` | derived locally by HA's wrappers | no override needed |
