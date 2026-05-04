#!/usr/bin/env python3
"""Inspect a .pptx file using only Python stdlib.

Usage:
    python pptx-inspect.py input.pptx [--json]
"""

import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


def text_from_xml(raw: bytes) -> str:
    try:
        root = ET.fromstring(raw)
    except ET.ParseError:
        return ""
    values = []
    for node in root.iter():
        if node.tag.endswith("}t") and node.text:
            values.append(node.text.strip())
    return " ".join(v for v in values if v)


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python pptx-inspect.py input.pptx [--json]", file=sys.stderr)
        return 2
    source = Path(sys.argv[1])
    json_out = "--json" in sys.argv
    if not source.exists() or source.suffix.lower() != ".pptx":
        print(f"Not a .pptx file: {source}", file=sys.stderr)
        return 2
    with zipfile.ZipFile(source) as archive:
        names = archive.namelist()
        slides = sorted((name for name in names if re.match(r"ppt/slides/slide\d+\.xml$", name)), key=lambda name: int(re.search(r"(\d+)", name).group(1)))
        media = [name for name in names if name.startswith("ppt/media/")]
        slide_text = [{"slide": index + 1, "path": name, "text": text_from_xml(archive.read(name))} for index, name in enumerate(slides)]
    report = {"file": str(source), "slideCount": len(slides), "mediaCount": len(media), "slides": slide_text, "media": media}
    if json_out:
        print(json.dumps(report, indent=2))
    else:
        print(f"Slides: {report['slideCount']}")
        print(f"Media: {report['mediaCount']}")
        for slide in slide_text:
            print(f"Slide {slide['slide']}: {slide['text'][:160]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
