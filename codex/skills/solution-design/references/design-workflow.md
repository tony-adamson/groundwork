# Порядок solution-design

## 0. Старт и scope

1. Выполни `pwd`.
2. Определи output path для `SOLUTION.md`.
3. Зафиксируй Git roots и initial status.
4. Прочитай инструкции и релевантные docs/manifests.
5. Определи mode: existing/greenfield/hybrid.
6. Найди и классифицируй `CURRENT_STATE.md`.
7. Определи coherent change set.

## 1. Нормализуй требования

Выдели:

- `REQ-*` — functional requirements;
- `NFR-*` — quality requirements;
- `CON-*` — constraints;
- `NG-*` — non-goals;
- `ASM-*` — assumptions;
- `UNK-*` — unknowns.

Не превращай догадку модели в требование пользователя.

## 2. Установи current context

Для existing/hybrid проверь critical claims по живому коду, даже если есть `CURRENT_STATE.md`.

Если baseline недостаточен для безопасного решения — `BLOCKED` и предложи focused `$codebase-analysis`.

## 3. Сформулируй minimality contract

До выбора решения заполни:

- smallest acceptable solution;
- complexity budget;
- explicit non-goals;
- rejected overengineering;
- future work parking lot.

## 4. Определи design drivers

Только релевантные: correctness, simplicity, compatibility, reversibility, UX, performance, offline, latency, security, cost, delivery time, team familiarity, platform constraints.

## 5. Рассмотри alternatives

Для нетривиальной задачи начни с `Option 0: minimal local extension / reuse existing pattern`.

Другие варианты добавляй только при реальном архитектурном выборе.

## 6. Выбери recommended solution

Опиши архитектуру достаточно точно, чтобы PlanF3 не переизобретал её.

Не включай file-by-file checklist, implementation phases, commits, task assignment.

## 7. Закрой operation/state semantics

Для применимых операций и состояния заполни таблицы Operation Semantics и State Lifecycle.

## 8. Определи validation strategy

Каждое material requirement должно иметь verification type и observable pass condition.

## 9. Fresh challenge

Для нетривиальной задачи запусти:

1. Design Challenger;
2. Lean Challenger.

Прими только findings с concrete requirement/contract/failure/cost/evidence.

## 10. Исправь draft

Внеси accepted corrections. Unsupported findings отклони с причиной.

## 11. Readiness gate

Запусти `design-readiness-gate.md`. Только после PASS ставь `READY_FOR_PLANF3`.

## 12. Финал

1. Запиши двухблоковый `SOLUTION.md`.
2. Зафиксируй final working tree status.
3. Укажи статус.
