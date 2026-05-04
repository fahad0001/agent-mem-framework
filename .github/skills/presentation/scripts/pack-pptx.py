#!/usr/bin/env python3
"""Pack an unpacked PPTX directory back into a .pptx file.

Usage:
    python pack-pptx.py unpacked_dir output.pptx
"""

import sys
import zipfile
from pathlib import Path


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: python pack-pptx.py unpacked_dir output.pptx", file=sys.stderr)
        return 2
    source = Path(sys.argv[1])
    target = Path(sys.argv[2])
    if not source.is_dir():
        print(f"Not a directory: {source}", file=sys.stderr)
        return 2
    if target.suffix.lower() != ".pptx":
        print("Output must end in .pptx", file=sys.stderr)
        return 2
    target.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as archive:
        for file in sorted(source.rglob("*")):
            if file.is_file():
                archive.write(file, file.relative_to(source).as_posix())
    print(f"Packed {source} to {target}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())