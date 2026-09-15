#!/usr/bin/env python3
"""WCAG 2.1 contrast check over the Sumi House token table (§3.6).

Reads themes/sumi_house.yaml and, for each mode, measures every text-capable token
against `sumi-surface` (the card surface). Fails (exit 1) when a body-text token
drops below 4.5:1 or a large-text/non-text token below 3:1.

    python3 scripts/contrast.py              # table + verdicts
    python3 scripts/contrast.py --markdown   # the same as a Markdown table (used by gen_tokens_doc.py)

Standard library only.
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _themeyaml import hex_to_rgb, load_theme  # noqa: E402

# token → (minimum ratio, note). 4.5 = body text, 3.0 = large text / UI graphics,
# 0 = informational only (never used as text; reported but not enforced).
CHECKS: dict[str, tuple[float, str]] = {
    "sumi-ink": (4.5, "primary text"),
    "sumi-ink-soft": (4.5, "secondary text"),
    "sumi-ink-faint": (3.0, "tertiary — large text / non-text only"),
    "sumi-copper": (3.0, "active state, icons, Tomek — text uses copper-glow"),
    "sumi-copper-glow": (4.5, "copper as text (values, active labels)"),
    "sumi-oak": (4.5, "Ania"),
    "sumi-moss": (4.5, "Olaf, ok"),
    "sumi-mizu": (4.5, "Zoja, info"),
    "sumi-alert": (4.5, "error"),
    "sumi-caution": (4.5, "warning"),
    "sumi-ok": (4.5, "success"),
    "sumi-info": (4.5, "information"),
    "sumi-stone": (3.0, "neutral data"),
    "sumi-ink-disabled": (0, "disabled text — exempt by design"),
    "sumi-muted": (0, "disabled icons — non-text"),
    "sumi-copper-deep": (0, "seam shadow / border — never text"),
    "sumi-line": (0, "borders — non-text"),
}

# extra pairings: (foreground token, background token, min ratio, note)
PAIRS = [
    ("sumi-ground", "sumi-copper", 3.0, "text-primary-color on primary-color (filled buttons)"),
    ("sumi-ink", "sumi-view", 4.5, "primary text on view background"),
    ("sumi-ink-soft", "sumi-ground", 4.5, "sidebar text on sidebar"),
    ("sumi-copper", "sumi-ground", 3.0, "selected sidebar rule on sidebar"),
]


def luminance(rgb: tuple[int, int, int]) -> float:
    def channel(c: int) -> float:
        s = c / 255
        return s / 12.92 if s <= 0.03928 else ((s + 0.055) / 1.055) ** 2.4

    r, g, b = (channel(c) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(fg: tuple[int, int, int], bg: tuple[int, int, int]) -> float:
    l1, l2 = luminance(fg), luminance(bg)
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)


def verdict(ratio: float) -> str:
    if ratio >= 7:
        return "AAA"
    if ratio >= 4.5:
        return "AA"
    if ratio >= 3:
        return "AA large"
    return "fail"


def run(markdown: bool) -> int:
    _, theme = load_theme()
    modes = theme["modes"]
    failures: list[str] = []
    rows: list[tuple[str, str, str, str]] = []

    def measure(fg_tok: str, bg_tok: str, mode: str) -> float | None:
        fg = hex_to_rgb(str(modes[mode].get(fg_tok, theme.get(fg_tok, ""))))
        bg = hex_to_rgb(str(modes[mode].get(bg_tok, theme.get(bg_tok, ""))))
        if fg is None or bg is None:
            return None
        return contrast(fg, bg)

    for tok, (minimum, note) in CHECKS.items():
        cells = []
        for mode in ("dark", "light"):
            r = measure(tok, "sumi-surface", mode)
            if r is None:
                cells.append("n/a")
                continue
            cells.append(f"{r:.2f}")
            if minimum and r < minimum:
                failures.append(f"{tok} in {mode} mode: {r:.2f} < {minimum} ({note})")
        ratios = [c for c in cells if c != "n/a"]
        worst = min((float(c) for c in ratios), default=0.0)
        rows.append((tok, cells[0], cells[1], f"{verdict(worst) if ratios else 'n/a'} — {note}" if minimum else f"info — {note}"))

    pair_rows: list[tuple[str, str, str, str]] = []
    for fg_tok, bg_tok, minimum, note in PAIRS:
        cells = []
        for mode in ("dark", "light"):
            r = measure(fg_tok, bg_tok, mode)
            cells.append("n/a" if r is None else f"{r:.2f}")
            if r is not None and r < minimum:
                failures.append(f"{fg_tok} on {bg_tok} in {mode} mode: {r:.2f} < {minimum} ({note})")
        pair_rows.append((f"{fg_tok} on {bg_tok}", cells[0], cells[1], note))

    if markdown:
        print("| Token | Dark on `sumi-surface` | Light on `sumi-surface` | Verdict |")
        print("|---|---|---|---|")
        for tok, d, l, v in rows:
            print(f"| `{tok}` | {d} | {l} | {v} |")
        print()
        print("| Pairing | Dark | Light | Where |")
        print("|---|---|---|---|")
        for p, d, l, v in pair_rows:
            print(f"| {p} | {d} | {l} | {v} |")
    else:
        print(f"{'token':22s} {'dark':>6s} {'light':>6s}  verdict")
        for tok, d, l, v in rows:
            print(f"{tok:22s} {d:>6s} {l:>6s}  {v}")
        print()
        for p, d, l, v in pair_rows:
            print(f"{p:40s} {d:>6s} {l:>6s}  {v}")
        print()
        if failures:
            print("FAIL")
            for f in failures:
                print("  ✗", f)
        else:
            print("PASS — all enforced tokens meet their minimum in both modes")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(run("--markdown" in sys.argv[1:]))
