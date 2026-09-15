---
description: "Verify an M/L change before PR: diff → scope-review (+ ops-review when the diff touches I/O) → assumptions → x2 stop rule → VERDICT line. Read-only."
argument-hint: "[git range] [assumptions: A1 …; A2 …] [estimate: N files, M loc] [scope: goal / non-goals]"
---
READ-ONLY verification of the current change. Do not edit files, do not run tests, formatters or build steps, do not commit. Findings only, every finding with `file:line` evidence. Tests belong to the build phase and CI, not here.

Input (free text, may be empty): $@

Parse the input for: a git range/ref; a list of assumptions (`A1 …`); an estimate (`N files, M loc`); scope text (goal and non-goals); an `accepted:` block — findings from earlier verification rounds and decisions the owner made while the phase was blocked. Missing parts are simply skipped, never invented.

Accepted items are requirements: a change that implements one of them is in scope for scope-review even when the plan text does not mention it, and ops-review does not raise it again. Lenses must not contradict each other across rounds: if ops-review demanded a safeguard in a previous round, scope-review does not reject it in this one.

## Step 1 — Diff
- Frame: the given range, or the working tree against `git merge-base HEAD <default branch>`. If `merge-base` fails (no remote, shallow clone, detached HEAD), use `HEAD` and say so in the report; never read a failed command as "no changes".
- Start with `git diff --stat <frame>`. Then take hunks per file with `git diff <frame> -- <path>` only for source files: skip generated, lock, minified and vendored files, and for any single file above ~400 changed lines read only its hunk headers plus the first hunk.
- Record the stat verbatim, the list of files with added/removed counts, and whether the diff touches I/O (network, DB, filesystem, subprocess, queues, HTTP clients, migrations) with `file:line` evidence.
- Empty diff → report it and finish with `VERDICT: FAIL reason=no-changes`.

## Step 2 — Lenses
- Read `~/.pi/agent/skills/scope-review/SKILL.md` and apply it to the diff exactly as written there, using the scope text from the input as the requirement. Collect its findings with severity BLOCKING / WARN / INFO.
- If the diff touches I/O: read `~/.pi/agent/skills/ops-review/SKILL.md` and apply it the same way. Otherwise write "ops-review: skipped, no I/O in diff".
- If a SKILL.md file is missing, do not improvise the lens: report the missing path and finish with `VERDICT: FAIL reason=missing-skill <path>`.
- Deduplicate findings that point at the same `file:line`.

## Step 3 — Assumptions
For each assumption from the input: `CONFIRMED` with the evidence that confirms it, or `UNVERIFIED` with what would confirm it. Evidence is read-only: file contents, git history, command output that changes nothing. No assumptions given → "assumptions: none passed".

## Step 4 — x2 stop rule
If an estimate was given: compare the actual number of changed files and net LOC from Step 1 with it. Either one above 2× the estimate → note `scope-x2` with the numbers.

## Report
Print, in this order: diff stat and frame; lenses (scope-review, ops-review) with findings grouped by severity; assumptions; x2 rule; "What to check on review" — 3–5 concrete manual checks.

Then print the verdict as the very last line of the answer, nothing after it:

- `VERDICT: PASS unverified=<m>` — no BLOCKING and no WARN findings, x2 rule not triggered; `m` = UNVERIFIED assumptions, they stay in the report and do not fail the verdict.
- `VERDICT: FAIL reason=<blocking|warn|scope-x2|no-changes|missing-skill> <one short clause>` — otherwise. WARN findings fail the verdict too: they are fixed in the same phase, never carried into the next one. Only INFO may be left as is.
