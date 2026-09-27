# Plan Readiness Gate

Runs before `READY_FOR_BUILD`.

## 1. Traceability gate

Every material requirement/decision from `SOLUTION.md` must have:

- one or more tasks;
- a validation step;
- an observable pass condition.

A requirement must not exist only in prose.

Run `python3 <this skill's directory>/scripts/check-citations.py <plan path>` from the repository root, and again on `SOLUTION.md` when the plan came from one. `FAIL` on a non-zero exit: a `file:line` citation names a file that does not exist or a line past its end. Fix the citation from the live code; do not delete it to make the check pass.

## 2. Design boundary gate

The plan must not introduce or choose:

- a new architecture;
- public behavior;
- an auth policy;
- a source of truth;
- persistence semantics;
- migration semantics;
- lifecycle rules;
- fallback contracts.

If that is needed — `BLOCKED_FOR_SOLUTION_AMENDMENT`.

## 3. Minimality gate

Check that the plan:

- implements the smallest sufficient diff;
- does not add a dependency/subsystem/state/abstraction outside `SOLUTION.md`;
- does not implement future work;
- does not refactor unrelated code;
- has a files-to-change budget and an `Estimated LOC net`;
- has a `Runtime preconditions` block (or `none`), each entry with a check command;
- does not build a platform for a local task;
- includes the rejected overengineering.

If correct but overbuilt — `BLOCKED_BY_SCOPE_OVERDESIGN`.

## 4. Operation semantics gate

For every material operation/action/job/command/game action, the following are defined:

- inputs;
- preconditions;
- postcondition;
- repeat/retry/concurrency;
- missing-target behavior;
- partial failure;
- auth/safety;
- observable result.

## 5. State lifecycle gate

For new/changed state/storage/cache/relationship/snapshot/artifact, the following are defined:

- creation;
- update;
- deletion;
- owner changes;
- rollback/cleanup;
- source of truth.

## 6. Executable validation gate

Every behavioral validation has:

- setup;
- a command;
- an assertion;
- cleanup;
- an expected exit status.

A long-running interactive command is not an acceptance command.

`FAIL` if a behavioral pass condition only checks text produced by the same change (a SQL string, a function body, an `ORDER BY` the author wrote). The expectation has to name an observable outcome on separately stated inputs, such as expected ids. A column-name `LIMIT 0` and a repeated page may stay, and they do not replace that outcome check.

`FAIL` if the plan states that a platform capability is absent or impossible without a `file:line` citation of the declaring artifact or a command output that fails when the claim is wrong. An empty search is not that citation.

## 7. Command sanity gate

Check the commands:

- they terminate;
- they use correct paths/quoting;
- they have correct exit code semantics;
- they do not produce false positives/false negatives;
- they account for tracked and untracked files;
- they perform no destructive/external side effects.

## 8. Scope gate

Every planned file has a reason. Every task maps to `SOLUTION.md` or validation. The excluded areas stay excluded.

## 9. Result

Internal result:

- `PASS`
- `FAIL: <failed gates>`

`READY_FOR_BUILD` is allowed only after `PASS`.
