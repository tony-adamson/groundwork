#!/usr/bin/env python3
"""Generate the Codex variant of the skills from the canonical Claude versions.

Canonical source: skills/ (Claude Code / Pi format).
Output: codex/skills/ — regenerated from scratch on every run, do not edit by hand.

Transformations:
1. SKILL.md frontmatter: replace `description:` with the Codex trigger description,
   drop Claude-only keys (`disable-model-invocation`, `argument-hint`).
2. Body: backticked skill references get the Codex `$` prefix (`planf3` -> `$planf3`).
3. Per-file line overrides for Claude-Code-specific wording (see LINE_OVERRIDES).
4. Codex-only files (agents/openai.yaml) are copied from codex/overlay/.
"""

import re
import shutil
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SRC = REPO / "skills"
OVERLAY = REPO / "codex" / "overlay"
OUT = REPO / "codex" / "skills"

SKILLS = ["codebase-analysis", "solution-design", "planf3", "ops-review"]

CODEX_DESCRIPTIONS = {
    "codebase-analysis": "Use when explicitly asked for $codebase-analysis to create or fully update CURRENT_STATE.md with evidence for the current repository or focused area. Do not use for casual code questions, reviews, implementation, debugging, solution design, or planning.",
    "solution-design": "Use when explicitly asked for $solution-design to create SOLUTION.md for one concrete software change before implementation planning. Produces a minimal evidence-based design; does not write code or create an implementation plan.",
    "planf3": "Use when explicitly asked for $planf3 to create, update, or build a minimal Markdown implementation plan from SOLUTION.md or a concrete approved task. Do not use for solution design or speculative architecture.",
    "ops-review": "Use when explicitly asked for $ops-review to review an implemented change for silent operational failures: missing timeouts, unbounded resources, connection leaks, non-idempotent retries, slow-dependency degradation. Read-only findings report; does not fix code and does not replace load testing.",
}

CLAUDE_ONLY_KEYS = ("disable-model-invocation", "argument-hint")

SKILL_REF = re.compile(r"`(graphify|codebase-analysis|solution-design|planf3|ops-review)`")

# Exact whole-line replacements for wording that only makes sense in Claude Code.
# Keyed by path relative to skills/. Applied after the $-prefix pass.
LINE_OVERRIDES = {
    "planf3/workflows/build-plan.md": {
        "5. Run a final read-only review: `/code-review` in Claude Code, ponytail in Pi; if unavailable — a separate inline pass that outputs only findings.":
        "5. Run a final fresh read-only code review; if a separate reviewer is unavailable — do a separate inline pass that outputs only findings.",
        "6. If the diff looks bloated — shrink it: `/simplify` in Claude Code; otherwise a separate reuse/simplification pass that applies the fixes.":
        "6. If the diff looks bloated — run a simplify/reuse pass and apply only fixes that reduce scope without losing requirements.",
    },
}


def convert_frontmatter(lines: list[str], skill: str) -> list[str]:
    assert lines[0] == "---", f"{skill}/SKILL.md: expected frontmatter"
    end = lines.index("---", 1)
    result = ["---"]
    for line in lines[1:end]:
        key = line.split(":", 1)[0].strip()
        if key in CLAUDE_ONLY_KEYS:
            continue
        if key == "description":
            result.append(f'description: "{CODEX_DESCRIPTIONS[skill]}"')
        else:
            result.append(line)
    return result + lines[end:]


def convert_file(rel: str, text: str, skill: str) -> str:
    lines = text.split("\n")
    if rel.endswith("SKILL.md") and "/" not in rel.split(f"{skill}/", 1)[-1]:
        lines = convert_frontmatter(lines, skill)
    lines = [SKILL_REF.sub(r"`$\1`", line) for line in lines]
    overrides = LINE_OVERRIDES.get(rel, {})
    lines = [overrides.get(line, line) for line in lines]
    missing = set(overrides) - set(text.split("\n"))
    if missing:
        sys.exit(f"stale LINE_OVERRIDES for {rel}: {sorted(missing)}")
    return "\n".join(lines)


def main() -> None:
    for rel in LINE_OVERRIDES:
        if not (SRC / rel).is_file():
            sys.exit(f"LINE_OVERRIDES references missing file: {rel}")
    if OUT.exists():
        shutil.rmtree(OUT)
    for skill in SKILLS:
        for src in sorted((SRC / skill).rglob("*")):
            if not src.is_file() or src.name == ".DS_Store":
                continue
            rel = str(src.relative_to(SRC))
            dst = OUT / rel
            dst.parent.mkdir(parents=True, exist_ok=True)
            dst.write_text(convert_file(rel, src.read_text(), skill))
        overlay = OVERLAY / skill
        if overlay.exists():
            shutil.copytree(overlay, OUT / skill, dirs_exist_ok=True)
    print(f"built {OUT.relative_to(REPO)} for: {', '.join(SKILLS)}")


if __name__ == "__main__":
    main()
