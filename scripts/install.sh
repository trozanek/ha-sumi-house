#!/usr/bin/env bash
# Sync the Sumi House theme and its www/ assets (fonts, loader, custom cards) into a
# Home Assistant config directory. Works for a local path or an rsync/ssh target.
#
#   scripts/install.sh /path/to/homeassistant/config
#   scripts/install.sh root@homeassistant.local:/config
#   HA_CONFIG=/Volumes/config scripts/install.sh
#   scripts/install.sh --dry-run /path/to/config
#
# What it copies                              → where
#   themes/sumi_house.yaml                    → <config>/themes/sumi_house.yaml
#   www/sumi-house/  (fonts, loader, cards)   → <config>/www/sumi-house/   (mirrored; stale files removed)
#
# Nothing else in <config> is touched. Afterwards: Developer Tools → YAML → Reload Themes,
# then hard-refresh the browser. See docs/INSTALL.md.
set -euo pipefail

DRY=""
if [[ "${1:-}" == "--dry-run" || "${1:-}" == "-n" ]]; then
  DRY="--dry-run"
  shift
fi

TARGET="${1:-${HA_CONFIG:-}}"
if [[ -z "$TARGET" ]]; then
  echo "usage: $0 [--dry-run] <ha-config-dir | user@host:/config>   (or set HA_CONFIG)" >&2
  exit 2
fi

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ "$TARGET" != *:* && ! -d "$TARGET" ]]; then
  echo "error: $TARGET is not a directory" >&2
  exit 2
fi

if [[ "$TARGET" != *:* ]]; then
  mkdir -p "$TARGET/themes" "$TARGET/www/sumi-house"
else
  ssh "${TARGET%%:*}" "mkdir -p '${TARGET#*:}/themes' '${TARGET#*:}/www/sumi-house'"
fi

echo "→ theme"
rsync -a $DRY --itemize-changes "$REPO/themes/sumi_house.yaml" "$TARGET/themes/"

echo "→ www/sumi-house (fonts, loader, cards)"
rsync -a $DRY --itemize-changes --delete \
  --exclude 'README.md' --exclude '.DS_Store' \
  "$REPO/www/sumi-house/" "$TARGET/www/sumi-house/"

cat <<MSG

Done${DRY:+ (dry run)}. Next:
  1. configuration.yaml needs (once):
       frontend:
         themes: !include_dir_merge_named themes/
         extra_module_url:
           - /local/sumi-house/sumi-fonts.js
  2. Developer Tools → YAML → Reload Themes
  3. Hard-refresh the browser (fonts and extra_module_url are cached)
  4. Profile → Theme → Sumi House (per browser / per device)
MSG
