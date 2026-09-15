# Sumi House custom cards

Drop the house's Lovelace cards here, one `*.js` module per card, e.g.
`sumi-meal-planner.js`. `scripts/install.sh` mirrors this folder to
`/config/www/sumi-house/cards/`, which Home Assistant serves at
`/local/sumi-house/cards/`.

Register each card once as a dashboard resource:

```yaml
# Settings → Dashboards → ⋮ → Resources, or resources: in YAML mode
- url: /local/sumi-house/cards/sumi-meal-planner.js?v=1
  type: module
```

Bump `?v=` when a card changes so browsers fetch the new file.

## Rules for cards in this folder (spec §7.3, §5.6)

- Consume theme tokens with fallbacks so the card renders correctly even when the theme
  is not active: `color: var(--sumi-ink, var(--primary-text-color))`.
- Never hard-code a hex value that exists as a token. Person colours come only from
  `--sumi-person-tomek / -ania / -olaf / -zoja`.
- Numerals in `var(--sumi-font-mono)` with `font-variant-numeric: tabular-nums`; units in
  `var(--sumi-font-size-2xs)`, uppercase, `letter-spacing: var(--sumi-tracking-label)`.
- Copper (`--sumi-copper`) only while something is running. Idle → no copper. Ordinary
  activity is a quiet frame trace (`--sumi-active`); the kintsugi vein (`--sumi-seam-opacity`)
  is for hero cards only. Transition `var(--sumi-dur-slow) var(--sumi-ease)`, with a
  `prefers-reduced-motion` guard.
- No emoji, no filled icon variants, no bounce.

Keep sources here too (or in a `src/` sibling if a build step is involved); what ships is
the single `.js` file the resource points at.
