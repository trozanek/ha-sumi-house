# Sumi House — project instructions

Working context for the **ha-sumi-house** Home Assistant theme + custom-card repo
(`github.com/trozanek/ha-sumi-house`, branch `main`). Synced 2026-09-18 with this
project's custom instructions in Claude — this file is the repo-side copy, so anyone
(or any agent) opening the repo directly gets the same context without the Claude
Project attached. Supersedes the draft "suggested instructions block" in
`Concepts/concept.md` §6, which predates the actual build and the migration snapshot.

## 1. The house

In the owner's own words: *"My home assistant controls my home, which is a barn-style
home with a black wooden shou sugi ban facade. Interiors are wood, concrete and
copper. It's designed in Japandi style."* — **Sumi House (墨の家)**, Jeziory Małe,
Wielkopolska, Poland. Family: **Tomek, Ania, Olaf, Zoja**.

Rooms: living room, terrace (rear of the house), kitchen (integrated with living
room), dining room (integrated with living room), mezzanine (multimedia section +
work section), attic, pantry, entrance hall, interior hall, master bedroom with its
own bathroom, main bathroom, Olaf's bedroom, Zoja's bedroom, laundry room, garage,
and a guest room with its own bathroom, kitchenette and own entrance. Garden: sauna,
hot tub, pool, sprinklers; the back garden and the front garden each have their own
automatic lawn mower.

Under Home Assistant control: solar production, energy consumption, cameras around
the house, lighting, lawn mowers, vacuum cleaners, washer and dryer, sprinklers,
sauna, hot tub, media servers, garden lighting.

The live instance (see §5) is bigger than this list — 268 devices, ~2,700 registered
entities, 16 HA areas, 134 automations — most of it pre-existing home automation the
theme/cards are being layered onto, not built from scratch.

## 2. Design contract — fixed, do not re-litigate

Full spec: `THEME_SPEC.md`. Token values: `docs/tokens.md` (generated — don't hand-edit).
Where the spec and the approved prototype (`Concepts/sumi-house-mock.html`) disagree,
**the prototype wins**; every resolved case is logged in `docs/PROTOTYPE_DISCREPANCIES.md`
— check it before "fixing" something that looks like a spec violation but is actually
an intentional departure.

Non-negotiable rules:

1. **Ground is charred, never `#000`.** Warm brown-grey cast even at the darkest surface.
2. **Cards are cast concrete**, not glass — matte, grained, lit from the upper left. No
   blur, no drop shadows implying float.
3. **Copper is kintsugi, never decorative.** A seam appears on a card only while its
   subject is actively running, heating, flowing or producing. An idle dashboard has
   zero copper on it except the selected sidebar rule. This is the single most
   important rule in the system, and the one most likely to be broken by a careless
   new card.
4. **Text is washi** — warm off-white, never `#FFF`.
5. **Per-person colour is a fixed system**: **Tomek = copper · Ania = oak · Olaf = moss
   · Zoja = mizu**. Applied to seals, dots, row borders, active highlights. A fifth
   person gets a new token, never a reused one.
6. **Restraint over verbosity.** Cut a header or label before styling it if it can be
   inferred from context.
7. **No stock Material blue/amber/grey anywhere** — every hue comes from the token
   palette (`scripts/ha_frontend_variables.txt` is the whitelist of real HA variables;
   anything not in it needs verification in DevTools on a live instance before it goes
   in the theme).
8. **Typography:** Zen Old Mincho (display) · Zen Kaku Gothic New (UI) · IBM Plex Mono
   (every numeral — tabular figures, so digits don't jitter). Never weight 700+.
9. **Motion is slow and settled**, wrapped in `prefers-reduced-motion` guards. Nothing
   bounces or pulses except a real alert.

One deliberate exception to rule 3, kept from the prototype: a long kintsugi crack
under the header is **always on** (`card-mod-root` `.header::after`). It's the
prototype's signature look and was adopted knowingly — don't "fix" it into a seam that
only lights when something's running.

## 3. Repo layout

```
themes/sumi_house.yaml       Layers 1+2 (tokens, HA variable map) + card-mod blocks (Layer 3)
www/sumi-house/               fonts (self-hosted woff2, offline-safe) + cards/ (dashboard resources)
packages/                     HA packages the cards depend on (helpers, automations, derived sensors)
docs/cards/*.md                per-card spec (entity contract, YAML schema, behaviour)
docs/migration/                pre-migration snapshot of the live instance (see §5)
docs/PROTOTYPE_DISCREPANCIES.md  spec vs. prototype, resolved
docs/tokens.md                 generated token reference
docs/INSTALL.md                fresh HA → themed dashboard, HACS or sync script, troubleshooting
examples/                      full YAML configs (theme wiring, both cards, seam template, view kanji)
scripts/                       lint_theme.py, contrast.py, preview.py (no-HA local preview server), gen_*
Concepts/                      approved HTML prototype + card mockups (source of truth for visual disputes)
```

`scripts/install.sh` syncs `themes/` + `www/sumi-house/` (+ packages) straight into an
HA `/config` dir. `python3 scripts/preview.py` renders the real theme/cards in a
stand-in dashboard with no HA needed — the fast iteration loop.

## 4. Build status

**Theme (Layers 1–3):** implemented, `lint_theme.py` and `contrast.py` clean, matched
side-by-side against the prototype. Open: light mode has no prototype precedent and
still needs a visual review.

**Cards:** `sumi-sauna-card` (v0.1.0) and `sumi-hot-tub-card` (v0.2.0) are built as
Shadow-DOM custom elements sharing gauge/drag/swatch code via `sumi-vessel-shared.js`.
Both are exercised against a fake `hass` in `preview/sauna.html` / `preview/hot-tub.html`
— **not yet run on the live instance.** Full contracts: `docs/cards/sauna.md`,
`docs/cards/hot-tub.md`. Key points worth remembering rather than re-deriving:

- **Sauna** — BleBox saunaBox, single `climate.sauna` entity (temperature only; on/off
  is `heat`/`off`). Seam ignites while state is `heat` (not `hvac_action`, which cycles
  too fast to be a meaningful signal). 270° open arc, `oak` accent, 蒸 kanji. Session
  length via `input_select` + `timer` from `packages/sumi_sauna.yaml`. Cost is modelled
  (no real power metering) from a 9 kW element assumption. Media playlists are folders
  under a mounted SMB share (not `.m3u` — HA's Cast integration only plays the first
  entry of a playlist file) — this whole approach was designed around **not** running
  Music Assistant; see §5, that assumption is now wrong.
- **Hot tub** — Bestway/Lay-Z-Spa MQTT bridge (`layzspa_*` entities). `climate.hot_tub`
  is temperature-only; `switch.hot_tub_heater/pump/bubbles` are authoritative for on/off
  (two sources of truth for one fact is exactly what this avoids). Seam ignites on
  **heating OR bubbles**, never on pump-alone or the light — a hot tub is on almost all
  the time, so "heater on" would leave copper permanently lit, which the kintsugi rule
  forbids. 360° closed ring, `mizu` accent, 湯 kanji. Schedule is four daily setpoints
  (same every day, not per-weekday). Cost is metered by the controller directly.

**Not started:** button-card templates + view YAML (converting the approved prototype
into real Lovelace), room-by-room views for the 16 interior spaces + garden zones,
re-checking the (already-built, separate) meal-planner card against final tokens.

## 5. Migration reality — read before touching the live instance

`docs/migration/` is a point-in-time snapshot (captured 2026-09-18, HA 2026.4.2) of the
actual instance this theme is being migrated onto — not a backup, a structural record to
diff future changes against. Take a real Settings → System → Backups backup separately
before structural changes.

Facts from the snapshot that override assumptions elsewhere in the spec docs:

- **The live "Overview" dashboard already uses the kanji view-naming convention** the
  theme expects, and the 温 Onsen view **already has both vessel cards placed** (a
  `sumi-sauna-card` also appears standalone on 庭 Garden). This is further along than
  a fresh-install narrative assumes.
- **Music Assistant is configured** (38 devices/73 entities) on the live instance. This
  directly contradicts `docs/cards/sauna.md` §7's premise ("you have chosen not to run
  Music Assistant for now") — worth revisiting whether the sauna card should target MA's
  queue instead of the manual folder-browsing/queue-refill logic built for its absence.
- **Sauna entity is `climate.sauna`** (renamed in the entity registry) — matches the
  card's expectation. **Hot tub is the `layzspa` MQTT device**, 67 entities — the
  package header in `packages/sumi_hot_tub.yaml` has the real entity ids bound; the
  spec's `switch.hot_tub_*` names in the doc are illustrative placeholders, not live ids.
- Scale: 268 devices, 2,739 registered entities (1,984 enabled/visible), 134
  automations, 1 script, 6 scenes, across 16 areas + a large "no area" bucket (helpers,
  cloud services, 380 entities). The existing automation set leans heavily on a
  switch↔light "link" pattern (the `aderusha/link_multiple_devices` blueprint) pairing
  physical wall switches with Zigbee bulbs/controllers — a convention to preserve, not
  replace, when touching lighting.
- Four dashboards exist: `Overview` (hand-built, 12 views, in the sidebar), `Mapa` and
  `Obszary` (auto-generated `strategy:` dashboards, in the sidebar), plus an unlisted
  `lovelace.map` not shown in Settings → Dashboards — likely a leftover, not yet
  investigated.
- Full detail: `docs/migration/devices.md` (by area), `docs/migration/entities.csv` (all
  2,739 entities), `docs/migration/automations_scripts_scenes.md`,
  `docs/migration/dashboards.md`.

## 6. Working conventions

- **Prototype is the visual court of last resort.** For anything not yet built, iterate
  in single-file HTML (`Concepts/`) before touching HA infrastructure. For anything
  already built where spec and prototype disagree, the prototype's resolved answer is
  in `docs/PROTOTYPE_DISCREPANCIES.md` — check there first.
- **Ship complete deliverables.** Every feature lands with the YAML, the card JS, and
  doc updates (`INSTALL.md`, the relevant `docs/cards/*.md`) in the same pass — nothing
  is left as "configure X yourself."
- **Shadow DOM** for every custom Lovelace card, consuming `var(--sumi-*)` with sensible
  fallbacks so a card still renders reasonably if the theme isn't active. Never define
  colours locally in a card.
- **Debounce + optimistic hold** for any draggable control writing to a real device:
  paint at 60fps locally, commit once after a stillness delay, ignore inbound state for
  a hold window afterward, then let the device win. Both vessel cards share this via
  `sumi-vessel-shared.js` — don't fork it for a new card; extend the shared module.
- **Verify HA variable names before using them.** `scripts/ha_frontend_variables.txt` is
  the whitelist; a theme variable that doesn't exist in the real frontend is silent dead
  weight, not an error — it just never does anything.
- **`input_text`/helper-based state has a 255-character ceiling** (the meal-planner
  card's architecture — compact identifiers in state, full data fetched from external
  JSON — is the established workaround pattern if a future card needs it).
- Run `scripts/lint_theme.py` and `scripts/contrast.py` before any theme commit;
  `scripts/gen_tokens_doc.py` after any token change.

## 7. Keeping this in sync

This file mirrors two other copies of the same context — update all three together:

- This project's **custom instructions** in Claude (claude.ai project settings) — the
  owner's own short description of the house and what's under HA control.
- The **`claude/instructions.md`** doc in this Claude project's knowledge — the same
  content as this file, read automatically by any chat attached to the project.
- **`CLAUDE.md`** (this file), at the repo root — the same content again, for anyone or
  any agent working directly in the repo without the Claude project attached.
