---
name: planf3
description: "Creates or executes a minimal Markdown implementation plan based on SOLUTION.md or an explicit request. Use only when the user explicitly asks: planning or Build Plan. No presentation artifacts and no future-proof architecture."
argument-hint: "[path to plan or task description] [questionable]"
disable-model-invocation: true
---

# PlanF3 → minimal implementation plan

PlanF3 works in two modes:

1. **Create Plan** — create `specs/<descriptive-name>-implementation-plan.md`.
2. **Build Plan** — execute an already-approved plan with the `READY_FOR_BUILD` status.

The plan is always Markdown-first. Do not create presentation or visual artifacts. If a diagram is needed — use short text, or Mermaid only when it genuinely helps.

## Primary goal

PlanF3 does not search for "the best architecture". It compiles the approved `SOLUTION.md` into the **smallest executable plan** that implements the requirements, preserves the contracts, and has reproducible checks.

If `SOLUTION.md` exists, it outranks the plan. Do not reinvent the architecture.

## Output file

Defaults:

- `PLAN_OUTPUT_DIRECTORY`: `specs/`
- `PLAN_FILE`: `specs/<descriptive-kebab-name>-implementation-plan.md`

The plan is two-block:

1. **Block 1. For the human** — a short readable summary.
2. **Block 2. For the agent** — a detailed execution contract.

## Statuses

- `DRAFT`
- `BLOCKED_FOR_SOLUTION_AMENDMENT`
- `BLOCKED_BY_SCOPE_OVERDESIGN`
- `READY_FOR_BUILD`
- `BUILD_IN_PROGRESS`
- `BUILD_COMPLETE`
- `BUILD_FAILED`

## Minimal Diff Compiler Mode

When `SOLUTION.md` exists:

- do not improve the architecture;
- do not add future-proofing;
- do not add a dependency/subsystem/state/abstraction outside `SOLUTION.md`;
- do not expand the scope;
- do not turn a local feature into a platform;
- do not add more docs/tests than needed to prove the behavior;
- if the plan needs a new architectural decision — `BLOCKED_FOR_SOLUTION_AMENDMENT`.

## Modes

If the request contains a path to an existing plan and asks to implement it — read [build-plan.md](workflows/build-plan.md).

If the request asks to create a plan from `SOLUTION.md` or a task — read [create-plan.md](workflows/create-plan.md).

If the request asks to update a plan — read [update-plan.md](workflows/update-plan.md).

If the request asks to update references between plans — read [update-references.md](workflows/update-references.md).

Before `READY_FOR_BUILD`, always run [plan-readiness-gate.md](workflows/plan-readiness-gate.md).

## Mandatory gates before READY_FOR_BUILD

- correctness gate PASS;
- executable validation gate PASS;
- minimality gate PASS;
- no architecture decision deferred to the builder;
- no speculative architecture beyond `SOLUTION.md`;
- no material requirement existing only in prose;
- no validation based only on static text when behavior can be checked.

## Build Plan

During implementation:

- execute the phases sequentially;
- make the minimal diff;
- use subagents adaptively;
- after non-trivial phases, run a fresh read-only verifier;
- fix only confirmed blocking findings;
- stop on a new design decision, scope overdesign, or an unsafe action.

## Harness adaptation

If the harness does not provide an isolated-subagent tool (for example, Pi) — perform the implementer/verifier/challenger roles inline as separate passes: the verifier pass outputs only findings, and the coordinator responds. Do not simulate spawning subagents and do not claim they were launched.

## Language

Write plans and reports in the user's language. Do not translate file names, commands, APIs, symbols, or code identifiers.
