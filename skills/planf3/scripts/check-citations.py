#!/usr/bin/env python3
"""Check the `file:line` citations of a Markdown document against the live repository.

usage: check-citations.py DOC [--root DIR]

A citation is an inline-code token of the form `path.ext:12`, `path.ext:12-30` or
`path.ext:477, 491`. The path is taken relative to the root (default: the git top level
of the current directory); a bare or partial path is matched as a suffix of `git ls-files`,
because documents often cite `agent.rs:49` for `w4d3/src/agent.rs`. A citation fails when
no such file exists or when every matching file is shorter than the highest cited line.
Exit 1 with one line per failure; exit 0 otherwise.
"""
import argparse
import re
import subprocess
import sys
from pathlib import Path

TOKEN = re.compile(r"`([^`\s]+\.[A-Za-z0-9]{1,8}):(\d+(?:[-–]\d+)?(?:,\s*\d+(?:[-–]\d+)?)*)`")


def repo_files(root: Path) -> list[str]:
    out = subprocess.run(["git", "-C", str(root), "ls-files"], capture_output=True, text=True, timeout=30)
    return out.stdout.splitlines() if out.returncode == 0 else []


def candidates(path: str, root: Path, tracked: list[str]) -> list[Path]:
    direct = Path(path).expanduser()
    if direct.is_absolute():
        return [direct] if direct.is_file() else []
    if (root / path).is_file():
        return [root / path]
    return [root / f for f in tracked if f == path or f.endswith("/" + path)]


def line_count(p: Path) -> int:
    with p.open("rb") as fh:
        return sum(1 for _ in fh)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("doc")
    ap.add_argument("--root")
    a = ap.parse_args()
    if a.root:
        root = Path(a.root)
    else:
        top = subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True, timeout=30)
        root = Path(top.stdout.strip() or ".")
    tracked = repo_files(root)
    failures, checked = [], 0
    for n, line in enumerate(Path(a.doc).read_text(encoding="utf-8").splitlines(), 1):
        for m in TOKEN.finditer(line):
            checked += 1
            path, nums = m.group(1), m.group(2)
            top_line = max(int(x) for x in re.findall(r"\d+", nums))
            found = candidates(path, root, tracked)
            if not found:
                failures.append(f"{a.doc}:{n}: `{m.group(0)[1:-1]}` - no such file under {root}")
            elif all(line_count(p) < top_line for p in found):
                failures.append(f"{a.doc}:{n}: `{m.group(0)[1:-1]}` - line {top_line} is past the end of {', '.join(str(p.relative_to(root)) if p.is_relative_to(root) else str(p) for p in found)}")
    for f in failures:
        print(f)
    print(f"citations: {checked} checked, {len(failures)} failed")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
