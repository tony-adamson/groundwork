# Delegation

The coordinator is the sole author of `SOLUTION.md`.

## When to use subagents

- simple local task: 0;
- one complex flow: 1;
- several subsystems or an unfamiliar area: 2;
- high-risk architecture: up to 3.

No nested spawning. Do not delegate for the sake of process.

## Model tiers

If the harness supports per-subagent model selection, route by role:

- **Fact-gathering roles** (Context Explorer, Domain/Docs Researcher) — a fast/cheap tier is sufficient: they return facts with evidence, and the coordinator re-verifies material claims anyway.
- **Judgment roles** (Design Challenger, Lean Challenger, the coordinator itself) — the top tier. Generation and recon may be delegated down; judgment and acceptance may not.

The tier-to-model mapping is harness configuration (agent definitions, rules files), not part of this skill. If the harness cannot set a per-agent model, run every role on the session model. If the cheap tier returns unusable results for a class of tasks twice in a row, move that class up a tier and record it in the harness rules.

## Roles

### Context Explorer

Finds the current flow, contracts, invariants, tests, regression surface.

### Domain/Docs Researcher

Finds official/version-specific docs, platform constraints, protocol guarantees.

### Design Challenger

Fresh read-only context. Hunts for correctness gaps:

- missing requirements;
- unsupported assumptions;
- ambiguous contracts;
- state lifecycle gaps;
- auth/security gaps;
- missing validation;
- decisions deferred to PlanF3.

### Lean Challenger

Fresh read-only context. Hunts for overengineering:

- unnecessary dependency;
- new subsystem for a local feature;
- abstraction with one call site;
- persistent state that can be derived;
- future work in the current scope;
- unrelated refactor;
- a validation harness larger than the feature;
- docs that do not define a contract.

## Finding format

- section;
- issue;
- violated requirement/contract/minimality rule;
- concrete failure or maintenance cost;
- simpler alternative;
- severity: `BLOCKING`, `NON_BLOCKING`;
- required correction.

`APPROVE` is acceptable.
