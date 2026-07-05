# groundwork

**English** | [Русский](README.ru.md)

Evidence-first process skills for coding agents: survey the codebase, design the
minimal solution, compile it into the smallest executable plan — and only then build.

The pipeline is three skills, each producing one reviewable Markdown artifact:

| Skill | Artifact | Answers |
|---|---|---|
| `codebase-analysis` | `CURRENT_STATE.md` | How does the system work **right now**? Evidence only, no proposals. |
| `solution-design` | `SOLUTION.md` | What to change, why this way, which contracts must survive, what is out of scope. |
| `planf3` | `specs/<name>-implementation-plan.md` | The smallest executable plan; also executes an approved plan (Build Plan mode). |

Each stage is gated: a skill refuses to run ahead of its inputs (`BLOCKED`), refuses
to grow the scope (`SCOPE_OVERDESIGN`), and never silently invokes the next stage.
Every artifact has two blocks — a short human summary and a detailed agent contract —
and every material claim must be backed by evidence from the live code, not model memory.

The skills encode a minimal-sufficient-change philosophy: no future-proofing, no new
abstractions without a second real call site, budgets on diff size, and explicit stop
rules when the actual change outgrows the estimate.

> Skill instructions are currently written in Russian. File names, statuses, commands,
> and all machine-readable parts are English.

## Layout

```
skills/            canonical versions (Claude Code / Pi format) — edit these
codex/skills/      generated Codex CLI variant — do not edit by hand
codex/overlay/     Codex-only files (agents/openai.yaml) merged in at build time
tools/build_codex.py   regenerates codex/skills/ from skills/
install.sh         mirrors skills into local harnesses
```

The canonical source of truth is `skills/`. The Codex variant differs only
mechanically: an English trigger `description`, `$`-prefixed skill references,
Claude-only frontmatter keys dropped, and a couple of harness-specific lines
(see `LINE_OVERRIDES` in `tools/build_codex.py`).

## Install

```bash
git clone https://github.com/tony-adamson/groundwork
cd groundwork
./install.sh --all          # Claude Code + Codex + Pi
./install.sh --claude       # only ~/.claude/skills
./install.sh --codex        # rebuild Codex variant, sync to ~/.codex/skills
./install.sh --pi           # only ~/.pi/agent/skills
```

Syncing uses `rsync --delete`: the local copies are mirrors and must not hold
unique content. To update later: `git pull && ./install.sh --all`.

### Agent install

Paste this to your coding agent (Claude Code, Codex CLI, etc.):

```text
Install the groundwork skills from https://github.com/tony-adamson/groundwork:
1. Clone the repo to a permanent location (e.g. ~/tools/groundwork) — it stays
   as the update source, do not delete it after install.
2. Run ./install.sh with the flags for my harnesses:
   --claude for Claude Code, --codex for Codex CLI, --pi for Pi, --all for everything.
3. Verify: the skills codebase-analysis, solution-design and planf3 appear in
   the harness skills directory (e.g. ls ~/.claude/skills).
To update later: git pull in the clone, then re-run ./install.sh.
```

## Editing

1. Edit files under `skills/` only.
2. Run `python3 tools/build_codex.py` and commit both trees.
3. `./install.sh --all` to roll out locally.

If a Codex-specific wording change is needed, add it to `LINE_OVERRIDES` in
`tools/build_codex.py`; the build fails if an override no longer matches the
canonical text, so overrides cannot silently rot.

## Usage

In Claude Code: `/codebase-analysis`, `/solution-design`, `/planf3`.
In Codex CLI: `$codebase-analysis`, `$solution-design`, `$planf3`.

Intended flow for architecture-sized tasks:

```
codebase-analysis  →  CURRENT_STATE.md   (approve)
solution-design    →  SOLUTION.md        (approve)
planf3             →  implementation plan (approve, then Build Plan)
```

For small tasks, skip straight to `planf3` or just implement — the skills are
deliberately gated to explicit invocation and refuse casual use.

## Origins

The `planf3` skill is not an original work: it is an adapted and reworked
version of [disler/planf3](https://github.com/disler/planf3) by IndyDevDan
(MIT License). `codebase-analysis` and `solution-design` are original but
designed to feed it.

## License

MIT — see [LICENSE](LICENSE); it retains the upstream planf3 copyright notice.
