---
name: solution-design
description: "Use when explicitly asked for $solution-design to create SOLUTION.md for one concrete software change before implementation planning. Produces a minimal evidence-based design; does not write code or create an implementation plan."
---

# Solution Design → SOLUTION.md

The skill creates or fully rewrites `SOLUTION.md` in the directory returned by `pwd`.

`SOLUTION.md` answers the questions: **what to change, why this way, which contracts must survive, what is out of scope, how to prove correctness**.

It does not answer "which files to change, step by step" — that is `$planf3`'s job.

The resulting file is always two-block:

1. **Block 1. For the human** — a short, readable summary without architectural overload.
2. **Block 2. For the agent** — the complete contract for planning and implementation.

## Hard boundaries

You may modify only `SOLUTION.md`.

Forbidden:

- writing code;
- modifying tests, configs, schemas, dependencies;
- creating implementation phases or a file-by-file checklist;
- automatically launching `$codebase-analysis` or `$planf3`;
- overwriting `CURRENT_STATE.md`;
- adding future-proofing to the chosen solution;
- turning a local task into a subsystem/platform/framework.

## Launch contract

The skill requires a concrete task: a feature, a bug fix, a refactoring goal, a migration, a product change, a greenfield system.

If there is no goal — do not create a general architecture document. Ask for the task.

At the start:

1. Run `pwd`.
2. Find the Git roots and the initial working tree status.
3. Read the local instructions and the relevant docs/manifests.
4. Find and classify `CURRENT_STATE.md`: `CURRENT`, `PARTIAL`, `STALE`, `IRRELEVANT`, `ABSENT`.
5. Determine the mode: `existing`, `greenfield`, `hybrid`.
6. Determine whether this is one coherent change set or independent workstreams.

## Primary objective function

Not "the most correct architecture", but the **minimal sufficient solution**.

A solution is better if it:

- fulfills the observable requirements;
- preserves the existing contracts;
- uses the project's current patterns;
- adds fewer files, dependencies, layers, and state;
- is easier to review, test, and delete;
- explicitly moves future work outside the current task.

If the correct solution looks overbuilt, the status must be `BLOCKED_BY_SCOPE_OVERDESIGN`, not `READY_FOR_PLANF3`.

## Mandatory minimality

`SOLUTION.md` must contain:

- the smallest acceptable option;
- explicit non-goals;
- rejected overengineering;
- a complexity budget;
- a future work parking lot;
- a justification for every new dependency/subsystem/persistent state/abstraction, if any are needed.

## Delegation

Use subagents only when they add value:

- context explorer;
- domain/doc researcher;
- design challenger;
- lean challenger.

For a non-trivial solution, these are mandatory:

1. a fresh Design Challenger — hunts for correctness/contract gaps;
2. a Lean Challenger — hunts for overengineering/scope creep.

Both work read-only. Only the coordinator writes the final `SOLUTION.md`.

If the harness does not provide an isolated-subagent tool (for example, Pi) — run the challengers inline: two separate passes, each outputting only findings in the delegation-policy format, then the coordinator responds. Do not simulate spawning subagents and do not claim they were launched.

## What to read

- [context-modes.md](references/context-modes.md)
- [design-workflow.md](references/design-workflow.md)
- [design-readiness-gate.md](references/design-readiness-gate.md)
- [evidence-policy.md](references/evidence-policy.md)
- [solution-lenses.md](references/solution-lenses.md)
- [delegation-policy.md](references/delegation-policy.md)
- [SOLUTION.template.md](references/SOLUTION.template.md)

## Language

Write `SOLUTION.md` and all reports in the user's language — the language of the user's request and conversation, **not** the language of these instructions. If the request is in Russian, the artifact is in Russian. Do not translate file names, symbols, commands, statuses, or APIs.

## Completion criteria

`SOLUTION.md` is done only if:

- there is a short human block;
- the agent block contains verifiable requirements, contracts, decisions, risks, validation;
- the minimal sufficient approach is chosen;
- the non-goals and rejected overengineering are explicit;
- every material requirement has observable verification;
- PlanF3 will not have to reinvent the architecture;
- the final status is exactly one of: `READY_FOR_PLANF3`, `BLOCKED`, `BLOCKED_BY_SCOPE_OVERDESIGN`.
