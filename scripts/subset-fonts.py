#!/usr/bin/env python3
"""Build the small heading fonts in assets/fonts/.

Headings (h1, h2, h4 and the English tagline) use Noto Serif. Shipping the
full fonts would cost ~20 MB, so this keeps only the characters that headings
actually use, in all four languages, plus printable ASCII.

Run again whenever a heading changes:

    pip install fonttools brotli
    python3 scripts/subset-fonts.py NotoSerifKR-Bold.otf NotoSerifSC-Bold.otf

Source fonts (OFL-1.1): https://github.com/notofonts/noto-cjk/tree/main/Serif/SubsetOTF
Characters a heading uses but the subset lacks fall back to the system serif.
"""
import html
import re
import sys
from pathlib import Path

from fontTools import subset

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "fonts"
SERIF_TAGS = re.compile(r"<(h1|h2|h4)\b[^>]*>(.*?)</\1>|<p class=\"hero-en\"[^>]*>(.*?)</p>", re.S)


def strip(fragment: str) -> str:
    fragment = re.sub(r"\$\{[A-Z]+\}", " ", fragment)
    fragment = re.sub(r'<span class="pron".*?</span>', " ", fragment, flags=re.S)
    return html.unescape(re.sub(r"<[^>]+>", " ", fragment))


def heading_text():
    page = (ROOT / "index.html").read_text(encoding="utf-8")
    i18n = (ROOT / "i18n.js").read_text(encoding="utf-8")
    korean, keys = [], set()
    for m in SERIF_TAGS.finditer(page):
        block = m.group(2) or m.group(3) or ""
        korean.append(strip(block))
        keys.update(re.findall(r'data-i18n="([^"]+)"', m.group(0)))
    # Translations live in i18n.js as one "key": value per line.
    per_lang = {"en": [], "zh": [], "es": []}
    lang = None
    for line in i18n.splitlines():
        head = re.match(r"\s{4}(en|zh|es): \{", line)
        if head:
            lang = head.group(1)
            continue
        m = re.match(r'\s+"([^"]+)": (["`\'])(.*)\2,?\s*$', line)
        if lang and m and m.group(1) in keys:
            per_lang[lang].append(strip(m.group(3)))
    return " ".join(korean + per_lang["en"] + per_lang["es"]), " ".join(per_lang["zh"])


def build(src: str, text: str, out_name: str):
    ascii_printable = "".join(chr(c) for c in range(0x20, 0x7F))
    chars = "".join(sorted(set(text + ascii_printable + "·—–’“”…"))).replace("\n", "")
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["kern", "liga", "palt", "vpal"]
    options.name_IDs = ["*"]
    options.notdef_outline = True
    font = subset.load_font(src, options)
    subsetter = subset.Subsetter(options)
    subsetter.populate(text=chars)
    subsetter.subset(font)
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / out_name
    subset.save_font(font, str(path), options)
    print(f"{out_name}: {len(set(chars))} characters, {path.stat().st_size // 1024} KB")


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    kr_src, sc_src = sys.argv[1], sys.argv[2]
    latin_korean, chinese = heading_text()
    build(kr_src, latin_korean, "noto-serif-kr-headings.woff2")
    build(sc_src, chinese, "noto-serif-sc-headings.woff2")


if __name__ == "__main__":
    main()
