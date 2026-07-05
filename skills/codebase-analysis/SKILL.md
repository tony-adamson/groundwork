---
name: codebase-analysis
description: "Creates CURRENT_STATE.md: an evidence-backed description of the current state of the repository. Use only when the user explicitly asks to run codebase-analysis. Does not design a solution, write code, or produce an implementation plan."
disable-model-invocation: true
---

# Codebase Analysis → CURRENT_STATE.md

The skill creates or fully rewrites `CURRENT_STATE.md` in the directory returned by `pwd`.

The skill's job is to describe **how the system works right now**. Do not propose a future solution, refactoring, migration, new architecture, or an implementation plan.

The resulting file always consists of two blocks:

1. **Block 1. For the human** — a short, readable summary without overload.
2. **Block 2. For the agent** — a detailed evidence-backed snapshot for `solution-design`, `planf3`, and review.

## Hard boundaries

You may modify only `CURRENT_STATE.md` and the permitted artifacts of the auxiliary graph, if they are produced by the standard tool.

Forbidden:

- modifying source code, tests, configs, schemas, dependencies, or project documentation;
- creating `SOLUTION.md`;
- designing a future change;
- automatically launching `solution-design` or `planf3`;
- commits, pushes, deploys, migrations, cloud write commands;
- turning the analysis into a full-repository audit when the user gave a narrow focus.

## Launch contract

1. Run `pwd` and treat it as the `analysis root`.
2. Determine the Git root, branch, revision, and the initial working tree state. If `pwd` is not the Git root — record that honestly.
3. Read local instructions: `AGENTS.md`, `CLAUDE.md`, README, CONTRIBUTING, architecture documents, build/test/release docs.
4. Find the relevant manifests, schemas, package roots, and code roots.
5. If the user gave a focus — analyze deeply only the related area. If there is no focus — produce a bounded overview, not a file-by-file encyclopedia.
6. Find an existing `graphify` graph. Use it only as a navigation index. Verify every material conclusion against live code, tests, configs, and schemas.
7. At the end, compare the final working tree with the initial baseline and explicitly separate pre-existing changes from the newly created `CURRENT_STATE.md`.

## Context management

Use read-only subagents adaptively:

- small local area: 0–1;
- several subsystems: 2–3;
- large monorepo: up to 4.

No nested spawning. Each subagent returns only facts, inference, unknowns, evidence, and analysis limitations. Only the coordinator writes the final document.

If the harness does not provide an isolated-subagent tool (for example, Pi) — perform these roles inline as separate passes: a pass outputs only findings in the role's format, then the coordinator continues. Do not simulate spawning subagents and do not claim they were launched.

## Minimality and overengineering protection

Even an analysis of the current state must help future agents **avoid building unnecessary architecture**.

Always record:

- existing simple extension points;
- local patterns worth reusing;
- dependencies and abstractions the project currently does not have;
- places where the project deliberately lives without a global state/service/framework layer;
- complexity constraints that future changes must respect.

Do not call the absence of a framework or layer a problem. Describe it as a fact or a deliberate current style, if the code confirms it.

## What to read

- [analysis-workflow.md](references/analysis-workflow.md) — the order of analysis.
- [evidence-policy.md](references/evidence-policy.md) — evidence rules.
- [repository-lenses.md](references/repository-lenses.md) — universal lenses for mobile/frontend/backend/game/CLI/library/etc.
- [delegation-policy.md](references/delegation-policy.md) — subagents and context limits.
- [CURRENT_STATE.template.md](references/CURRENT_STATE.template.md) — the mandatory structure of the result.

## Completion criteria

`CURRENT_STATE.md` is done only if:

- there is a short human block;
- the agent block contains the evidence-backed current state;
- `FACT`, `INFERENCE`, `UNKNOWN` are explicitly separated;
- contracts, invariants, verification, and unknowns are recorded;
- the simplicity baseline is recorded;
- no future solution is proposed;
- the final working tree has been checked;
- the status is exactly one of: `CURRENT_STATE_COMPLETE` or `CURRENT_STATE_PARTIAL`.
