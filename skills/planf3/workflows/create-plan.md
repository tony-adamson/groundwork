# Create Plan

Pipeline:

```text
SOLUTION.md or USER_PROMPT
→ draft implementation plan
→ Plan Challenger
→ Lean Plan Challenger
→ corrections
→ Plan Readiness Gate
→ READY_FOR_BUILD
```

## 1. Determine the source

1. If there is a `SOLUTION.md` with the `READY_FOR_PLANF3` status, use it as the architectural contract.
2. If `SOLUTION.md` is absent, a plan may be created only for a local low-risk task. For an architectural task, return `BLOCKED` and ask for `solution-design`.
3. If `SOLUTION.md` has `BLOCKED` or `BLOCKED_BY_SCOPE_OVERDESIGN` — do not plan.
4. Read `CURRENT_STATE.md` if it is relevant.
5. Read the local instructions: `AGENTS.md`, `CLAUDE.md`, README, build/test docs.

## 2. Fix the boundaries

The plan must explicitly contain:

- authoritative requirements;
- what we are building;
- what we are not building;
- the complexity budget;
- the files-to-change budget;
- the estimated LOC net for the whole plan;
- validation commands;
- stop conditions.

## 3. Create the draft Markdown plan

File: `specs/<descriptive-kebab-name>-implementation-plan.md`.

Mandatory structure:

```md
# Implementation plan: <title>

# Block 1. For the human

## 1. In short
## 2. What will be done
## 3. What we are not doing
## 4. Risks
## 5. How to verify
## 6. Readiness

---

# Block 2. For the agent

## 1. Metadata
## 2. Source priority
## 3. Authoritative requirements
## 4. Minimality contract
## 5. Files to change budget
## 6. Requirement traceability
## 7. Operation semantics
## 8. State lifecycle
## 9. Implementation phases
## 10. Validation commands
## 11. Stop conditions
## 12. Verifier/review policy
## 13. Final report format
## 14. Amendments
```

## 4. Human block

Short, without overload:

- the goal;
- the minimal approach;
- the main files/areas;
- explicit non-goals;
- the main risks;
- one command or a list of commands for the final check;
- the status.

No more than 1–2 screens of text.

## 5. Agent block

Must be sufficient for an autonomous Build Plan:

- source priority;
- `SOLUTION.md` decisions;
- plan status;
- phase statuses: `[]`, `[wip]`, `[x]`, `[f]`;
- allowed and forbidden areas;
- exact validation commands;
- observable pass conditions;
- stop conditions;
- verifier policy;
- final review requirements.

## 6. Minimality contract

Mandatory:

| Category | Budget | Exceeded? | Justification |
|----------|--------|-----------|---------------|
| New dependencies | 0 by default | | |
| New persistent state | 0 unless required | | |
| New subsystems/workers/schedulers | 0 unless required | | |
| New global abstractions | 0 unless reused now | | |
| New docs | only contract/usage/validation | | |

If the plan exceeds the budget without a proven current requirement — fix it or set `BLOCKED_BY_SCOPE_OVERDESIGN`.

## 7. Files to change budget

| File / directory | Existing/New | Why required | Requirement | Can be avoided? |
|------------------|--------------|--------------|-------------|-----------------|

Every new file must have a reason. If it can be done locally without a new layer — prefer locally.

Below the table, state the total estimate: `Estimated LOC net: ~N`. It is used by the 2× stop rule during Build Plan.

## 8. Phases

Phases must be sequential, small, and verifiable.

For each phase:

- goal;
- scope;
- allowed files;
- forbidden changes;
- tasks;
- phase validation;
- verifier focus;
- exit criteria.

Do not parallelize dependent phases.

## 9. Plan Challenger

Launch a fresh read-only Plan Challenger. It hunts for correctness gaps:

- missing requirements;
- changes to `SOLUTION.md` contracts;
- decisions deferred to the builder;
- missing operation/state lifecycle;
- missing auth/safety/failure behavior;
- non-reproducible validation;
- incorrect commands;
- invalid fallback mechanisms.

## 10. Lean Plan Challenger

Launch a fresh read-only Lean Challenger. It hunts for overengineering:

- unnecessary files;
- unnecessary dependencies;
- generic abstractions with one current call site;
- persistent state that can be derived;
- future work;
- unrelated refactors;
- a validation harness larger than the feature;
- docs that do not define contract/usage/validation.

## 11. Correction

Fix the accepted findings. Reject unsupported findings with a reason. If a new design decision is discovered — `BLOCKED_FOR_SOLUTION_AMENDMENT`.

## 12. Readiness

Run `plan-readiness-gate.md`.

Only after PASS set `READY_FOR_BUILD`.

## 13. Finish

Report:

- the path to the created plan;
- the status;
- what was excluded as overengineering;
- which checks must pass before the commit.
