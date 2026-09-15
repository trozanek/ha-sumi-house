# Installing Sumi House

This takes a Home Assistant install from stock to a working Sumi House dashboard with no
undocumented steps. Read the **Prerequisites** first — one of them (card-mod) is a hard
dependency for the styling layer.

> **No HA at hand?** `python3 scripts/preview.py` renders the theme, fonts and card-mod layer in a local stand-in dashboard. Use it to judge colours, type and seams before touching a live instance; the steps below are still needed for the real thing.

## Prerequisites

| Need | Why | Where |
|---|---|---|
| Home Assistant 2025.6 or newer | The theme binds the `--ha-font-*`, `--ha-color-*` and `--ha-switch-*` tokens introduced across 2025 | — |
| **card-mod** (HACS → Frontend) | Layer 3: grain, kintsugi seams, mono numerals, sidebar rule. Without it Layers 1+2 still render correctly — you just get flat concrete with no seams | <https://github.com/thomasloven/lovelace-card-mod> |
| Write access to your `/config` directory | The theme lives in `themes/`, the fonts and cards in `www/sumi-house/` | Samba add-on, SSH add-on, VS Code add-on, or a mounted share |

Install card-mod **as a frontend module**, not only as a dashboard resource. Its README
explains why; in short, theme-level `card-mod-sidebar` only works when card-mod is loaded
via `extra_module_url`. Recent card-mod versions do this automatically when installed
through HACS; check `Settings → Dashboards → Resources` shows it and follow its README if
the sidebar rule does not appear.

## Option A — this repository as a whole (recommended)

The repo mirrors the `/config` layout, so one sync puts everything in place. It is the
only option that also installs the custom cards under `www/sumi-house/cards/`.

```bash
git clone https://github.com/trozanek/ha-sumi-house.git
cd ha-sumi-house

# local mount
scripts/install.sh /Volumes/config
# or over SSH (SSH & Web Terminal add-on)
scripts/install.sh root@homeassistant.local:/config
# preview first
scripts/install.sh --dry-run /Volumes/config
```

The script copies `themes/sumi_house.yaml` and mirrors `www/sumi-house/`; nothing else
in `/config` is touched. Re-run it after every `git pull`.

## Option B — HACS (theme only)

HACS installs one repository as exactly one type, and this repository qualifies as a
**Theme** (it has `themes/sumi_house.yaml` and `hacs.json`). It will *not* copy the
fonts or cards, so you still do the `www/` half by hand.

1. HACS → ⋮ → Custom repositories → URL `https://github.com/trozanek/ha-sumi-house`, type **Theme** → Add
2. HACS → Themes → Sumi House → Download
3. Copy `www/sumi-house/` from the repo into `/config/www/sumi-house/` (Samba, SSH, or `scripts/install.sh`).

## configuration.yaml

Add, or merge into an existing `frontend:` block:

```yaml
frontend:
  themes: !include_dir_merge_named themes/
  extra_module_url:
    - /local/sumi-house/sumi-fonts.js
```

`/local/` is how Home Assistant serves `/config/www/`. `themes: !include_dir_merge_named`
merges every file in `/config/themes/`, so other themes keep working.

A full example is in [`examples/configuration.yaml`](../examples/configuration.yaml).

## Load it

1. **Check configuration** (Developer Tools → YAML → Check configuration) — a YAML error in
   any theme file stops all themes from loading.
2. If `frontend:` or `extra_module_url` is new: **restart Home Assistant**. Theme *changes*
   later only need Developer Tools → YAML → **Reload Themes**.
3. **Hard-refresh** the browser (⌘⇧R / Ctrl+F5). Fonts and `extra_module_url` are cached
   aggressively; the Companion app needs Settings → Companion app → Debugging → Reset
   frontend cache, or a force-close.
4. **Select the theme**: Profile (bottom of the sidebar) → Theme → **Sumi House**.
   Leave *Dark mode* on "Auto" to follow the device; the theme has full light and dark modes.

> Theme selection is **per browser profile / per device**, not per account. If a second
> device still shows the default theme, it is not broken — select Sumi House there too.
> To force it for everyone, call `frontend.set_theme` with `name: Sumi House` from an
> automation on Home Assistant start.

## Verify

- Theme picker lists **Sumi House**; background is warm char, not black; text is off-white.
- Turn on one light on a tile with the `--sumi-active` template → its frame takes a quiet copper
  trace. Start the sauna on a card with the `--sumi-seam-opacity` template → the vein warms in.
  Templates: [`examples/seam-tile-card.yaml`](../examples/seam-tile-card.yaml).
- Cards show faint grain at a glance (zoom in on a screenshot if unsure); numerals in
  entity/statistic/gauge cards render in IBM Plex Mono.
- Settings, History, Energy, Logbook, dialogs and the code editor show no Material blue or amber.
- Disable the network → fonts still render, including Polish diacritics (ą ć ę ł ń ó ś ź ż)
  and the 墨の家 mark.

## Custom cards in this repository

Cards live in `www/sumi-house/cards/`. Register each one as a dashboard resource
(Settings → Dashboards → ⋮ → Resources, or `resources:` in YAML mode):

```yaml
resources:
  - url: /local/sumi-house/cards/sumi-meal-planner.js?v=1
    type: module
```

Bump `?v=` whenever a card changes so browsers fetch the new file. See
[`examples/resources.yaml`](../examples/resources.yaml) and `www/sumi-house/cards/README.md`.

## Troubleshooting

| Symptom | Cause → fix |
|---|---|
| Sumi House missing from the theme picker | A theme YAML failed to parse. Settings → System → Logs, search `frontend`. Run `python3 scripts/lint_theme.py` locally. |
| Theme applies but fonts are stock | `extra_module_url` not loaded: confirm the `frontend:` block, restart HA, hard-refresh. Open `http://<ha>:8123/local/sumi-house/sumi-fonts.js` directly — a 404 means `www/` was not copied. |
| Fonts load on desktop, not in the Companion app | Reset frontend cache in the app's debugging settings. |
| No grain, no seams, sidebar shows a filled pill | card-mod is missing or not loaded as a frontend module. Layers 1+2 are working; install card-mod. |
| A seam never appears | Seams are opt-in per card (§5.3). The card needs the `card_mod` template from the example with `--sumi-seam-opacity`, and the entity must be *active*, not merely configured. Ordinary tiles use `--sumi-active` and only get the frame trace. |
| Seam appears on a card that is idle | The card's template condition is too loose. Copper only while running/heating/flowing/producing. |
| Something is still Material blue / amber | Inspect it in DevTools, find the CSS variable it reads, confirm the name exists in `scripts/ha_frontend_variables.txt`, add it to the map bound to a token, reload themes. Do not guess names. |
| Text size setting in Profile has no effect | It should — the scale multiplies `--ha-font-size-scale`. Hard-refresh. |
| Second device shows the stock theme | Theme selection is per browser profile. Select it there, or use `frontend.set_theme`. |
| After editing the theme nothing changes | Reload Themes, then hard-refresh. Card-mod caches theme styles until the page reloads. |

## Updating

```bash
git pull
scripts/install.sh <target>
# then: Developer Tools → YAML → Reload Themes, hard-refresh
```

If the fonts were changed (`scripts/fetch_fonts.py`), also bump the version query on the
module URL, e.g. `/local/sumi-house/sumi-fonts.js?v=2`, so browsers drop the cached copy.
