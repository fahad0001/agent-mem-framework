#!/usr/bin/env python3
"""Unpack a .pptx file into an editable directory.

Usage:
    python unpack-pptx.py input.pptx output_dir
"""

import sys
import zipfile
from pathlib import Path


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: python unpack-pptx.py input.pptx output_dir", file=sys.stderr)
        return 2
    source = Path(sys.argv[1])
    target = Path(sys.argv[2])
    if not source.exists() or source.suffix.lower() != ".pptx":
        print(f"Not a .pptx file: {source}", file=sys.stderr)
        return 2
    target.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(source) as archive:
        archive.extractall(target)
    print(f"Unpacked {source} to {target}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
