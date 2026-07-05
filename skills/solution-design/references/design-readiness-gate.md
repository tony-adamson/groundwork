# Design Readiness Gate

Запусти после draft, Design Challenger и Lean Challenger.

`READY_FOR_PLANF3` разрешён только после PASS всех применимых gates.

## 1. Decision closure

Найди фразы риска:

- “implementation may”;
- “either/or”;
- “PlanF3 should choose”;
- “implementer decides”;
- “could use”;
- “client may handle”;
- “exact behavior later”.

Для каждого случая: выбери поведение, классифицируй как non-blocking implementation detail, оформи assumption с проверкой или поставь `BLOCKED`.

PlanF3 не выбирает архитектуру, public behavior, auth policy, source of truth, migration semantics, idempotency semantics или future scope.

## 2. Minimality gate

Проверь:

- выбран smallest acceptable solution;
- каждая новая dependency/subsystem/state/abstraction обоснована текущим requirement ID;
- есть simpler alternative и причина отказа;
- future-only ideas вынесены в Future Work;
- нет unrelated refactor;
- нет платформы для гипотетического будущего.

Если решение корректное, но overbuilt — статус `BLOCKED_BY_SCOPE_OVERDESIGN`.

## 3. Operation contract closure

Для каждой material operation/action/job/command/game action/state-changing flow определены preconditions, postcondition, retry/repeat/concurrency, missing target, failure behavior, observable result.

## 4. State lifecycle closure

Для каждого нового/изменённого state/cache/storage/relationship/snapshot/derived value определены source of truth, creation/update/delete, owner changes, rollback/cleanup.

## 5. Access/safety closure

Для read/write/action surfaces определены actor, owner, boundary, unauthenticated/unauthorized behavior, sensitive data, secret handling.

## 6. Feasibility closure

Для каждой framework/platform capability есть evidence, official docs, spike, fallback или blocking unknown.

## 7. Traceability closure

- каждое requirement имеет design response;
- каждое requirement имеет observable verification;
- каждое decision связано с drivers/evidence;
- каждый risk имеет mitigation/verification;
- каждый unknown blocking или non-blocking;
- каждое non-blocking assumption имеет validation method.

## 8. PlanF3 handoff closure

Handoff содержит fixed contracts, fixed behavior, minimality constraints, exclusions и no architecture choice for PlanF3.

## Result

Внутренне верни одно:

- `PASS`
- `FAIL: <failed gates>`
