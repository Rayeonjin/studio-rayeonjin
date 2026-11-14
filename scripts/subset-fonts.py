#!/usr/bin/env python3
"""Build the small heading fonts in assets/fonts/.

Headings (h1, h2, h4) use IBM Plex Sans KR (Korean, English, Spanish) and
IBM Plex Sans SC (Chinese), Bold. Shipping the full fonts would cost ~8 MB,
so this keeps only the characters headings actually use, in all four
languages, plus printable ASCII.

IBM Plex is OFL-1.1 with the Reserved Font Name "Plex", so the cut-down
files are renamed "Rayeonjin Headings" as the license requires.

Run again whenever a heading changes:

    pip install fonttools brotli
    python3 scripts/subset-fonts.py IBMPlexSansKR-Bold.otf IBMPlexSansSC-Bold.otf

Source fonts: https://github.com/IBM/plex/tree/master/packages
Characters a heading uses but the subset lacks fall back to the system sans.
"""
import html
import re
import sys
from pathlib import Path

from fontTools import subset

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "fonts"
HEADING_TAGS = re.compile(r"<(h1|h2|h4)\b[^>]*>(.*?)</\1>", re.S)


def strip(fragment: str) -> str:
    fragment = re.sub(r"\$\{[A-Z]+\}", " ", fragment)
    fragment = re.sub(r'<span class="pron".*?</span>', " ", fragment, flags=re.S)
    return html.unescape(re.sub(r"<[^>]+>", " ", fragment))


def heading_text():
    page = (ROOT / "index.html").read_text(encoding="utf-8")
    i18n = (ROOT / "i18n.js").read_text(encoding="utf-8")
    korean, keys = [], set()
    for m in HEADING_TAGS.finditer(page):
        block = m.group(2) or ""
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
    # 404.html keeps its own four-language strings inline; include all of its text.
    lost = strip((ROOT / "404.html").read_text(encoding="utf-8"))
    return " ".join(korean + per_lang["en"] + per_lang["es"] + [lost]), " ".join(per_lang["zh"] + [lost])


FAMILY = "Rayeonjin Headings"


def rename(font, suffix: str):
    """Give the subset its own name (OFL Reserved Font Name rule)."""
    family = f"{FAMILY} {suffix}"
    names = {1: family, 2: "Bold", 3: f"{family} Bold; subset", 4: f"{family} Bold",
             6: f"{family.replace(' ', '')}-Bold", 16: family, 17: "Bold"}
    table = font["name"]
    for record in list(table.names):
        if record.nameID in names:
            table.setName(names[record.nameID], record.nameID, record.platformID, record.platEncID, record.langID)
    if "CFF " in font:
        font["CFF "].cff.fontNames = [names[6]]


def build(src: str, text: str, out_name: str, suffix: str):
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
    rename(font, suffix)
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / out_name
    subset.save_font(font, str(path), options)
    print(f"{out_name}: {len(set(chars))} characters, {path.stat().st_size // 1024} KB")


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    kr_src, sc_src = sys.argv[1], sys.argv[2]
    latin_korean, chinese = heading_text()
    build(kr_src, latin_korean, "headings-kr.woff2", "KR")
    build(sc_src, chinese, "headings-sc.woff2", "SC")


if __name__ == "__main__":
    main()
