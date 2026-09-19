# Automations, scripts and scenes — pre-migration snapshot

Generated 2026-09-18 from `automations.yaml`, `scripts.yaml`, `scenes.yaml`.
**134 automations** (0 disabled), **1 script(s)**, **6 scene(s)**.

Trigger/action columns are a compact summary, not the full YAML — device and entity registry ids are
resolved to their friendly names/entity ids where possible. `…` means more triggers/actions were truncated.

## Automations

| Alias | Mode | On | Trigger | Action |
|---|---|:-:|---|---|
| Activate love done on neon off | single | ✓ | device:Bedroom main switch/turned_off | scene.turn_on(scene.love_done) |
| Ai testing | single | ✓ |  | openweathermaphistory.list_vars · weather.get_forecasts · ai_task.generate_data |
| Alert on detection | single | ✓ | device:Entrance Motion Sensor/motion | tts.cloud_say · notify.mobile_app_sm_s921b |
| Brighten bathroom led on switch double | single | ✓ | device:ca5a03b228f8465317cb2e215422995d/remote_button_double_press | device:Bathroom Led controller/brightness_increase |
| Brighten bathroom lights during day | single | ✓ | device:Bathroom Led controller/turned_on | light.turn_on(light.bathroom_led_controller_light) |
| Brighten Olaf's Led controller | single | ✓ | device:Olaf's main light switch/changed_states | device:Olaf's main light switch/turn_off · device:Olaf Led controller/brightness_increase |
| Brighten Zoe's led controller | single | ✓ | device:Zoe's main light switch/turned_on | device:Zoe's main light switch/turn_off · device:Zoe’s Led controller/brightness_increase |
| Decrease led brightness on knob | single | ✓ | device:Knob/device_rotated_slow | device:Bedroom Led controller/brightness_decrease |
| Dim bathroom led after midnight | single | ✓ | device:Bathroom Led controller/turned_on | light.turn_on(light.bathroom_led_controller_light) |
| Dim bathroom led on switch double | single | ✓ | device:ca5a03b228f8465317cb2e215422995d/remote_button_double_press | device:Bathroom Led controller/brightness_decrease |
| Dim Olafs led controller | single | ✓ | device:Olaf's main light switch/turned_on | device:Olaf Led controller/brightness_decrease · device:Olaf's main light switch/turn_off |
| Dim zoe's led controller | single | ✓ | device:Zoe's main light switch/changed_states | device:Zoe's main light switch/turn_off · device:Zoe’s Led controller/brightness_decrease |
| Enable making love on neon on | single | ✓ | device:Bedroom main switch/turned_on | scene.turn_on(scene.making_love) |
| Enable making love scene on handler state on | single | ✓ | state:input_boolean.making_love→['on'] |  |
| Entrance led light link | single | ✓ | blueprint:aderusha/link_multiple_devices.yaml | linked_entities=['light.zha_entrance_lights_light', 'light.zha_s_entrance_lights_light_6'] |
| Fall screen on entertainment switch button | single | ✓ | device:entertainment switch/turned_on | scene.turn_on(scene.fall_projection_screen) |
| Greeting Tomasz | single | ✓ | zone:person.tomasz→zone.home | music_assistant.play_media |
| Identyfikuj Pania Renatke | single | ✓ | device:Main Entrance Doorbell/turned_on | ai_task.generate_data |
| Increase led controller brightness on knob | single | ✓ | device:Knob/device_rotated_slow | device:Bedroom Led controller/brightness_increase |
| Keep extender on | single | ✓ | time_pattern | device:Extender/turn_on |
| Led max brightness on knob | single | ✓ | device:Knob/device_rotated_fast | light.turn_on |
| Led min brightness on knob | single | ✓ | device:Knob/device_rotated_fast | light.turn_on |
| Link atrium switches | single | ✓ | blueprint:aderusha/link_multiple_devices.yaml | linked_entities=['switch.0x5c0272fffe06eaf0_center', 'switch.0xa4c13824536ce4eb_l1'] |
| Link bathroom led and switch | single | ✓ | blueprint:aderusha/link_multiple_devices.yaml | linked_entities=['light.bathroom_led_controller_light', 'switch.0xa4c138d20e6456d4_l2'] |
| Link beam led and switch | single | ✓ | blueprint:aderusha/link_multiple_devices.yaml | linked_entities=['light.beam_led_controller_light_7', 'light.living_room_leds_switch_light_4'] |
| Link bedroom led and switch | single | ✓ | state:light.bedroom_led_controller_light_4,switch.0x5c0272fffe06eaf4_center,switch.0xa4c13824536ce4eb_l2 | homeassistant.turn_{{ trigger.to_state.state }}({{ expand(linked_entities) \| selectattr("entity_id", "!=", trigger.entity_id) \| map(attribute="entity_id") \| list }}) |
| Link cabinet led and switch | single | ✓ | blueprint:aderusha/link_multiple_devices.yaml | linked_entities=['light.cabinet_led_controller_light_3', 'light.cabinet_switch_light_4'] |
| Link Entrance Closet | single | ✓ | state:light.zha_entrance_lights_light_3,light.zha_s_entrance_lights_light_4 | homeassistant.turn_{{ trigger.to_state.state }}({{ expand(linked_entities) \| selectattr("entity_id", "!=", trigger.entity_id) \| map(attribute="entity_id") \| list }}) |
| Link entrance main light | single | ✓ | state:light.zha_entrance_lights_light_2,light.zha_s_entrance_lights_light_5 | homeassistant.turn_{{ trigger.to_state.state }}({{ expand(linked_entities) \| selectattr("entity_id", "!=", trigger.entity_id) \| map(attribute="entity_id") \| list }}) |
| Link hall entrance switches | single | ✓ | state:light.tz3000_cauq1okq_ts0002_light_4,light.hall_main_light_switch_light_4 | homeassistant.turn_{{ trigger.to_state.state }}({{ expand(linked_entities) \| selectattr("entity_id", "!=", trigger.entity_id) \| map(attribute="entity_id") \| list }}) |
| Link hall rooms lights | single | ✓ | state:light.hall_main_light_switch_light_3,light.slave_hall_switch_bedrooms_light,light.tz3000_cauq1okq_ts0002_light_6,light.tz3000_cauq1okq_ts0002_light_3 | homeassistant.turn_{{ trigger.to_state.state }}({{ expand(linked_entities) \| selectattr("entity_id", "!=", trigger.entity_id) \| map(attribute="entity_id") \| list }}) |
| Link iceicles and switch | single | ✓ | blueprint:aderusha/link_multiple_devices.yaml | linked_entities=['light.entrance_outside_light_light_2', 'switch.pool_filter'] |
| Link island switches | single | ✓ | blueprint:aderusha/link_multiple_devices.yaml | linked_entities=['light.island_and_sofa_switch_light_6', 'light.island_switch_light_3'] |
| Link kids bathroom led and switch | single | ✓ | blueprint:aderusha/link_multiple_devices.yaml | linked_entities=['light.kids_bathroom_led_controller_light_9', 'switch.0xa4c13832197c0e10_l2'] |
| Link neon and switch | single | ✓ | state:light.neon_light,light.tz3000_kflqsrse_ts0003_light | homeassistant.turn_{{ trigger.to_state.state }}({{ expand(linked_entities) \| selectattr("entity_id", "!=", trigger.entity_id) \| map(attribute="entity_id") \| list }}) |
| Link Olaf bedlight and switch | single | ✓ | blueprint:aderusha/link_multiple_devices.yaml | linked_entities=['light.bed_lights_2', 'switch.olafs_outside_lights_switch_1'] |
| Link olaf main light and switch | single | ✓ | state:light.olaf_s_main_light_switch_light_2,light.olaf_led_controller_light_5 | homeassistant.turn_{{ trigger.to_state.state }}({{ expand(linked_entities) \| selectattr("entity_id", "!=", trigger.entity_id) \| map(attribute="entity_id") \| list }}) |
| Link outside light switches | single | ✓ | blueprint:aderusha/link_multiple_devices.yaml | linked_entities=['light.tz3000_ptjcjise_ts0002_light_3', 'light.entrance_outside_light_light', 'switch.olafs_outside_lights_switch_2'] |
| Link projector with switch | single | ✓ | blueprint:aderusha/link_multiple_devices.yaml | linked_entities=['light.entertainment_switch_light_5', 'switch.0xa4c13801067fe42c'] |
| Link sofa switches | single | ✓ | blueprint:aderusha/link_multiple_devices.yaml | linked_entities=['switch.living_room_light_switch_2', 'light.island_and_sofa_switch_light_5'] |
| Link stairs switches | single | ✓ | blueprint:aderusha/link_multiple_devices.yaml | linked_entities=['light.tz3000_cauq1okq_ts0002_light', 'light.tz3000_ptjcjise_ts0002_light_5'] |
| Link storage light | single | ✓ | state:light.tz3000_cauq1okq_ts0002_light_5,light.storage_main_light_switch | homeassistant.turn_{{ trigger.to_state.state }}({{ expand(linked_entities) \| selectattr("entity_id", "!=", trigger.entity_id) \| map(attribute="entity_id") \| list }}) |
| Link switch and back icicles | single | ✓ | blueprint:aderusha/link_multiple_devices.yaml | linked_entities=['switch.ledvance_plug_compact_eu_em_t', 'switch.0x5c0272fffe06eaf0_right'] |
| link top led and switch | single | ✓ | blueprint:aderusha/link_multiple_devices.yaml | linked_entities=['light.top_led_controller_light_6', 'light.living_room_leds_switch_light_3'] |
| Link zoe's switch with led controller | single | ✓ | state:light.zoe_s_led_controller_light_2,light.zoe_s_main_light_switch_light_2 | homeassistant.turn_{{ trigger.to_state.state }}({{ expand(linked_entities) \| selectattr("entity_id", "!=", trigger.entity_id) \| map(attribute="entity_id") \| list }}) |
| Link Zoe’s bedlight and switch | single | ✓ | blueprint:aderusha/link_multiple_devices.yaml | linked_entities=['light.tz3000_ptjcjise_ts0002_light_4', 'light.bed_lights'] |
| Low Battery Notifications & Actions | single | ✓ | blueprint:Blackshome/low-battery-notifications-and-actions.yaml | include_easy_notify=enable_easy_notify, notify_device=['c6c70ba1a12c57d3042aa141f41e0847', '039033dfeb960bd02170fd672e6c426f'], include_button=disable_button_trigger |
| Motion turn off entrance light on no motion after 5 mins | single | ✓ | device:Entrance Motion Sensor/no_motion | device:Zha Entrance lights/turn_off |
| Motion Turn on entrance light on motion | single | ✓ | device:Entrance Motion Sensor/motion | device:Zha Entrance lights/turn_on · delay {'hours': 0, 'minutes': 5, 'seconds': 0, 'milliseconds': 0} · device:Zha Entrance lights/turn_off |
| Notify about person in front | single | ✓ | device:Main Entrance Doorbell/turned_on | tts.cloud_say |
| Notify if bamboo sprinklers run longer | single | ✓ | device:Sprinklers/turned_on | tts.speak(tts.google_en_com) · notify.notify |
| Notify if sprinklers border run longer | single | ✓ | device:Sprinklers/turned_on | tts.speak(tts.google_en_com) · notify.notify |
| Notify if sprinklers forest run long | single | ✓ | device:Sprinklers/turned_on | tts.speak(tts.google_en_com) · notify.notify |
| Notify if sprinklers terrace run for a long time | single | ✓ | device:Sprinklers/turned_on | tts.speak(tts.google_en_com) · notify.notify |
| Notify on garage door opening | single | ✓ | device:Garage door sensor/opened | tts.cloud_say · device:Garage light switch/turn_on |
| Notify on sprinklers down | single | ✓ | device:Sprinklers/device_offline | notify.notify |
| Notify when garage door left open | single | ✓ | device:Garage door sensor/opened | repeat(...) |
| Nowa automatyzacja | single | ✓ | time:22:00:00 | device:Garden lamps/turn_off |
| Olaf location | single | ✓ | blueprint:homeassistant/notify_leaving_zone.yaml | person_entity=person.olaf, zone_entity=zone.home, notify_device=iPhone (Tomasz) |
| Olaf Location Ania | single | ✓ | blueprint:homeassistant/notify_leaving_zone.yaml | person_entity=person.olaf, zone_entity=zone.home, notify_device=iPhone (Anna) |
| Olaf's phone battery Low -> Tomasz | single | ✓ | device:SM-A415F/battery_level | device:iPhone (Tomasz)/notify · device:iPhone (Anna)/notify |
| Play relaxation music when body batter drops below 30 | single | ✓ | device:Garmin Connect/value | music_assistant.play_media(media_player.living_room_and_garden_2) |
| Pool Filter schedule | single | ✓ | time:['09:00:00', '12:00:00', '20:00:00'] | device:Pool filter/turn_on · delay {'hours': 1, 'minutes': 0, 'seconds': 0, 'milliseconds': 0} · device:Pool filter/turn_off |
| Powiadom o człowieku przed domem | single | ✓ | device:Main Entrance Doorbell/turned_on | tts.cloud_say · notify.mobile_app_sm_s921b |
| Powiadom o człowieku w wygryzku.  | single | ✓ | device:Atrium/turned_on | tts.cloud_say · notify.mobile_app_sm_s921b |
| Powiadom o zwierzęciu w wygryzku | single | ✓ | device:Atrium/turned_on | tts.cloud_say |
| Przeanizuj widok z kamery | single | ✓ | device:Main Entrance Doorbell/turned_on | ai_task.generate_data · notify.mobile_app_sm_s921b · tts.cloud_say |
| Reboot HA host | single | ✓ | blueprint:Chef-de-IT/Reboot-HA-weekly.yaml | reboot_time=03:00:00, reboot_day=thu |
| Reset alerts on alarm disarm | single | ✓ | state:input_boolean.alarm_armed→off | device:Main Entrance Doorbell/turn_off |
| Rise screen on entertainment switch | single | ✓ | device:entertainment switch/turned_off | scene.turn_on(scene.raise_screen) |
| Set cinema off | single | ✓ | device:Projector chromecast/turned_off | input_boolean.turn_off(input_boolean.cinema) |
| Toggle bathroom led | single | ✓ | device:Bathroom secondary switch/action | device:Bathroom Led controller/toggle |
| Toggle bathtub light | single | ✓ | device:Bathroom secondary switch/action | device:Bathroom main switch/toggle |
| Toggle bedroom neon on knob double | single | ✓ | device:Knob/remote_button_long_press | device:6d0708c1d7c834b1aefa7172fbf420d5/toggle |
| Toggle led controller | single | ✓ | device:Knob/remote_button_short_press | device:Bedroom Led controller/toggle |
| Toggle mezzanine lights on stairs run double click | single | ✓ | device:Stairs run switch/remote_button_double_press | device:Mezzanine Main light switch/toggle |
| Toggle table light on secondary stairs switch | single | ✓ | device:Stairs run switch/remote_button_short_press | device:living room light/toggle |
| Toggle table light on stairs run second click | single | ✓ | device:Stairs run switch/remote_button_short_press | device:living room light/toggle |
| Turn all lights off on all lights entity | single | ✓ | state:input_boolean.all_lights→off | light.turn_off · switch.turn_off |
| Turn garden lamps on sunset | single | ✓ | sun:sunset | device:Garden lamps/turn_on |
| Turn of closet light on left door closing | single | ✓ | device:Closet left door/not_opened | device:Zha (S) Entrance lights/turn_off |
| Turn of closet light on left door closing | single | ✓ | device:Closet left door/not_opened | device:Zha (S) Entrance lights/turn_off |
| Turn of closet light on right door closing | single | ✓ | device:Closet right door/not_opened | device:Zha (S) Entrance lights/turn_off |
| Turn of garage outside light after 5 minutes after closing | single | ✓ | device:Garage door sensor/not_opened | device:Garage light switch/turn_off |
| Turn off bathroom light after 30 mins | single | ✓ | device:Bathroom presence detector/not_occupied | device:Bathroom Led controller/turn_off · device:Bathroom main switch/turn_off · device:Bathroom Sink switch/turn_off |
| Turn off bed lights on switch | single | ✓ | device:Zoe’s outside light switch/turned_off | device:Bed lights/turn_off |
| Turn off bedroom light after 30 mins | single | ✓ | device:Bedroom Led controller/turned_on | device:Bedroom Led controller/turn_off · device:Bedroom main switch/turn_off |
| Turn off campfire light at time | single | ✓ | time:02:10:00 | device:Lampa ognisko/turn_off |
| Turn off Christmas tree | single | ✓ | time:01:00:00 | device:christmas tree/turn_off |
| Turn off closet light after 10 min | single | ✓ | device:Closet left door/opened | device:Zha (S) Entrance lights/turn_off |
| Turn off closet light after 10 mins | single | ✓ | device:Closet right door/opened | device:Zha (S) Entrance lights/turn_off |
| Turn off garage light on no motion | single | ✓ | device:Garage motion sensor/no_motion | device:Garage light switch/turn_off |
| Turn off garage light when no motion | single | ✓ | device:Pantry motion sensor/no_motion | device:Garage light switch/turn_off |
| Turn off garden lights at midnight | single | ✓ | time:00:00:00 | device:Atrium switch ZMQT/turn_off · device:Atrium switch ZMQT/turn_off · device:Atrium switch ZMQT/turn_off |
| Turn off hall led at sunrise | single | ✓ | time:23:00:00 | device:Hall led controller/turn_off |
| Turn off hall led controller on no motio  | single | ✓ | device:Hall motion sensor/no_motion | device:Hall led controller/turn_off |
| Turn off iceicles at 11pm | single | ✓ | time:23:00:00 | device:Pool filter/turn_off · device:Plug jacuzzi/turn_off |
| Turn off kids bathroom light after 30 mins | single | ✓ | device:Kids bathroom Led controller/turned_on | device:Kids bathroom Led controller/turn_off · device:Kids Bathroom switch ZMQT/turn_off |
| Turn off led controllers on HA start | single | ✓ | ha:start | light.turn_off |
| Turn off lights at midnight when alarm armed | single | ✓ | time:23:00:00 | light.turn_off |
| Turn off living room lights on no presence | single | ✓ | device:Living room presence detector/not_occupied | device:Top led controller/turn_off · device:living room light/turn_off · device:Gable wall lights switch/turn_off |
| Turn off loghts on sleep | single | ✓ | state:sensor.sm_s921b_do_not_disturb_sensor→priority_only | light.turn_off · device:Hall led controller/brightness_decrease · switch.turn_off |
| Turn off outside lights at 1 am | single | ✓ | time:01:00:00 | device:60029f58e4e917a6472c0dba4230c7bb/turn_off · device:Entrance Outside light/turn_off |
| Turn off pantry light after w minutes | single | ✓ | device:Pantry light/turned_on | delay {'hours': 0, 'minutes': 2, 'seconds': 0, 'milliseconds': 0} · device:Pantry light/turn_off |
| Turn off projector when projector chromecast is off | single | ✓ | device:Projector chromecast/turned_off | device:entertainment switch/turn_off · device:Projector socket/turn_off · input_boolean.turn_off(input_boolean.cinema) |
| Turn off socket on drawer close | single | ✓ | device:Drawer sensor/not_opened | device:Drawer switch/turn_off |
| Turn off storage on no motion | single | ✓ | device:Storage Motion detector/no_motion | device:Storage Main light switch/turn_off |
| Turn on all the lights on all lights entity | single | ✓ | state:input_boolean.all_lights→on | light.turn_on · switch.turn_on |
| Turn on bed lights on switch | single | ✓ | device:Zoe’s outside light switch/turned_on | device:Bed lights/turn_on |
| Turn on campfire light at sunset | single | ✓ | sun:sunset | device:Lampa ognisko/turn_on |
| Turn on Christmas tree | single | ✓ | sun:sunset | device:christmas tree/turn_on |
| Turn on closet light in left door opening | single | ✓ | device:Closet left door/opened | device:Zha Entrance lights/turn_on |
| Turn on closet light on right door opening | single | ✓ | device:Closet right door/opened | device:Zha Entrance lights/turn_on |
| Turn on drier when sun is on | single | ✓ | numeric_state:sensor.bt2180260306_realtime_power | device:Suszarka/turn_on |
| Turn on entrance light on person detected | single | ✓ | device:Main Entrance Doorbell/turned_on | device:Entrance Outside light/turn_on · delay {'hours': 0, 'minutes': 5, 'seconds': 0, 'milliseconds': 0} · device:Entrance Outside light/turn_off |
| Turn on garage on motion | single | ✓ | device:Garage motion sensor/motion | device:Garage light switch/turn_on |
| Turn on garden lamps when family enters | single | ✓ | device:SM-S921B/enters · device:iPhone (Anna)/enters · device:Galaxy Watch6 Classic (K11D)/enters | device:Garden lamps/turn_on · delay {'hours': 0, 'minutes': 5, 'seconds': 0, 'milliseconds': 0} · device:Garden lamps/turn_off |
| Turn on hall leds on motion | single | ✓ | device:Hall motion sensor/motion | device:Hall led controller/turn_on |
| Turn on iceicles on sunset | single | ✓ | sun:sunset | device:Pool filter/turn_on · device:Plug jacuzzi/turn_on |
| Turn on lamps if person detected | single | ✓ | device:Atrium/turned_on | device:Garden lamps/turn_on · delay {'hours': 0, 'minutes': 5, 'seconds': 0, 'milliseconds': 0} · device:Garden lamps/turn_off |
| Turn on lights after sunset when alarm armed | single | ✓ | sun:sunset | light.turn_on |
| Turn on music on wakeup | single | ✓ | state:sensor.sm_s921b_do_not_disturb_sensor · device:SM-S921B/enters | media_player.volume_set · music_assistant.play_media |
| Turn on outside lights on sunset | single | ✓ | sun:sunset | device:60029f58e4e917a6472c0dba4230c7bb/turn_on · device:Entrance Outside light/turn_on |
| Turn on pantry light on motion | single | ✓ | device:Pantry motion sensor/no_motion | device:Pantry light/turn_off |
| Turn on porch on person detected | single | ✓ | device:Atrium/turned_on | device:Atrium switch ZMQT/turn_on · delay {'hours': 0, 'minutes': 5, 'seconds': 0, 'milliseconds': 0} · device:Atrium switch ZMQT/turn_off |
| Turn on projector and screen when chromecast o  | single | ✓ | device:Projector chromecast/turned_on | input_boolean.turn_on(input_boolean.cinema) · device:entertainment switch/turn_on · device:Projector socket/turn_on · delay {'hours': 0, 'minutes': 0, 'seconds': 30, 'milliseconds': 0} … |
| Turn on projector on command | single | ✓ | conversation | device:entertainment switch/turn_on |
| Turn on socket on drawer open | single | ✓ | device:Drawer sensor/opened | device:Drawer switch/turn_on |
| Turn on soundtrack when in hall | single | ✓ | state:input_number.location→2 | media_player.play_media(media_player.hall_2) |
| Turn on soundtrack when in living room | single | ✓ | state:input_select.scenario | if(...) |
| Turn on stairs light on scene switch | single | ✓ | device:Stairs run switch/remote_button_short_press | device:Main light switch stairs/toggle |
| Turn on storage light on motion | single | ✓ | device:Storage Motion detector/motion | device:Storage Main light switch/turn_on |
| Water border plants | single | ✓ | time:['08:00:00'] | weather.get_forecasts · ai_task.generate_data · if(...) |
| Water lawn | restart | ✓ | time:['05:00:00'] | weather.get_forecasts · ai_task.generate_data · if(...) |

## Scripts

| Key | Alias | Blueprint |
|---|---|---|
| notify_about_main_filter_change | Notify about main filter change | homeassistant/confirmable_notification.yaml |

## Scenes

| Name | Entities |
|---|---:|
| Movie night ended | 5 |
| Living room and kitchen  off | 7 |
| Rainbow porch | 5 |
| Warm porch | 5 |
| Making love | 16 |
| Love done | 11 |
