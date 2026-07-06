# Solution

> Remove all hints and placeholder lines before finalizing. Do not invent sections for form's sake. Write the document in the user's language (the language of their request), not the language of this template — translate the section headings too. Do not translate code, symbols, APIs, commands, statuses, or paths.
>
> Sections without a marker are the mandatory core. Fill sections marked `[IF: …]` only when the condition holds — otherwise delete the section entirely, with no `not applicable` and no empty tables.

# Block 1. For the human

## 1. What needs to be done

In plain words:

- the problem / desired outcome;
- who or what benefits;
- what will observably change;
- what counts as success.

## 2. Short solution

Describe the chosen approach in 5–12 sentences. No implementation checklist.

## 3. What we are NOT doing

A short list of explicit non-goals. Especially: what might seem "useful" but is not part of this iteration.

## 4. Why this is not overengineering

- the minimal option:
- which existing patterns are reused:
- new dependencies/layers/state: `none` or an explicit justification:
- what is moved to future work:

## 5. Risks and checks

- Main risks:
- How to verify the result:
- What could block PlanF3:

**Status**: `READY_FOR_PLANF3` / `BLOCKED` / `BLOCKED_BY_SCOPE_OVERDESIGN`

---

# Block 2. For the agent

## 1. Design metadata

- **Working directory**:
- **Output path**:
- **Output Git scope**: `tracked` / `untracked` / `outside-git`
- **Pre-existing SOLUTION.md**:
- **Design mode**: `existing` / `greenfield` / `hybrid`
- **Task title**:
- **Analysis date**:
- **Relevant code roots**:
- **Relevant Git revisions**:
- **Initial working-tree state**:
- **Final working-tree state**:
- **CURRENT_STATE.md path**:
- **CURRENT_STATE status**:
- **Source documents**:
- **Applied solution lenses**:
- **Known analysis limitations**:
- **Changes attributable to this design run**:
- **Unexpected artifacts**:

## 2. Problem and desired outcome

Separate `REQUIREMENT`, `FACT`, `INFERENCE`, `ASSUMPTION`, `UNKNOWN`.

- Current problem / greenfield need:
- Desired observable outcome:
- Affected actors/users/systems:
- Success definition:

## 3. Requirements

| ID | Type | Requirement | Source | Priority | Acceptance condition |
|----|------|-------------|--------|----------|----------------------|

Type: `FUNCTIONAL`, `QUALITY`, `CONSTRAINT`, `NON_GOAL`.

## 4. Relevant current context

For existing/hybrid: only what is relevant to the task; do not copy the entire `CURRENT_STATE.md`.

- Current behavior:
- Affected components:
- Entry points:
- Control flow:
- Data/state flow:
- Existing contracts:
- Existing invariants:
- Existing verification:
- Unknowns:
- Evidence:

For greenfield: starting constraints, target platforms, available infrastructure, external systems.

## 5. Minimality contract

### 5.1 Smallest acceptable solution

Describe the smallest option that fulfills the must-have requirements.

### 5.2 Complexity budget

| Category | Budget | Exceeded? | Justification |
|----------|--------|-----------|---------------|
| New runtime dependencies | 0 by default | | |
| New persistent state/storage | 0 unless data is the feature | | |
| New subsystems/workers/schedulers | 0 unless directly required | | |
| New global abstractions | 0 unless reused now | | |
| Changed source files | minimal | | |
| Docs | contract/behavior/launch only | | |

### 5.3 Rejected overengineering

| Idea | Why tempting | Why rejected now | Future signal |
|------|--------------|------------------|---------------|

### 5.4 Future work parking lot

| Future idea | Why not now | Signal to revisit |
|-------------|-------------|-------------------|

## 6. Assumptions and unknowns

| ID | Type | Statement | Impact | Evidence or validation method | Blocking |
|----|------|-----------|--------|-------------------------------|----------|

Type: `ASSUMPTION`, `UNKNOWN`.

## 7. Design drivers [IF: there was a real choice between substantially different approaches]

| Driver | Priority | Related requirement | Effect on design |
|--------|----------|---------------------|------------------|

## 8. Alternatives considered [IF: non-trivial task]

The minimum is `Option 0: Minimal local extension / reuse existing pattern`.

### Option 0: <minimal approach>

- Summary:
- Requirements satisfied:
- Benefits:
- Costs:
- Risks:
- Reversibility:
- Selected/rejected because:

Add other options only when there is a real architectural choice.

## 9. Recommended solution

### 9.1 Summary

### 9.2 Architecture and responsibilities

### 9.3 End-to-end flow

### 9.4 Data and state

### 9.5 Contracts

### 9.6 Failure behavior

### 9.7 Relevant platform concerns [IF: a platform lens materially affects the solution]

Use only the relevant lenses: mobile/frontend/backend/game/CLI/library/data/infra/etc.

### 9.8 Compatibility, migration, rollout [IF: existing behavior, data, or the rollout process changes]

### 9.9 Security, privacy, safety [IF: the task touches user data, access, or safety]

### 9.10 Observability, operations, supportability [IF: there is a current observability/operations requirement]

Do not add an observability platform without a requirement.

## 10. Operation semantics [IF: there are state-changing operations: UI actions, API calls, jobs, commands, game actions, migrations]

| Operation | Actor | Preconditions | Postcondition | Repeat/retry/concurrency | Missing target | Authorization/safety |
|-----------|-------|---------------|---------------|--------------------------|----------------|----------------------|

## 11. State lifecycle [IF: persisted/derived/cache/UI/game/session state is added or changed]

| State/field | Source of truth | Created | Updated | Deleted | Related entity changes | Rollback/cleanup |
|-------------|-----------------|---------|---------|---------|------------------------|------------------|

## 12. Impact and boundaries

- In scope:
- Out of scope:
- Preserved behavior:
- Affected subsystems:
- External integrations:
- Explicit exclusions:

Do not create a file-by-file edit checklist.

## 13. Decision log [IF: there were decisions with real alternatives; otherwise the solution is fully described in §9]

| ID | Decision | Drivers | Evidence | Consequences | Reversal strategy |
|----|----------|---------|----------|--------------|-------------------|

## 14. Risks and mitigations

| ID | Risk | Likelihood | Impact | Mitigation | Verification |
|----|------|------------|--------|------------|--------------|

No confidence percentages.

## 15. Validation strategy

| Requirement | Design response | Verification type | Observable pass condition |
|-------------|-----------------|-------------------|---------------------------|

Do not write just "run tests". State the observable result.

## 16. Challenger results [IF: challengers were run]

### Design Challenger

- Findings:
- Accepted corrections:
- Rejected findings with reason:

### Lean Challenger

- Overengineering findings:
- Removed/simplified items:
- Accepted complexity with justification:

## 17. PlanF3 handoff

- Authoritative requirements:
- Selected architecture:
- Fixed contracts:
- Fixed behavioral semantics:
- Minimality constraints:
- Implementation boundaries:
- Ordering constraints:
- Acceptance criteria:
- Explicit exclusions:
- Non-blocking assumptions:
- Blocking unknowns:

PlanF3 must not choose the architecture, public behavior, source of truth, auth policy, migration semantics, or future scope.

## 18. Readiness

The status is exactly one of:

- `READY_FOR_PLANF3`
- `BLOCKED`
- `BLOCKED_BY_SCOPE_OVERDESIGN`

`READY_FOR_PLANF3` is allowed only if the requirements are verifiable, the current state is established, the high-impact unknowns are closed or explicitly accepted, the chosen solution is minimally sufficient, the contracts/failure behavior/validation are described, and no future work has slipped into the current scope.
