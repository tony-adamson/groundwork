# Solution-design order

## 0. Start and scope

1. Run `pwd`.
2. Determine the output path for `SOLUTION.md`.
3. Record the Git roots and the initial status.
4. Read the instructions and the relevant docs/manifests.
5. Determine the mode: existing/greenfield/hybrid.
6. Find and classify `CURRENT_STATE.md`.
7. Determine the coherent change set.

## 1. Normalize the requirements

Extract:

- `REQ-*` — functional requirements;
- `NFR-*` — quality requirements;
- `CON-*` — constraints;
- `NG-*` — non-goals;
- `ASM-*` — assumptions;
- `UNK-*` — unknowns.

Do not turn a model's guess into a user requirement.

## 2. Establish the current context

For existing/hybrid, verify the critical claims against live code, even if `CURRENT_STATE.md` exists.

If the baseline is insufficient for a safe solution — `BLOCKED`, and suggest a focused `codebase-analysis`.

## 3. Formulate the minimality contract

Before choosing a solution, fill in:

- the smallest acceptable solution;
- the complexity budget;
- explicit non-goals;
- rejected overengineering;
- the future work parking lot.

## 4. Determine the design drivers

Only the relevant ones: correctness, simplicity, compatibility, reversibility, UX, performance, offline, latency, security, cost, delivery time, team familiarity, platform constraints.

## 5. Consider alternatives

For a non-trivial task, start with `Option 0: minimal local extension / reuse existing pattern`.

Add other options only when there is a real architectural choice.

## 6. Choose the recommended solution

Describe the architecture precisely enough that PlanF3 does not reinvent it.

Do not include a file-by-file checklist, implementation phases, commits, task assignment.

## 7. Close the operation/state semantics

For the applicable operations and state, fill in the Operation Semantics and State Lifecycle tables.

## 8. Define the validation strategy

Every material requirement must have a verification type and an observable pass condition.

## 9. Fresh challenge

For a non-trivial task, launch:

1. the Design Challenger;
2. the Lean Challenger.

Accept only findings with a concrete requirement/contract/failure/cost/evidence.

## 10. Fix the draft

Apply the accepted corrections. Reject unsupported findings with a reason.

## 11. Readiness gate

Run `design-readiness-gate.md`. Only after PASS set `READY_FOR_PLANF3`.

## 12. Finish

1. Write the two-block `SOLUTION.md`.
2. Record the final working tree status.
3. State the status.
