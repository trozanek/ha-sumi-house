# Dashboards — pre-migration snapshot

Generated 2026-09-18 from `.storage/lovelace*`.

## Dashboards

| Title | URL path | Sidebar | Mode |
|---|---|:-:|---|
| Overview | lovelace (default) | ✓ | storage, hand-built, 12 views |
| Mapa | dashboard-mapa | ✓ | storage, `strategy: map` (auto-generated) |
| Obszary | dashboard-onszary | ✓ | storage, `strategy: areas` (auto-generated) |

There's also a fourth, unlisted `lovelace.map` dashboard (`strategy: map`, not in the sidebar) —
not shown in Settings → Dashboards, likely a leftover.

## Overview dashboard — 12 views

Already uses the Sumi House kanji-prefixed view naming convention (`examples/views-kanji.yaml`), and the Wellness (温 Onsen) view already carries both `sumi-sauna-card` and `sumi-hot-tub-card`.

| View | Type | Cards | Sections | Entities referenced |
|---|---|---:|---:|---:|
| 家 Home | masonry | 15 | 0 | 13 |
| 温 Onsen | sections | 0 | 2 | 9 |
| 庭 Garden | sections | 0 | 7 | 28 |
| 媒体 Media | sections | 0 | 7 | 21 |
| 図 Plan | panel | 1 | 0 | 40 |
| 居間 Living Room | masonry | 34 | 0 | 25 |
| 庖 Kitchen | masonry | 7 | 0 | 9 |
| 寝 Bedroom | masonry | 20 | 0 | 13 |
| 息子 Olaf | masonry | 6 | 0 | 6 |
| 娘 Zoja | masonry | 9 | 0 | 7 |
| 階 Mezzanine | masonry | 8 | 0 | 14 |
| 屋 Washroom | masonry | 5 | 0 | 66 |

### Card types per view

**家 Home**
- `button` × 5
- `grid` × 2
- `custom:webrtc-camera` × 1
- `custom:clock-weather-card` × 1
- `horizontal-stack` × 1
- `custom:mushroom-entity-card` × 1
- `custom:tabbed-card` × 1
- `custom:pollenprognos-card` × 1
- `custom:aha-kosiarka-card` × 1
- `custom:mini-media-player` × 1

**温 Onsen**
- `grid` × 2
- `custom:sumi-sauna-card` × 1
- `custom:sumi-hot-tub-card` × 1

**庭 Garden**
- `tile` × 10
- `button` × 9
- `grid` × 7
- `heading` × 5
- `entities` × 2
- `custom:sumi-sauna-card` × 1
- `horizontal-stack` × 1
- `history-graph` × 1

**媒体 Media**
- `heading` × 7
- `grid` × 7
- `tile` × 6
- `entities` × 3
- `media-control` × 1
- `custom:mass-player-card` × 1

**図 Plan**
- `picture-elements` × 1

**居間 Living Room**
- `button` × 21
- `horizontal-stack` × 6
- `light` × 3
- `grid` × 2
- `area` × 1
- `entity` × 1

**庖 Kitchen**
- `light` × 3
- `horizontal-stack` × 2
- `button` × 1
- `entities` × 1

**寝 Bedroom**
- `button` × 7
- `light` × 4
- `horizontal-stack` × 3
- `area` × 2
- `entity` × 2
- `grid` × 1
- `vertical-stack` × 1

**息子 Olaf**
- `light` × 2
- `area` × 1
- `custom:mini-media-player` × 1
- `entities` × 1
- `grid` × 1

**娘 Zoja**
- `light` × 2
- `grid` × 2
- `picture-entity` × 2
- `area` × 1
- `custom:mini-media-player` × 1
- `entities` × 1

**階 Mezzanine**
- `button` × 3
- `entities` × 2
- `grid` × 2
- `media-control` × 1

**屋 Washroom**
- `entities` × 4
- `light` × 1
