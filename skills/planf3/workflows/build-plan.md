# Build Plan

Execute only a plan with the `READY_FOR_BUILD` status.

Task markers: `[]` idle · `[wip]` in progress · `[x]` complete · `[f]` failed.

## 0. Readiness

1. Find the plan from the request.
2. Refuse to build if the status is not `READY_FOR_BUILD`.
3. Read `SOLUTION.md`, `CURRENT_STATE.md`, the local instructions, and the entire plan agent block.
4. Record the branch, revision, initial git status, tracked/untracked changes.
5. Do not touch other people's changes.
6. Set `BUILD_IN_PROGRESS` only after these checks.

## 1. Minimal diff execution

Implement the smallest diff that fulfills the plan.

Forbidden without going back to `solution-design`:

- adding a dependency;
- adding persistent state;
- adding a subsystem/framework/worker/scheduler;
- changing a public contract;
- expanding the scope;
- doing an unrelated refactor;
- implementing Future Work.

If the plan looks overbuilt — stop with `SCOPE_OVERDESIGN`.

## 2. Phased execution

For each phase:

1. Re-read the related requirements and constraints.
2. Implement only the phase's scope.
3. Run the phase validation.
4. Check the phase diff.
5. For a non-trivial phase, run a fresh read-only verifier.
6. Fix only confirmed blocking findings.
7. Mark the phase `[x]` only after validation + verifier approval.

Do not run dependent phases in parallel.

## 3. Subagents

Use adaptively:

- small project: usually 0–1 implementers;
- a verifier is mandatory for risky phases;
- nested spawning is forbidden.

The implementer receives a specific phase, allowed files, forbidden changes, validation commands, and the expected result.

The verifier works read-only and checks only the correctness/scope/minimality of the current phase.

## 4. Repair loops

Do not run an endless fix/test loop.

- 2 attempts per phase problem;
- after a repeated failure — `[f]` and `BUILD_FAILED`, or `BLOCKED` with a reason.

If the cause requires a design decision — `BLOCKED_FOR_SOLUTION_AMENDMENT`.

## 5. Stop conditions

Stop if:

- a new architecture/public behavior/source-of-truth decision is needed;
- the plan contradicts `SOLUTION.md` or the current code;
- a required capability is unavailable;
- validation cannot be made deterministic;
- a destructive/external/production action is needed;
- the implementation would touch unrelated user changes;
- the minimality budget is violated without approval;
- the actual diff exceeded the plan's `Estimated LOC net` or files-to-change budget by 2× — stop, show `git diff --stat`, explain the reason, and wait for a decision.

## 6. Final validation

1. Run all global validation commands.
2. Match every material requirement to implementation evidence and a pass condition.
3. Check the tracked/untracked diff.
4. Make sure the excluded areas did not change.
5. Run a final read-only review: `/code-review` in Claude Code, ponytail in Pi; if unavailable — a separate inline pass that outputs only findings.
6. If the diff looks bloated — shrink it: `/simplify` in Claude Code; otherwise a separate reuse/simplification pass that applies the fixes.

## 7. Final report

In the user's language:

- the final status;
- `git diff --stat` (tracked + untracked);
- a comparison of the actual diff with the plan's `Estimated LOC net` and files-to-change budget;
- which requirements are fulfilled;
- validation commands + results (honestly: if something failed — show the output; if something was skipped — say so);
- verifier/reviewer findings;
- removed/rejected overengineering;
- **"What to check in review"**: 3–5 concrete risks and how to check them by hand;
- remaining risks/blockers;
- confirmation that no production/destructive actions were performed.
