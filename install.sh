#!/usr/bin/env bash
# Mirror the skills from this repo into local agent harnesses.
# Uses rsync --delete: files removed from the repo are removed from the
# target copies too — target copies must not hold unique content.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS=(codebase-analysis solution-design planf3 ops-review)

usage() {
  echo "usage: $0 [--claude] [--codex] [--pi] [--all]"
  echo "  --claude  sync canonical skills into ~/.claude/skills"
  echo "  --codex   rebuild and sync Codex variant into ~/.codex/skills"
  echo "  --pi      sync canonical skills into ~/.pi/agent/skills"
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

do_claude=false do_codex=false do_pi=false
for arg in "$@"; do
  case "$arg" in
    --claude) do_claude=true ;;
    --codex) do_codex=true ;;
    --pi) do_pi=true ;;
    --all) do_claude=true do_codex=true do_pi=true ;;
    *) usage ;;
  esac
done

if $do_claude; then
  sync_tree "$REPO/skills" "$HOME/.claude/skills"
fi
if $do_codex; then
  python3 "$REPO/tools/build_codex.py"
  sync_tree "$REPO/codex/skills" "$HOME/.codex/skills"
fi
if $do_pi; then
  sync_tree "$REPO/skills" "$HOME/.pi/agent/skills"
fi
