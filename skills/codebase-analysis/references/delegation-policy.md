# Delegation

The main agent is the coordinator. It writes the final `CURRENT_STATE.md` and is responsible for the quality of the evidence.

## When to use subagents

- Small local scope: 0–1 subagents.
- Several related parts: 2–3 subagents.
- Large monorepo: up to 4 subagents.

Do not launch subagents for the sake of process. No nested spawning.

## How to assign tasks

Give each subagent a narrow read-only area:

- a specific flow;
- a specific module/package;
- state/data flow;
- tests/verification;
- a platform-specific lens;
- the dependency/config surface.

Do not hand each one the whole repository and the whole graph.

## Subagent response format

The subagent returns, compactly:

1. Scope.
2. Files/symbols examined.
3. `FACT`.
4. `INFERENCE`.
5. `UNKNOWN`.
6. Contracts/invariants.
7. Evidence.
8. Simplicity observations.
9. Analysis limitations.

Guideline: up to 40 material findings or up to 1200 words.

## Subagent prohibitions

A subagent must not:

- modify files;
- create `CURRENT_STATE.md`;
- propose a solution;
- produce an implementation plan;
- return large chunks of source code or logs;
- explore another subagent's area.

The coordinator must re-verify important statements before including them in the final document.
