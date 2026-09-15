#!/usr/bin/env python3
"""Lint themes/sumi_house.yaml against the rules of THEME_SPEC.md.

Checks
  1. the file parses and contains exactly one theme, "Sumi House"
  2. card-mod-theme equals the theme name (card-mod refuses to apply otherwise)
  3. modes.dark and modes.light exist, contain only sumi-* tokens, and define the same keys
  4. every non-sumi, non-card-mod key is a variable that exists in home-assistant/frontend
     (scripts/ha_frontend_variables.txt) or is listed in LEGACY_ALLOWED below — §7.6
  5. no raw colour (hex / rgb / rgba / hsl) outside sumi-* keys — §3
  6. every var(--x) reference resolves to a theme key, a frontend variable, or a
     documented per-card runtime property
  7. sumi-*-rgb triplets match their hex tokens
  8. every variable the spec requires (§4.2) is present
  9. the font loader and font files exist

Exit 0 = clean, 1 = errors. Warnings never fail the run. Standard library only.

    python3 scripts/lint_theme.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _themeyaml import ROOT, THEME_NAME, hex_to_rgb, load_theme  # noqa: E402

WHITELIST_FILE = Path(__file__).resolve().parent / "ha_frontend_variables.txt"

# Names that no longer appear in the current frontend but are kept on purpose.
LEGACY_ALLOWED: dict[str, str] = {
    "switch-checked-color": "pre-2025.12 ha-switch and community cards",
    "switch-checked-button-color": "pre-2025.12 ha-switch and community cards",
    "switch-checked-track-color": "pre-2025.12 ha-switch and community cards",
    "switch-unchecked-button-color": "pre-2025.12 ha-switch and community cards",
    "switch-unchecked-track-color": "pre-2025.12 ha-switch and community cards",
}

# Per-card runtime properties that cards set on themselves (see examples/); they are
# referenced with a fallback inside card-mod-card and are not theme keys.
RUNTIME_PROPS = {"sumi-seam", "sumi-seam-opacity", "sumi-active"}

# State-colour names are resolved dynamically ({domain}-{state}); any well-formed one is valid.
STATE_RE = re.compile(r"^state-[a-z_]+-[a-z_]+-color$")
# graph-color-N is read by name from a template string (common/color/colors.ts), so only
# graph-color-1 appears literally in the source.
GRAPH_RE = re.compile(r"^graph-color-[1-9][0-9]?$")
CSS_COMMENT_RE = re.compile(r"/\*.*?\*/", re.S)

# §4.2 — every variable the spec requires. (state-icon-active-color and the
# ha-font-size-2xs step are omitted: neither exists in the frontend.)
REQUIRED = """
primary-text-color secondary-text-color text-primary-color disabled-text-color
primary-color dark-primary-color light-primary-color accent-color divider-color outline-color outline-hover-color
primary-background-color secondary-background-color card-background-color clear-background-color ha-card-background
ha-card-border-radius ha-card-border-width ha-card-border-color ha-card-box-shadow
ha-card-header-color ha-card-header-font-size ha-card-header-font-family
sidebar-background-color sidebar-text-color sidebar-icon-color sidebar-selected-text-color sidebar-selected-icon-color
app-header-background-color app-header-text-color
state-icon-color state-icon-unavailable-color state-icon-error-color state-active-color state-inactive-color state-unavailable-color
state-light-active-color state-switch-active-color state-binary_sensor-active-color state-climate-heat-color
state-climate-cool-color state-climate-auto-color state-water_heater-active-color state-media_player-active-color
state-media_player-inactive-color state-vacuum-active-color state-lawn_mower-active-color state-valve-active-color
state-cover-active-color state-lock-locked-color state-lock-unlocked-color state-alarm_control_panel-armed_away-color
state-alarm_control_panel-triggered-color state-sensor-battery-low-color state-person-home-color
state-person-not_home-color state-update-active-color
energy-solar-color energy-grid-consumption-color energy-grid-return-color energy-battery-in-color
energy-battery-out-color energy-non-fossil-color energy-gas-color energy-water-color
error-color warning-color success-color info-color
switch-checked-color switch-checked-button-color switch-checked-track-color switch-unchecked-button-color
switch-unchecked-track-color slider-color slider-secondary-color slider-track-color
input-idle-line-color input-hover-line-color input-disabled-line-color input-outlined-idle-border-color
input-outlined-hover-border-color input-outlined-disabled-border-color input-fill-color input-disabled-fill-color
input-ink-color input-label-ink-color input-disabled-ink-color input-dropdown-icon-color
mdc-theme-primary mdc-theme-secondary mdc-theme-surface mdc-theme-background mdc-theme-on-primary
mdc-theme-on-surface mdc-theme-error mdc-dialog-heading-ink-color mdc-dialog-content-ink-color mdc-dialog-scroll-divider-color
data-table-background-color table-header-background-color table-row-background-color table-row-alternative-background-color
ha-font-family-body ha-font-family-heading ha-font-family-code ha-font-family-longform
ha-font-size-xs ha-font-size-s ha-font-size-m ha-font-size-l ha-font-size-xl ha-font-size-2xl ha-font-size-3xl ha-font-size-4xl
ha-font-weight-light ha-font-weight-normal ha-font-weight-medium ha-font-weight-bold ha-font-weight-heading ha-font-weight-action
ha-line-height-condensed ha-line-height-normal ha-line-height-expanded ha-font-smoothing
graph-color-1 graph-color-2 graph-color-3 graph-color-4 graph-color-5 graph-color-6 graph-color-7 graph-color-8 graph-color-9 graph-color-10
red-color pink-color purple-color deep-purple-color indigo-color blue-color light-blue-color cyan-color teal-color green-color
light-green-color lime-color yellow-color amber-color orange-color deep-orange-color brown-color grey-color dark-grey-color
blue-grey-color black-color white-color
rgb-primary-color rgb-accent-color rgb-card-background-color rgb-primary-text-color rgb-secondary-text-color rgb-text-primary-color
card-mod-theme card-mod-card card-mod-view card-mod-root card-mod-sidebar
""".split()

RAW_COLOUR_RE = re.compile(r"(#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\()")
VAR_RE = re.compile(r"var\(\s*--([a-zA-Z0-9_-]+)")


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []

    name, theme = load_theme()
    if name != THEME_NAME:
        errors.append(f"theme is named {name!r}, expected {THEME_NAME!r}")
    if theme.get("card-mod-theme") != name:
        errors.append("card-mod-theme must equal the theme name")

    whitelist = {
        line.strip()
        for line in WHITELIST_FILE.read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.startswith("#")
    }

    modes = theme.get("modes")
    if not isinstance(modes, dict) or set(modes) != {"dark", "light"}:
        errors.append("modes: must define exactly dark and light")
        modes = {"dark": {}, "light": {}}
    dark, light = modes["dark"], modes["light"]
    if set(dark) != set(light):
        errors.append(f"modes define different token sets: {sorted(set(dark) ^ set(light))}")
    for mode, table in modes.items():
        for key in table:
            if not key.startswith("sumi-"):
                errors.append(f"modes.{mode}.{key}: only sumi-* tokens may live inside modes (HA map is written once, outside)")

    top = {k: v for k, v in theme.items() if k != "modes"}
    defined = set(top) | set(dark) | set(light)

    for key, value in top.items():
        if key.startswith("sumi-") or key.startswith("card-mod-"):
            continue
        if key in whitelist or key in LEGACY_ALLOWED or STATE_RE.match(key) or GRAPH_RE.match(key):
            continue
        errors.append(f"{key}: not a known frontend variable (see {WHITELIST_FILE.name}); verify in DevTools or remove — §7.6")

    for key, value in top.items():
        if key.startswith("sumi-"):
            continue
        if isinstance(value, str) and RAW_COLOUR_RE.search(value):
            errors.append(f"{key}: raw colour outside the token layer — bind a sumi-* token instead")

    def scan_refs(key: str, value) -> None:
        if not isinstance(value, str):
            return
        for ref in VAR_RE.findall(CSS_COMMENT_RE.sub("", value)):
            if ref in defined or ref in whitelist or ref in RUNTIME_PROPS or STATE_RE.match(ref):
                continue
            errors.append(f"{key}: references var(--{ref}) which nothing defines")

    for key, value in top.items():
        scan_refs(key, value)
    for mode, table in modes.items():
        for key, value in table.items():
            scan_refs(f"modes.{mode}.{key}", value)

    for mode, table in modes.items():
        for key, value in table.items():
            if key.endswith("-rgb"):
                base = table.get(key[: -len("-rgb")])
                rgb = hex_to_rgb(str(base)) if base else None
                if rgb is None:
                    warnings.append(f"modes.{mode}.{key}: base token is not a plain hex, cannot verify")
                elif ", ".join(str(c) for c in rgb) != str(value).strip():
                    errors.append(f"modes.{mode}.{key} = {value!r} but {key[:-4]} = {base} → expected {', '.join(map(str, rgb))}")

    for req in REQUIRED:
        if req not in top:
            errors.append(f"required by spec §4.2 but missing: {req}")

    for tok in ("sumi-seam-1", "sumi-seam-2", "sumi-seam-3", "sumi-seam-4", "sumi-seam-5", "sumi-grain"):
        if tok not in top:
            errors.append(f"missing Layer 3 texture token {tok}")

    fonts_js = ROOT / "www" / "sumi-house" / "sumi-fonts.js"
    fonts_dir = ROOT / "www" / "sumi-house" / "fonts"
    if not fonts_js.exists():
        errors.append("www/sumi-house/sumi-fonts.js missing — run scripts/fetch_fonts.py")
    woff = list(fonts_dir.glob("*.woff2")) if fonts_dir.exists() else []
    if len(woff) < 3:
        errors.append("www/sumi-house/fonts/ has no woff2 files — run scripts/fetch_fonts.py")

    for w in warnings:
        print("warning:", w)
    for e in errors:
        print("error:", e)
    print(f"\n{len(top)} theme keys · {len(dark)} tokens per mode · {len(errors)} error(s) · {len(warnings)} warning(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
