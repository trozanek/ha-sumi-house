"""Shared loader for themes/sumi_house.yaml used by the scripts in this folder.

Uses PyYAML when installed; otherwise falls back to a small parser that understands
exactly the subset of YAML a Home Assistant theme file uses (nested mappings, quoted
scalars, `|` block scalars, comments). Standard library only.
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
THEME_FILE = ROOT / "themes" / "sumi_house.yaml"
THEME_NAME = "Sumi House"


def _strip_value(raw: str) -> str:
    raw = raw.strip()
    if not raw:
        return ""
    if raw[0] in "\"'":
        q = raw[0]
        end = raw.find(q, 1)
        while q == "'" and end != -1 and raw[end + 1 : end + 2] == "'":
            end = raw.find(q, end + 2)
        return raw[1:end] if end != -1 else raw[1:]
    return raw.split(" #", 1)[0].strip()


def _fallback_parse(text: str) -> dict:
    root: dict = {}
    stack: list[tuple[int, dict]] = [(-1, root)]
    lines = text.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        i += 1
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        indent = len(line) - len(line.lstrip(" "))
        while stack and indent <= stack[-1][0]:
            stack.pop()
        parent = stack[-1][1]
        key, _, rest = line.strip().partition(":")
        rest = rest.strip()
        if rest == "|" or rest.startswith("|"):
            block: list[str] = []
            block_indent = None
            while i < len(lines):
                nxt = lines[i]
                if nxt.strip() == "":
                    block.append("")
                    i += 1
                    continue
                ni = len(nxt) - len(nxt.lstrip(" "))
                if ni <= indent:
                    break
                block_indent = ni if block_indent is None else min(block_indent, ni)
                block.append(nxt)
                i += 1
            bi = block_indent or 0
            parent[key] = "\n".join(b[bi:] if b else "" for b in block).rstrip("\n") + "\n"
        elif rest == "":
            child: dict = {}
            parent[key] = child
            stack.append((indent, child))
        else:
            parent[key] = _strip_value(rest)
    return root


def load_theme(path: Path = THEME_FILE) -> tuple[str, dict]:
    text = path.read_text(encoding="utf-8")
    try:
        import yaml  # type: ignore

        data = yaml.safe_load(text)
    except ModuleNotFoundError:
        data = _fallback_parse(text)
    if not isinstance(data, dict) or len(data) != 1:
        raise SystemExit(f"{path}: expected exactly one top-level theme, found {list(data) if isinstance(data, dict) else type(data)}")
    name, theme = next(iter(data.items()))
    return name, theme


HEX_RE = re.compile(r"^#([0-9a-fA-F]{6})$")


def hex_to_rgb(value: str) -> tuple[int, int, int] | None:
    m = HEX_RE.match(value.strip())
    if not m:
        return None
    h = m.group(1)
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
