# Create Plan

Pipeline:

```text
SOLUTION.md or USER_PROMPT
→ draft implementation plan
→ Plan Challenger
→ Lean Plan Challenger
→ corrections
→ Plan Readiness Gate
→ READY_FOR_BUILD
```

## 1. Determine the source

1. If there is a `SOLUTION.md` with the `READY_FOR_PLANF3` status, use it as the architectural contract.
2. If `SOLUTION.md` is absent, a plan may be created only for a local low-risk task. For an architectural task, return `BLOCKED` and ask for `solution-design`.
3. If `SOLUTION.md` has `BLOCKED` or `BLOCKED_BY_SCOPE_OVERDESIGN` — do not plan.
4. Read `CURRENT_STATE.md` if it is relevant.
5. Read the local instructions: `AGENTS.md`, `CLAUDE.md`, README, build/test docs.

## 2. Fix the boundaries

The plan must explicitly contain:

- authoritative requirements;
- what we are building;
- what we are not building;
- the complexity budget;
- the files-to-change budget;
- the estimated LOC net for the whole plan;
- validation commands;
- stop conditions.

## 3. Create the draft Markdown plan

File: `specs/<descriptive-kebab-name>-implementation-plan.md`.

Mandatory structure:

```md
# Implementation plan: <title>

# Block 1. For the human

## 1. In short
## 2. What will be done
## 3. What we are not doing
## 4. Risks
## 5. How to verify
## 6. Readiness

---

# Block 2. For the agent

## 1. Metadata
## 2. Source priority
## 3. Authoritative requirements
## 4. Minimality contract
## 5. Files to change budget
## 6. Requirement traceability
## 7. Operation semantics
## 8. State lifecycle
## 9. Implementation phases
## 10. Validation commands
## 11. Stop conditions
## 12. Verifier/review policy
## 13. Final report format
## 14. Amendments
```

## 4. Human block

Short, without overload:

- the goal;
- the minimal approach;
- the main files/areas;
- explicit non-goals;
- the main risks;
- one command or a list of commands for the final check;
- the status.

No more than 1–2 screens of text.

## 5. Agent block

Must be sufficient for an autonomous Build Plan:

- source priority;
- `SOLUTION.md` decisions;
- plan status;
- phase statuses: `[]`, `[wip]`, `[x]`, `[f]`;
- allowed and forbidden areas;
- exact validation commands;
- observable pass conditions;
- stop conditions;
- verifier policy;
- final review requirements.

## 6. Minimality contract

Mandatory:

| Category | Budget | Exceeded? | Justification |
|----------|--------|-----------|---------------|
| New dependencies | 0 by default | | |
| New persistent state | 0 unless required | | |
| New subsystems/workers/schedulers | 0 unless required | | |
| New global abstractions | 0 unless reused now | | |
| New docs | only contract/usage/validation | | |

If the plan exceeds the budget without a proven current requirement — fix it or set `BLOCKED_BY_SCOPE_OVERDESIGN`.

## 7. Files to change budget

| File / directory | Existing/New | Why required | Requirement | Can be avoided? |
|------------------|--------------|--------------|-------------|-----------------|

Every new file must have a reason. If it can be done locally without a new layer — prefer locally.

Below the table, state the total estimate: `Estimated LOC net: ~N`. It is used by the 2× stop rule during Build Plan. It counts source, tests and every script or function the plan gives verbatim (2026-09-25: two phases stopped at 2.4× because their estimates left out the test harness and the code the plan itself dictated).

Below the estimate, list the runtime the phases and validation commands depend on:

```
Runtime preconditions:
- docker daemon on this machine — check: `docker info >/dev/null`
- <db / external API / queue> — check: `<command that exits 0 when available>`
- new service on a guarded host: the harness deploy guard answers `ask`, not `deny`, for the deploy step — check: `<command that runs the guard against the deploy command and exits 0 on ask>`
```

One line per dependency, each with a check command that terminates and exits 0 when the dependency is available (a `grep` over a file is not a check: it cannot go red). A language runtime is pinned to the production version with `==`, citing where production sets it (Dockerfile, `.python-version`, runtime config); `>=` passes on a newer local runtime and proves nothing (2026-09-26: `sys.version_info >= (3, 13)` passed on 3.14, production ran 3.13 and crashed on deploy). Build Plan runs all of them before Build and stops if any is unmet (2026-09-10: a phase gate needed a live docker daemon that was never started, and the run finished with the fact buried in findings). `Runtime preconditions: none` is a valid answer.

## 8. Phases

Phases must be sequential, small, and verifiable.

For each phase:

- goal;
- scope;
- allowed files;
- forbidden changes;
- tasks;
- phase validation;
- verifier focus;
- exit criteria;
- `Estimated LOC net: ~N` (files and net lines) — the phase's own counterpart of the whole-plan estimate in section 7, counted the same way: source, tests and verbatim code. A whole-plan number with a per-phase breakdown in prose is not a phase estimate; the tracker import stops on a phase without its own line.

A phase estimated above ~400 LOC net is split at planning time, never left for review to catch. Copy the phase's estimate to its tracker card as an `estimate:` header so Build Plan's verifier can apply the 2× stop rule.

Every phase that changes files also carries one line `**Команда проверки**: `<command>`` — a single shell command, run from the worktree root with relative paths, that exits 0 only when the phase's behavior is in place. The runner executes it itself after the builder reports done and returns a red result to the builder before any model reviews the change (SOL-185: the builder reported green after weakening its own checks). The command runs the phase's tests or acceptance script; it is not a `grep` and not a text comparison with the change itself. Run-only phases may omit it.

A phase whose behavior is proven by new or changed tests — logic, parsing, a contract, a bug fix with a regression test — also names those test files: `**Тесты до реализации**: `<path>` `<path>``. The runner has another model write exactly these files before the build, requires the phase's check command to fail on them alone, and freezes them: the builder implements against tests it cannot edit. A red that comes only from the module the phase has yet to add (an import or collection error) shows nothing about the values the tests check, so after verify the runner has another model break each behaviour the phase text promises in a throwaway copy and runs the check on every break; breaks the tests miss go to the card. Write the phase's behaviours as checkable promises — a value, a condition, a state after the call — or there is nothing to break. List only test files, each inside the phase's allowlist; omit the line for glue, config, deploy and docs phases, where a test written ahead of the code would only restate it.

A phase that renames, removes or changes the meaning of something another module or repository reads — an API field or parameter, an enum value, an env var, a column, a GraphQL field, a CLI flag — carries a consumers table: the name, every place that reads it (`file:line`, sibling repositories included) and the search command that found them; an empty table shows that command and its output. A phase that adds a mutation taking an id also names the read that returns that id. (2026-09-21: a renamed contour value broke a sibling service with 422 after deploy; 2026-09-22: delete mutations took an id no read returned.)

Do not parallelize dependent phases.

A phase that adds a network, deploy or CI step names the timeout and the retry limit of every external call in its tasks (ssh, image pull, compose up, HTTP, job `timeout-minutes`). Missing limits are a plan defect, not something the build may add on its own: ops-review will demand them and scope-review will reject them as unplanned (2026-09-15: three failed verify rounds on a deploy phase for exactly this).

## 9. Plan Challenger

Launch a fresh read-only Plan Challenger. On Grok this is a `spawn_subagent` call in the same step as the Lean Challenger, not an inline reread. It hunts for correctness gaps:

- missing requirements;
- changes to `SOLUTION.md` contracts;
- decisions deferred to the builder;
- missing operation/state lifecycle;
- missing auth/safety/failure behavior;
- non-reproducible validation;
- incorrect commands;
- invalid fallback mechanisms;
- negative platform claims. Do not trust the author's search. Open the file that declares the symbol. An empty search is not evidence of absence;
- a validation whose expected result is derived from text the same change will write;
- a changed contract whose consumers table misses a reader — search the sibling repositories yourself;
- a runtime check that also passes on a runtime newer than production.

## 10. Lean Plan Challenger

Launch a fresh read-only Lean Challenger (on Grok with `spawn_subagent`). It hunts for overengineering:

- unnecessary files;
- unnecessary dependencies;
- generic abstractions with one current call site;
- persistent state that can be derived;
- future work;
- unrelated refactors;
- a validation harness larger than the feature;
- docs that do not define contract/usage/validation.

## 11. Correction

Fix the accepted findings. Reject unsupported findings with a reason. If a new design decision is discovered — `BLOCKED_FOR_SOLUTION_AMENDMENT`.

If any accepted finding was `BLOCKING`, run that challenger once more against the corrected plan. A `BLOCKING` finding on the second pass means the plan does not become `READY_FOR_BUILD`.

## 12. Readiness

Run `plan-readiness-gate.md`.

Only after PASS set `READY_FOR_BUILD`.

## 13. Finish

Report:

- the path to the created plan;
- the status;
- what was excluded as overengineering;
- which checks must pass before the commit.
