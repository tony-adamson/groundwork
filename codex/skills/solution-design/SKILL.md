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
5. Find `GRILL.md` and check its status (see "Decisions come from the interview").
6. Determine the mode: `existing`, `greenfield`, `hybrid`.
7. Determine whether this is one coherent change set or independent workstreams.

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

## Decisions come from the interview

`SOLUTION.md` is a synthesis of decisions the user already made in `$grill`, not a place where new ones get made. `ВОПРОС-N` below stands for the question code `GRILL.md` uses, in whatever language the interview ran.

- Read `GRILL.md` in full before drafting. If it is absent or its status is not `CONFIRMED`, stop with `BLOCKED` and name `$grill` as the next step. The only exception is the user explicitly saying to proceed without an interview; quote their words in the `Interview` field of the metadata block.
- Every requirement's `Source` is the task text or a `GRILL.md` entry (`ВОПРОС-N`). Every decision names the requirement or `ВОПРОС-N` that forces it. A decision with neither is the model's guess: remove it or put it to the user.
- A decision the design needs that `GRILL.md` does not hold goes to the user as a question in the `$grill` format and is appended to `GRILL.md` with the verbatim answer. It never becomes an assumption.
- Assumptions are only for facts that cannot be checked now, each with how it will be verified. Points left open in a `STOPPED` interview are unknowns.
- If the design surprises the user, the interview was too shallow: go back to `$grill` rather than defend the draft.

## Reference system

If the requirements name a reference system ("build it like X"), its conventions are the baseline and the design is a list of deviations from it.

- Before drafting, open the reference's code for every surface the design touches — data schema, naming, units, directory layout, stack, API shape — and record each convention with `file:line`.
- Every deviation is a `DECISION` whose reason is a requirement ID. "Cleaner" or "best practice" is not a reason.
- A rule that forbids borrowing from the reference carries the verbatim words of the person who set it, and the date. When the requirements change, re-check every such rule against the new words.
- Where the approver asks for more than the reference does, the approver wins and the difference is recorded.

## Delegation

Use subagents only when they add value:

- context explorer;
- domain/doc researcher;
- design challenger;
- lean challenger;
- reference challenger;
- schema challenger.

For a non-trivial solution, these are mandatory:

1. a fresh Design Challenger — hunts for correctness/contract gaps;
2. a Lean Challenger — hunts for overengineering/scope creep;
3. a Reference Challenger, if a reference system is named — hunts for deviations from the reference that the draft does not list;
4. a Schema Challenger, if the design adds or changes a persistent schema — goes column by column: what forces each one, what is stored twice.

If the harness can run a model from another vendor, the Design Challenger runs on it as well, as a second independent pass. Two models agreeing is still not evidence.

All of them work read-only. Only the coordinator writes the final `SOLUTION.md`.

On Grok every mandatory challenger is a real `spawn_subagent` call, all launched together, before the status moves; a challenger that was not spawned must not be reported as run. Each prompt contains the role text from `references/delegation-policy.md`, the absolute path of this `SKILL.md`, the draft `SOLUTION.md` path, and the rule that the child returns findings only. Do not pass `model` unless the user named one of `grok-4.5`, `grok-4.6`, `grok-4.7`, `grok-4.7-build-fast`.

If the harness does not provide an isolated-subagent tool (for example, Pi) — run the challengers inline: one separate pass per mandatory challenger, each outputting only findings in the delegation-policy format, then the coordinator responds. Do not simulate spawning subagents and do not claim they were launched.

The coordinator applies accepted findings. If an accepted finding was `BLOCKING`, run that challenger once more against the corrected draft. A `BLOCKING` finding on the second pass stops the skill with `BLOCKED`.

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
