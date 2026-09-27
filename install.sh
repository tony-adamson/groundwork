#!/usr/bin/env bash
# Mirror the skills from this repo into local agent harnesses.
# Uses rsync --delete: files removed from the repo are removed from the
# target copies too — target copies must not hold unique content.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS=(codebase-analysis solution-design planf3 ops-review scope-review debug)
WORKFLOWS=(verify.workflow.js build-plan.workflow.js)

usage() {
  echo "usage: $0 [--claude] [--codex] [--pi] [--omp] [--grok] [--all]"
  echo "  --claude  sync canonical skills into ~/.claude/skills and workflows into ~/.claude/workflows"
  echo "  --codex   rebuild and sync Codex variant into ~/.codex/skills"
  echo "  --pi      sync canonical skills into ~/.pi/agent/skills, agents/AGENTS.md into ~/.pi/agent/AGENTS.md, pi/prompts into ~/.pi/agent/prompts"
  echo "  --omp     sync canonical skills into ~/.omp/agent/skills and agents/AGENTS.md into ~/.omp/agent/AGENTS.md"
  echo "  --grok    sync canonical skills into ~/.grok/skills (~/.grok/rules stays hand-adapted)"
  echo "  --all     all of the above"
  exit 1
}

sync_tree() {
  local src="$1" dst="$2"
  for s in "${SKILLS[@]}"; do
    mkdir -p "$dst/$s"
    rsync -a --delete --exclude .DS_Store "$src/$s/" "$dst/$s/"
    echo "synced: $s -> $dst/$s"
  done
}

[ $# -gt 0 ] || usage

do_claude=false do_codex=false do_pi=false do_omp=false do_grok=false
for arg in "$@"; do
  case "$arg" in
    --claude) do_claude=true ;;
    --codex) do_codex=true ;;
    --pi) do_pi=true ;;
    --omp) do_omp=true ;;
    --grok) do_grok=true ;;
    --all) do_claude=true do_codex=true do_pi=true do_omp=true do_grok=true ;;
    *) usage ;;
  esac
done

if $do_claude; then
  sync_tree "$REPO/skills" "$HOME/.claude/skills"
  # Workflows are copied file by file: ~/.claude/workflows may hold the user's own scripts.
  mkdir -p "$HOME/.claude/workflows"
  skipped=0
  for w in "${WORKFLOWS[@]}"; do
    dst="$HOME/.claude/workflows/$w"
    # The mirror is overwritten from the canon, so an edit made only in ~/.claude dies here without a
    # trace: build-plan.workflow.js lost its Precheck phase and the x2 stop rule this way on 2026-09-20.
    if [ -f "$dst" ] && ! cmp -s "$REPO/claude/workflows/$w" "$dst" && [ "$dst" -nt "$REPO/claude/workflows/$w" ]; then
      echo "SKIPPED: $dst is newer than the canon and differs from it" >&2
      skipped=$((skipped+1)); continue
    fi
    cp "$REPO/claude/workflows/$w" "$dst"
    echo "copied: $w -> $dst"
  done
  if [ "$skipped" -gt 0 ]; then
    echo "ACTION NEEDED: $skipped workflow(s) left untouched. Copy each into $REPO/claude/workflows/, commit it, then re-run." >&2
  fi
fi
if $do_codex; then
  python3 "$REPO/tools/build_codex.py"
  sync_tree "$REPO/codex/skills" "$HOME/.codex/skills"
fi
if $do_pi; then
  sync_tree "$REPO/skills" "$HOME/.pi/agent/skills"
  mkdir -p "$HOME/.pi/agent"
  cp "$REPO/agents/AGENTS.md" "$HOME/.pi/agent/AGENTS.md"
  echo "copied: agents/AGENTS.md -> $HOME/.pi/agent/AGENTS.md"
  # Pi reads ~/.pi/agent/prompts non-recursively, so the user's own templates live
  # next to ours: merge without --delete, unlike the skill mirrors above.
  mkdir -p "$HOME/.pi/agent/prompts"
  rsync -a --exclude .DS_Store "$REPO/pi/prompts/" "$HOME/.pi/agent/prompts/"
  echo "synced: pi/prompts -> $HOME/.pi/agent/prompts"
fi
if $do_omp; then
  # oh-my-pi keeps its own agent dir (~/.omp/agent) and does not read ~/.pi/agent.
  sync_tree "$REPO/skills" "$HOME/.omp/agent/skills"
  mkdir -p "$HOME/.omp/agent"
  cp "$REPO/agents/AGENTS.md" "$HOME/.omp/agent/AGENTS.md"
  echo "copied: agents/AGENTS.md -> $HOME/.omp/agent/AGENTS.md"
fi
if $do_grok; then
  # Grok reads the canon as is: its spawn_subagent wording lives in the skills as "On Grok ..." lines.
  # Only the skills are mirrored; ~/.grok/skills also holds Grok's own verify/code-review, which stay.
  sync_tree "$REPO/skills" "$HOME/.grok/skills"
fi
