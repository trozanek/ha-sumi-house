# Pre-migration state — Home Assistant instance snapshot

**Captured:** 2026-09-18 · **Home Assistant:** 2026.4.2 · **Purpose:** a point-in-time record of the
instance before the Sumi House theme/card migration goes further, so anything that changes can be diffed
back against what was actually running.

This is a snapshot, not a backup. It records structure (devices, entities, automations, dashboard layout) —
not entity state, not secrets, not the HA backup archive itself. Take a real Settings → System → Backups
backup separately before making structural changes.

## Contents

- [devices.md](devices.md) — every device, grouped by area, with entity counts
- [entities.csv](entities.csv) — all 2,739 registered entities (id, name, area, device, platform, domain, disabled/hidden)
- [automations_scripts_scenes.md](automations_scripts_scenes.md) — all 134 automations, 1 script, 6 scenes
- [dashboards.md](dashboards.md) — all 4 dashboards and the 12 views on the main one, by card type

## Instance overview

- Devices: **268**
- Entities in registry: **2,739** total — **1,984** enabled & visible, **745** disabled, **10** hidden
- Entities attached to a device: **2,359** · with no device (helpers, templates, integration-level): **380**
- Areas in use: **16**
- Automations: **134**
- Scripts: **1** · Scenes: **6**
- Dashboards: **4** (1 hand-built "Overview" + 3 auto-generated strategy dashboards)

## Entities by domain

Enabled entities only (hidden-but-enabled included), 1,994 total across 35 domains.

| Domain | Count | | Domain | Count |
|---|---:|---|---|---:|
| sensor | 906 | | image | 5 |
| automation | 139 | | person | 4 |
| select | 132 | | timer | 4 |
| binary_sensor | 109 | | tts | 3 |
| update | 106 | | event | 3 |
| switch | 102 | | climate | 3 |
| button | 102 | | camera | 2 |
| number | 94 | | stt | 2 |
| media_player | 90 | | vacuum | 2 |
| light | 79 | | time | 2 |
| input_boolean | 17 | | input_select | 2 |
| remote | 16 | | weather | 2 |
| device_tracker | 13 | | lawn_mower | 2 |
| scene | 12 | | siren | 1 |
| todo | 11 | | script | 1 |
| calendar | 11 | | ai_task | 1 |
| input_number | 8 | | conversation | 1 |
| input_datetime | 7 | | fan | 1 |

## Integrations configured

androidtv_remote ×2 · backup · blebox · bluetooth · brother · cast · cloud · dlna_dmr · ecovacs · forecast_solar · fusion_solar · garmin_connect · go2rtc · google_generative_ai_conversation · google_translate · group ×2 · hacs · hassio · homekit_controller · ibeacon · ifttt · jellyfin · landroid_cloud · mobile_app ×11 · mqtt · music_assistant · myuplink · nzbget · openweathermap · openweathermaphistory · playstation_network · polleninformation · radarr · radio_browser · raspberry_pi · reolink ×2 · rpi_power · shopping_list · smartthings · smlight ×2 · sonarr · sonoff · spotify · starlink · sun · switchbot ×2 · todoist · tuya ×2 · vlc_telnet · webrtc · yeelight · zha ×3

## Notable, relevant to the Sumi House migration

- The live "Overview" dashboard already uses the kanji-prefixed view naming this repo's theme expects (家 Home, 温 Onsen, 庭 Garden, 媒体 Media, 居間 Living Room, 庖 Kitchen, 寝 Bedroom, 息子 Olaf, 娘 Zoja, 階 Mezzanine, 屋 Washroom, 図 Plan) — see [dashboards.md](dashboards.md).
- `sumi-sauna-card` and `sumi-hot-tub-card` are already placed on the 温 Onsen view (and a `sumi-sauna-card` also appears on 庭 Garden).
- `music_assistant` is configured — relevant to `docs/cards/sauna.md` §7, which currently assumes it isn't running.
- The hot tub is the `layzspa_*` MQTT device family (Bestway/Lay-Z-Spa bridge); see the header of `packages/sumi_hot_tub.yaml` for the exact entity ids already bound.
- The sauna is the BleBox saunaBox, entity renamed to `climate.sauna` in the entity registry.
