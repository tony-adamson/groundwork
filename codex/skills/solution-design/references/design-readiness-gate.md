# Design Readiness Gate

Run after the draft, the Design Challenger, and the Lean Challenger.

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

## 5. Access/safety closure

For the read/write/action surfaces, the actor, owner, boundary, unauthenticated/unauthorized behavior, sensitive data, and secret handling are defined.

## 6. Feasibility closure

Every framework/platform capability has evidence, official docs, a spike, a fallback, or a blocking unknown.

## 7. Traceability closure

- every requirement has a design response;
- every requirement has observable verification;
- every decision is linked to drivers/evidence;
- every risk has a mitigation/verification;
- every unknown is blocking or non-blocking;
- every non-blocking assumption has a validation method.

## 8. PlanF3 handoff closure

The handoff contains fixed contracts, fixed behavior, minimality constraints, exclusions, and no architecture choice for PlanF3.

## Result

Internally return exactly one:

- `PASS`
- `FAIL: <failed gates>`
