# Plan Readiness Gate

Runs before `READY_FOR_BUILD`.

## 1. Traceability gate

Every material requirement/decision from `SOLUTION.md` must have:

- one or more tasks;
- a validation step;
- an observable pass condition.

A requirement must not exist only in prose.

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
