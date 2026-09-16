# Sumi House · 墨の家

A Home Assistant theme for a charred-timber barn house: warm char ground, cast-concrete
cards, copper only where something is actually running. Plus the house's own custom
cards, in the same repository.

**Spec:** [THEME_SPEC.md](THEME_SPEC.md) · **Install:** [docs/INSTALL.md](docs/INSTALL.md) · **Tokens:** [docs/tokens.md](docs/tokens.md)

## The contract in one breath

Ground is charred, never `#000`. Cards are matte concrete lit from the upper left — no
glass, no float. Copper is kintsugi: a seam appears on a card only while its device is
on, heating, flowing or producing; an idle dashboard has no copper on it. Text is washi.
Zen Old Mincho for display, Zen Kaku Gothic New for UI, IBM Plex Mono for every numeral.
Per-person colour is a system: Tomek copper · Ania oak · Olaf moss · Zoja mizu. Motion
is slow and settled.

## What is in the repository

```
ha-sumi-house/
├─ themes/sumi_house.yaml        Layers 1+2 (tokens, HA variable map) and the card-mod blocks of Layer 3
├─ www/sumi-house/
│  ├─ sumi-fonts.js              @font-face injector, registered via frontend.extra_module_url (generated)
│  ├─ fonts/                     38 self-hosted WOFF2 subsets + OFL licences + manifest (generated)
│  └─ cards/                     the house's custom Lovelace cards (dashboard resources)
│     ├─ sumi-vessel-shared.js   gauge geometry, drag/debounce, light-swatch matching — shared by the cards below
│     ├─ sumi-sauna-card.js      one card for the whole sauna — spec in docs/cards/sauna.md
│     └─ sumi-hot-tub-card.js    one card for the whole hot tub — spec in docs/cards/hot-tub.md
├─ packages/                     HA packages the cards depend on — helpers, automations, derived sensors
│  ├─ sumi_common.yaml           house-wide values every package reads (currently: the shared energy tariff)
│  ├─ sumi_sauna.yaml            helpers, sensors and automations the sauna card needs
│  └─ sumi_hot_tub.yaml          helpers, sensors and automations the hot tub card needs
├─ docs/
│  ├─ INSTALL.md                 fresh HA → themed dashboard, HACS or sync script, troubleshooting
│  ├─ PROTOTYPE_DISCREPANCIES.md where the spec and the prototype disagree, and what the theme does
│  ├─ tokens.md                  token reference with contrast measurements (generated)
│  └─ cards/                     one specification per custom card (entity contract, YAML schema, behaviour)
├─ examples/
│  ├─ configuration.yaml         the frontend: + homeassistant: packages: blocks
│  ├─ seam-tile-card.yaml        how a card ignites its kintsugi seam
│  ├─ views-kanji.yaml           view paths → tab kanji
│  ├─ sauna-card.yaml            full sumi-sauna-card configuration
│  ├─ hot-tub-card.yaml          full sumi-hot-tub-card configuration
│  └─ resources.yaml             registering the custom cards
├─ scripts/
│  ├─ install.sh                 rsync themes/ and www/sumi-house/ into a HA config dir (local or ssh)
│  ├─ lint_theme.py              parse + spec rules + variable-name verification
│  ├─ contrast.py                WCAG check over the token table
│  ├─ fetch_fonts.py             (re)download the font subsets and regenerate the loader
│  ├─ gen_seams.py               regenerate the seam mask tokens
│  ├─ gen_tokens_doc.py          regenerate docs/tokens.md
│  ├─ preview.py                 local preview server: real theme + fonts + card-mod CSS, no HA needed
│  └─ ha_frontend_variables.txt  every CSS variable in home-assistant/frontend (the lint whitelist)
├─ preview/                      HTML stand-in dashboard for scripts/preview.py (icons, mock chrome, generated CSS)
├─ Concepts/                     the approved HTML prototype, card mock-ups and handoff notes (not synced to HA)
├─ hacs.json                     makes the repo installable through HACS as a Theme
└─ THEME_SPEC.md                 the specification this implements
```

The tree mirrors a Home Assistant `/config` directory on purpose: `themes/` and `www/`
copy straight across.

## Theme and cards in one repository

HACS installs a repository as exactly **one** type — a *Theme* repo must have
`themes/<name>.yaml`, a *Dashboard* (plugin) repo must have the card JS in `dist/` or the
root — and the same GitHub URL cannot be added twice under two types. So a single repo
cannot be *both* to HACS.

For personal use that does not matter. This repo is laid out so that:

- **`scripts/install.sh`** syncs the theme *and* `www/sumi-house/` (fonts, loader, cards)
  into `/config` in one go — the intended path.
- The repo still **qualifies as a HACS Theme** (`themes/sumi_house.yaml` + `hacs.json`),
  so the theme half can be installed through HACS if you ever want update notifications.
  The `www/` half is then copied by hand or with the script.
- Cards are plain **dashboard resources** at `/local/sumi-house/cards/<card>.js`. If a card
  ever needs its own HACS entry, move it to its own repo; nothing here depends on the location.

## Preview without Home Assistant

```bash
python3 scripts/preview.py        # builds preview/theme.css + cardmod.css, serves http://localhost:8765, opens the browser
```

`preview/index.html` is a stand-in dashboard built from the **real** assets: the tokens
and variable map are applied to `<html>` exactly as HA applies a theme, the `card-mod-*`
blocks are injected verbatim, and the genuine `sumi-fonts.js` loads from `/local/…` like
it would in HA. Click any tile to toggle its device (the preview lights the vein on every tile to exercise the five edge variants; real dashboards reserve it for hero cards); the bar at
the top switches dark/light, turns the card-mod layer off (what the theme looks like
without card-mod), and runs the seam audit ("All off"). Edit the YAML and refresh — the
CSS is rebuilt on every request. URL flags for screenshots: `?mode=light`, `&all=on`,
`&cardmod=off`.

`preview/sauna.html` and `preview/hot-tub.html` are the same idea for the two vessel
cards: a fake `hass` whose actions mutate its own state and are logged on the page, so
each card round-trips like it would in HA. The hot tub page mounts both cards side by
side, matching how they sit together in the Wellness view. Useful flags:
`?heat=1` starts a simulated heat-up on either page; on the hot tub page, `?bubbles=1`,
`?manual=1` (nudges the target off-schedule) and `?overdue=1` (ages the filter counter)
exercise the seam, the manual-override note and the service states.

It is an approximation of HA's chrome, not HA: the real frontend has more components and
nested shadow roots, so a pass here is necessary, not sufficient — finish on a live instance.

## Quick start

```bash
git clone https://github.com/trozanek/ha-sumi-house.git
cd ha-sumi-house
scripts/install.sh /path/to/homeassistant/config      # or root@homeassistant.local:/config
```

Then add to `configuration.yaml`, restart once, and pick **Sumi House** in your profile:

```yaml
frontend:
  themes: !include_dir_merge_named themes/
  extra_module_url:
    - /local/sumi-house/sumi-fonts.js
```

Install **card-mod** from HACS for the styling layer (grain, seams, mono numerals). Full
steps, per-device notes and troubleshooting: [docs/INSTALL.md](docs/INSTALL.md).

## Kanji on the view tabs

As in the prototype, each dashboard tab carries a small Mincho kanji before its name
(家 Home, 居 Living room, 寝 Bedroom, 子 Kids' rooms, 庭 Garden…). The theme keys it on
the view's `path:`, so set the paths from the table in
[examples/views-kanji.yaml](examples/views-kanji.yaml). Views with other paths just show
their title.

## Active cards: two tiers

The theme never lights copper on its own; each card says when it is active, with a
card_mod template on its entity. Ordinary tiles get a quiet copper trace on the frame.
The kintsugi vein is reserved for the few hero cards whose activity the dashboard is
about, such as the sauna heating or solar producing.

```yaml
# any small tile
card_mod:
  style: |
    ha-card { --sumi-active: {{ 1 if is_state(config.entity, 'on') else 0 }}; }

# a hero card
card_mod:
  style: |
    ha-card {
      --sumi-seam: var(--sumi-seam-1);   # 1–5: which edge the vein travels
      --sumi-seam-opacity: {{ 1 if state_attr(config.entity, 'hvac_action') == 'heating' else 0 }};
    }
```

Per-domain "active" rules and more cases: [examples/seam-tile-card.yaml](examples/seam-tile-card.yaml).

## Working on the theme

```bash
python3 scripts/lint_theme.py       # must be clean before committing
python3 scripts/contrast.py         # must pass
python3 scripts/gen_tokens_doc.py   # refresh docs/tokens.md after token changes
python3 scripts/fetch_fonts.py      # only when the font set changes (needs network)
```

All scripts are standard-library Python 3; PyYAML is used when present and not required.

Every non-`sumi-*` key in the theme is checked against `scripts/ha_frontend_variables.txt`,
a dump of every CSS custom property in the Home Assistant frontend source. A variable
that is not there does not go in the theme until it has been seen in DevTools on a live
instance (spec §7.6).

## Status

Layers 1–3 are implemented, lint and contrast clean, and aligned to the approved
prototype in `Concepts/sumi-house-mock.html`: its palette, card gradients, plank ground,
type weights, mono labels, and the long kintsugi crack (under the header and, on active
cards, along an edge). Every place the spec and the prototype disagreed, and what the
theme does about it, is in [docs/PROTOTYPE_DISCREPANCIES.md](docs/PROTOTYPE_DISCREPANCIES.md).

Still open: light mode has no prototype precedent and needs a visual review.

Two wellness cards are built on top of the theme: `sumi-sauna-card` and
`sumi-hot-tub-card`, specified in [docs/cards/](docs/cards/) and sharing their gauge,
drag and light-swatch code via `sumi-vessel-shared.js` rather than duplicating it.
Both are verified against a fake `hass` in `preview/` but not yet run on a live
instance — see [docs/INSTALL.md](docs/INSTALL.md#custom-cards-in-this-repository).

Out of scope here, next up: button-card templates and view YAML, re-checking the meal
planner card against the final tokens, the room-by-room views.

## Licences

Zen Old Mincho, Zen Kaku Gothic New and IBM Plex Mono are redistributed under the SIL Open
Font License 1.1; the licence texts are in `www/sumi-house/fonts/`.
