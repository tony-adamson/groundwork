# Delegation

The coordinator is the sole author of `SOLUTION.md`.

## When to use subagents

- simple local task: 0;
- one complex flow: 1;
- several subsystems or an unfamiliar area: 2;
- high-risk architecture: up to 3.

The mandatory challengers are not counted in these numbers.

No nested spawning. Do not delegate for the sake of process.

## Model tiers

If the harness supports per-subagent model selection, route by role:

- **Fact-gathering roles** (Context Explorer, Domain/Docs Researcher) — a fast/cheap tier is sufficient: they return facts with evidence, and the coordinator re-verifies material claims anyway.
- **Judgment roles** (Design Challenger, Lean Challenger, Reference Challenger, Schema Challenger, the coordinator itself) — the top tier. Generation and recon may be delegated down; judgment and acceptance may not.
- **Second vendor** — if the harness can run a model from another vendor, the Design Challenger runs twice: on the top tier and on that model, with the same role text. Neither pass sees the other's findings; the coordinator merges them. Which agent or command reaches the other vendor is harness configuration.

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
- negative platform claims. Do not trust the author's search. Open the file that declares the symbol. An empty search is not evidence of absence.

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

### Reference Challenger

Fresh read-only context. Gets the draft and the paths of the reference system. Opens the reference's code itself and does not trust the draft's conventions table. Hunts for:

- a convention of the reference that the draft breaks without listing the deviation: key types, naming, units and suffixes, flags, directory layout, where data is copied and where it is derived;
- a deviation whose reason is not a requirement ID;
- a rule that forbids borrowing from the reference and has no quoted source, or whose source was later overridden;
- a table, field or state that neither the reference nor a requirement asks for;
- a row of the conventions table without `file:line`.

### Schema Challenger

Fresh read-only context. Runs when the design adds or changes a persistent schema. Gets the draft, the paths of the reference system or of the existing schema, and the schema review rules of the repository or the harness, if there are any. Goes column by column, not table by table. For every table, column, key, index and constraint, hunts for:

- no current requirement ID forces it to exist: it is kept for a later feature, for a query nobody asked for, or just in case;
- the same fact stored twice: copied from another table, or computable from rows already stored;
- a name, type, unit, key or nullability that differs from the closest column in the reference or the existing schema (`file:line`), with no requirement ID for the difference;
- a status or an identifier of an external system that the flows read but the schema does not store, or that the schema stores but the external system does not have;
- a local schema review rule that a table breaks.

A common practice is not a reason. The challenger does not propose a new table, column, index or constraint unless it names the requirement ID that forces it.

Returns one row per column — the requirement ID that forces it, where else the fact lives, the closest reference column with `file:line` — and then the findings. A row that shows a difference or a second copy is a finding, not a note in the table.

## Finding format

- section;
- issue;
- violated requirement/contract/minimality rule;
- concrete failure or maintenance cost;
- simpler alternative;
- severity: `BLOCKING`, `NON_BLOCKING`;
- required correction.

`APPROVE` is acceptable.
