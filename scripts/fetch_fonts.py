#!/usr/bin/env python3
"""Fetch self-hosted WOFF2 subsets for the Sumi House typefaces and generate the loader.

Downloads from Google Fonts only the slices the dashboard needs:

  * Zen Old Mincho       400 / 500 / 600   latin + latin-ext + the CJK slices covering 墨の家
  * Zen Kaku Gothic New  300 / 400 / 500   latin + latin-ext + the CJK slices covering 墨の家
  * IBM Plex Mono        300 / 400 / 500 / 600   latin + latin-ext

and writes:

  www/sumi-house/fonts/*.woff2         the font files
  www/sumi-house/fonts/sumi-fonts.css   @font-face rules (for inspection / direct <link> use)
  www/sumi-house/fonts/manifest.json    provenance: source URL, sha256, bytes per file
  www/sumi-house/sumi-fonts.js          the extra_module_url loader with the CSS inlined

Standard library only. Re-run whenever the font set changes; everything it writes is
regenerated from scratch. Requires network access (once) — the output is what makes the
dashboard render offline.
"""
from __future__ import annotations

import hashlib
import json
import re
import ssl
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FONT_DIR = ROOT / "www" / "sumi-house" / "fonts"
JS_OUT = ROOT / "www" / "sumi-house" / "sumi-fonts.js"
CSS_OUT = FONT_DIR / "sumi-fonts.css"
MANIFEST_OUT = FONT_DIR / "manifest.json"

# Home Assistant serves <config>/www/ at /local/
WEB_PREFIX = "/local/sumi-house/fonts"

# A modern desktop UA makes Google serve woff2 with unicode-range slices.
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)

# The only CJK glyphs the theme needs: the house mark.
MARK = "墨の家"
LATIN_SUBSETS = {"latin", "latin-ext"}

FAMILIES = [
    {
        "family": "Zen Old Mincho",
        "slug": "zen-old-mincho",
        "weights": [400, 500, 600],
        "cjk": True,
    },
    {
        "family": "Zen Kaku Gothic New",
        "slug": "zen-kaku-gothic-new",
        "weights": [300, 400, 500],
        "cjk": True,
        # The family has no 600 cut. Let the 500 face answer requests for 600 so the
        # browser never synthesises a heavier weight (§3.7: the type is quiet).
        "weight_range": {500: "500 600"},
    },
    {
        "family": "IBM Plex Mono",
        "slug": "ibm-plex-mono",
        "weights": [300, 400, 500, 600],
        "cjk": False,
    },
]

BLOCK_RE = re.compile(
    r"(?:/\*\s*(?P<label>[^*]+?)\s*\*/\s*)?@font-face\s*\{(?P<body>[^}]*)\}", re.S
)


def fetch(url: str) -> bytes:
    """GET a URL. Falls back to curl when Python has no usable CA bundle
    (common with python.org builds on macOS before Install Certificates.command)."""
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return resp.read()
    except urllib.error.URLError as err:
        if not isinstance(err.reason, ssl.SSLCertVerificationError):
            raise
        result = subprocess.run(
            ["curl", "-sSL", "--fail", "-m", "60", "-A", USER_AGENT, url],
            check=True,
            capture_output=True,
        )
        return result.stdout


def parse_ranges(spec: str) -> list[tuple[int, int]]:
    out: list[tuple[int, int]] = []
    for part in spec.split(","):
        part = part.strip()
        if not part.upper().startswith("U+"):
            continue
        body = part[2:]
        if "-" in body:
            a, b = body.split("-", 1)
            out.append((int(a, 16), int(b, 16)))
        elif "?" in body:
            out.append((int(body.replace("?", "0"), 16), int(body.replace("?", "F"), 16)))
        else:
            cp = int(body, 16)
            out.append((cp, cp))
    return out


def covers(ranges: list[tuple[int, int]], text: str) -> str:
    return "".join(ch for ch in text if any(a <= ord(ch) <= b for a, b in ranges))


def css_url(fam: dict) -> str:
    weights = ";".join(str(w) for w in fam["weights"])
    q = f"family={urllib.parse.quote_plus(fam['family'])}:wght@{weights}&display=swap"
    return "https://fonts.googleapis.com/css2?" + q


def main() -> int:
    FONT_DIR.mkdir(parents=True, exist_ok=True)
    for old in FONT_DIR.glob("*.woff2"):
        old.unlink()

    faces: list[dict] = []
    for fam in FAMILIES:
        url = css_url(fam)
        print(f"→ {fam['family']}: {url}")
        css = fetch(url).decode("utf-8")
        seen: set[str] = set()
        for m in BLOCK_RE.finditer(css):
            label = (m.group("label") or "").strip() or None
            body = m.group("body")
            weight = int(re.search(r"font-weight:\s*(\d+)", body).group(1))
            src = re.search(r"url\((https://[^)]+\.woff2)\)", body).group(1)
            urange = re.search(r"unicode-range:\s*([^;]+);", body).group(1).strip()
            ranges = parse_ranges(urange)

            if label in LATIN_SUBSETS:
                tag = label
            elif label is None and fam["cjk"]:
                hit = covers(ranges, MARK)
                if not hit:
                    continue
                tag = "cjk-" + hashlib.sha1(urange.encode()).hexdigest()[:6]
            else:
                continue

            filename = f"{fam['slug']}-{weight}-{tag}.woff2"
            if filename in seen:
                continue
            seen.add(filename)
            data = fetch(src)
            (FONT_DIR / filename).write_bytes(data)
            faces.append(
                {
                    "file": filename,
                    "family": fam["family"],
                    "weight": weight,
                    "css_weight": fam.get("weight_range", {}).get(weight, str(weight)),
                    "subset": tag,
                    "glyphs": covers(ranges, MARK) if tag.startswith("cjk") else "",
                    "unicode_range": urange,
                    "source": src,
                    "sha256": hashlib.sha256(data).hexdigest(),
                    "bytes": len(data),
                }
            )
            print(f"   {filename:48s} {len(data):>7d} B  {faces[-1]['glyphs']}")

    faces.sort(key=lambda f: (f["family"], f["weight"], f["subset"]))

    rules = []
    for f in faces:
        rules.append(
            "@font-face {\n"
            f"  font-family: '{f['family']}';\n"
            "  font-style: normal;\n"
            f"  font-weight: {f['css_weight']};\n"
            "  font-display: swap;\n"
            f"  src: url({WEB_PREFIX}/{f['file']}) format('woff2');\n"
            f"  unicode-range: {f['unicode_range']};\n"
            "}"
        )
    header = (
        "/* Sumi House — self-hosted font faces.\n"
        "   GENERATED by scripts/fetch_fonts.py — do not edit by hand.\n"
        "   Zen Old Mincho, Zen Kaku Gothic New and IBM Plex Mono are licensed under the\n"
        "   SIL Open Font License 1.1; see the OFL-*.txt files alongside the woff2 files. */\n"
    )
    css_text = header + "\n".join(rules) + "\n"
    CSS_OUT.write_text(css_text, encoding="utf-8")

    js_text = (
        "/* Sumi House — font loader for `frontend.extra_module_url`.\n"
        "   GENERATED by scripts/fetch_fonts.py — do not edit by hand; edit the script and re-run.\n"
        "\n"
        "   Theme YAML cannot declare @font-face, so this module injects the rules into\n"
        "   document.head. Font faces are document-global, so every shadow root in Home\n"
        "   Assistant can use them. All files are served from /local/sumi-house/fonts/ —\n"
        "   the dashboard renders correctly with no internet access. */\n"
        "\n"
        'const STYLE_ID = "sumi-house-fonts";\n'
        "const CSS = String.raw`\n" + css_text.replace("`", "\\`") + "`;\n"
        "\n"
        "if (!document.getElementById(STYLE_ID)) {\n"
        '  const style = document.createElement("style");\n'
        "  style.id = STYLE_ID;\n"
        "  style.textContent = CSS;\n"
        "  document.head.appendChild(style);\n"
        "}\n"
    )
    JS_OUT.write_text(js_text, encoding="utf-8")

    MANIFEST_OUT.write_text(
        json.dumps({"mark": MARK, "web_prefix": WEB_PREFIX, "faces": faces}, indent=2, ensure_ascii=False)
        + "\n",
        encoding="utf-8",
    )

    total = sum(f["bytes"] for f in faces)
    print(f"\n{len(faces)} faces, {total / 1024:.0f} KiB total")
    print(f"wrote {CSS_OUT.relative_to(ROOT)}, {JS_OUT.relative_to(ROOT)}, {MANIFEST_OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
