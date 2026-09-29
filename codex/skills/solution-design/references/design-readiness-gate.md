# Design Readiness Gate

Run after the draft and every mandatory challenger.

`READY_FOR_PLANF3` is allowed only after a PASS on all applicable gates.

## 1. Decision closure

Find risk phrases:

- "implementation may";
- "either/or";
- "PlanF3 should choose";
- "implementer decides";
- "could use";
- "client may handle";
- "exact behavior later".

For each occurrence: choose the behavior, classify it as a non-blocking implementation detail, turn it into an assumption with a validation method, or set `BLOCKED`.

PlanF3 does not choose architecture, public behavior, auth policy, source of truth, migration semantics, idempotency semantics, or future scope.

## 2. Minimality gate

Check:

- the smallest acceptable solution is chosen;
- every new dependency/subsystem/state/abstraction is justified by a current requirement ID;
- there is a simpler alternative and a reason it was rejected;
- future-only ideas are moved to Future Work;
- there is no unrelated refactor;
- there is no platform for a hypothetical future.

If the solution is correct but overbuilt — status `BLOCKED_BY_SCOPE_OVERDESIGN`.

## 3. Operation contract closure

For every material operation/action/job/command/game action/state-changing flow, the preconditions, postcondition, retry/repeat/concurrency, missing target, failure behavior, and observable result are defined.

## 4. State lifecycle closure

For every new/changed state/cache/storage/relationship/snapshot/derived value, the source of truth, creation/update/delete, owner changes, and rollback/cleanup are defined.

If the design adds or changes a persistent schema: every column names the requirement ID that forces it, and the Schema Challenger ran against the final draft.

## 5. Access/safety closure

For the read/write/action surfaces, the actor, owner, boundary, unauthenticated/unauthorized behavior, sensitive data, and secret handling are defined.

## 6. Feasibility closure

Every framework/platform capability has evidence, official docs, a spike, a fallback, or a blocking unknown.

`FAIL` if the document states that a platform capability is absent or impossible without a `file:line` citation of the artifact that declares it, or without a command output that fails when the claim is wrong. An empty search of a CLI package, a wrapper, or model memory is not that citation. Such a claim cannot be a non-blocking assumption.

## 7. Traceability closure

- every requirement has a design response;
- every requirement has observable verification;
- every decision is linked to drivers/evidence;
- every risk has a mitigation/verification;
- every unknown is blocking or non-blocking;
- every non-blocking assumption has a validation method.

Run `python3 <skills directory>/planf3/scripts/check-citations.py SOLUTION.md` from the repository root. `FAIL` on a non-zero exit: a `file:line` citation names a file that does not exist or a line past its end. Fix the citation from the live code; do not delete it to make the check pass. A reported citation of code outside this checkout (a server, another repository) passes only when the document names where that code lives next to it; the script cannot open it.

## 8. PlanF3 handoff closure

The handoff contains fixed contracts, fixed behavior, minimality constraints, exclusions, and no architecture choice for PlanF3.

## 9. Reference conformance closure

Applies when the requirements name a reference system.

- the conventions table exists and every row cites `file:line` in the reference;
- every deviation from a row is a decision with a requirement ID;
- every rule that forbids borrowing from the reference quotes its source, and no later requirement contradicts that source;
- the Reference Challenger ran against the final draft.

## Result

Internally return exactly one:

- `PASS`
- `FAIL: <failed gates>`
