# Delegation

The coordinator is the sole author of `SOLUTION.md`.

## When to use subagents

- simple local task: 0;
- one complex flow: 1;
- several subsystems or an unfamiliar area: 2;
- high-risk architecture: up to 3.

No nested spawning. Do not delegate for the sake of process.

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
