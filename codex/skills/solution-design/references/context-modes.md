# Context modes

## Multiple requests

Combine changes into one `SOLUTION.md` only if they share a goal, a system area, a contract/data/release boundary, or a technical dependency.

If the changes are independent — do not create artificial architecture. Split them into workstreams or return `BLOCKED` with recommended separate invocations.

## Existing-system mode

Use when there is code that will be changed.

Must account for:

- current behavior;
- contracts/invariants;
- compatibility;
- existing verification;
- regression surface;
- simplicity baseline.

If `CURRENT_STATE.md` is absent, perform a focused discovery. Do not create `CURRENT_STATE.md` automatically.

If the baseline cannot be established — `BLOCKED` with a precise `codebase-analysis <focus>` request.

## Greenfield mode

Use when there is no production code yet.

Start from the requirements, platforms, constraints, data, security, budget, operational complexity, and team competencies.

Do not choose a technology "because it is popular". Tie every important decision to the design drivers and the minimality contract.

## Hybrid mode

Use when there is a skeleton/prototype/part of the system, or a new client for an existing backend.

The existing parts are constraints. The missing parts are greenfield.

## CURRENT_STATE.md

Statuses:

- `CURRENT` — relates to the task and the up-to-date code;
- `PARTIAL` — useful, but does not cover the entire affected scope;
- `STALE` — the relevant code changed after the analysis;
- `IRRELEVANT` — a different project/subsystem;
- `ABSENT` — no suitable document.

`CURRENT_STATE_COMPLETE` does not mean the document covers any new task. Check the declared scope and the user focus.
