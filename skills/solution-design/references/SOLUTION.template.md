# Решение

> Удали все подсказки и placeholder-строки перед финализацией. Не выдумывай секции ради формы. Пиши на языке пользователя. Код, symbols, API, commands и пути не переводи.
>
> Секции без маркера — обязательное ядро. Секции с маркером `[IF: …]` заполняй только при выполнении условия — иначе удали секцию целиком, без `not applicable` и пустых таблиц.

# Блок 1. Для человека

## 1. Что нужно сделать

Простыми словами:

- проблема / желаемый результат;
- кто или что получает пользу;
- что изменится наблюдаемо;
- что считается успехом.

## 2. Короткое решение

Опиши выбранный подход в 5–12 предложениях. Без implementation checklist.

## 3. Что НЕ делаем

Короткий список explicit non-goals. Особенно: что может показаться “полезным”, но не входит в эту итерацию.

## 4. Почему это не overengineering

- минимальный вариант:
- какие существующие паттерны переиспользуются:
- новые зависимости/слои/state: `нет` или явное обоснование:
- что вынесено в future work:

## 5. Риски и проверки

- Главные риски:
- Как проверить результат:
- Что может заблокировать PlanF3:

**Статус**: `READY_FOR_PLANF3` / `BLOCKED` / `BLOCKED_BY_SCOPE_OVERDESIGN`

---

# Блок 2. Для агента

## 1. Метаданные дизайна

- **Working directory**:
- **Output path**:
- **Output Git scope**: `tracked` / `untracked` / `outside-git`
- **Pre-existing SOLUTION.md**:
- **Design mode**: `existing` / `greenfield` / `hybrid`
- **Task title**:
- **Дата анализа**:
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

Разделяй `REQUIREMENT`, `FACT`, `INFERENCE`, `ASSUMPTION`, `UNKNOWN`.

- Current problem / greenfield need:
- Desired observable outcome:
- Affected actors/users/systems:
- Success definition:

## 3. Requirements

| ID | Type | Requirement | Source | Priority | Acceptance condition |
|----|------|-------------|--------|----------|----------------------|

Type: `FUNCTIONAL`, `QUALITY`, `CONSTRAINT`, `NON_GOAL`.

## 4. Relevant current context

Для existing/hybrid: только релевантное к задаче, не копируй весь `CURRENT_STATE.md`.

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

Для greenfield: starting constraints, target platforms, available infrastructure, external systems.

## 5. Minimality contract

### 5.1 Smallest acceptable solution

Опиши самый маленький вариант, который выполняет must-have requirements.

### 5.2 Complexity budget

| Category | Budget | Exceeded? | Justification |
|----------|--------|-----------|---------------|
| New runtime dependencies | 0 by default | | |
| New persistent state/storage | 0 unless data is the feature | | |
| New subsystems/workers/schedulers | 0 unless directly required | | |
| New global abstractions | 0 unless reused now | | |
| Changed source files | минимально | | |
| Docs | только контракт/поведение/запуск | | |

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

## 7. Design drivers [IF: был реальный выбор между существенно разными подходами]

| Driver | Priority | Related requirement | Effect on design |
|--------|----------|---------------------|------------------|

## 8. Alternatives considered [IF: нетривиальная задача]

Минимум — `Option 0: Minimal local extension / reuse existing pattern`.

### Option 0: <minimal approach>

- Summary:
- Requirements satisfied:
- Benefits:
- Costs:
- Risks:
- Reversibility:
- Selected/rejected because:

Добавляй другие варианты только при реальном архитектурном выборе.

## 9. Recommended solution

### 9.1 Summary

### 9.2 Architecture and responsibilities

### 9.3 End-to-end flow

### 9.4 Data and state

### 9.5 Contracts

### 9.6 Failure behavior

### 9.7 Relevant platform concerns [IF: платформенная линза материально влияет на решение]

Используй только релевантные линзы: mobile/frontend/backend/game/CLI/library/data/infra/etc.

### 9.8 Compatibility, migration, rollout [IF: меняется существующее поведение, данные или процесс выката]

### 9.9 Security, privacy, safety [IF: задача касается данных пользователей, доступа или безопасности]

### 9.10 Observability, operations, supportability [IF: есть текущее требование к observability/operations]

Не добавляй observability platform без требования.

## 10. Operation semantics [IF: есть state-changing операции: UI actions, API calls, jobs, commands, game actions, migrations]

| Operation | Actor | Preconditions | Postcondition | Repeat/retry/concurrency | Missing target | Authorization/safety |
|-----------|-------|---------------|---------------|--------------------------|----------------|----------------------|

## 11. State lifecycle [IF: добавляется или меняется persisted/derived/cache/UI/game/session state]

| State/field | Source of truth | Created | Updated | Deleted | Related entity changes | Rollback/cleanup |
|-------------|-----------------|---------|---------|---------|------------------------|------------------|

## 12. Impact and boundaries

- In scope:
- Out of scope:
- Preserved behavior:
- Affected subsystems:
- External integrations:
- Explicit exclusions:

Не создавай file-by-file edit checklist.

## 13. Decision log [IF: были решения с реальными альтернативами; иначе решение полностью описано в §9]

| ID | Decision | Drivers | Evidence | Consequences | Reversal strategy |
|----|----------|---------|----------|--------------|-------------------|

## 14. Risks and mitigations

| ID | Risk | Likelihood | Impact | Mitigation | Verification |
|----|------|------------|--------|------------|--------------|

Без процентов уверенности.

## 15. Validation strategy

| Requirement | Design response | Verification type | Observable pass condition |
|-------------|-----------------|-------------------|---------------------------|

Не пиши просто “run tests”. Укажи observable результат.

## 16. Challenger results [IF: challengers запускались]

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

PlanF3 не должен выбирать архитектуру, public behavior, source of truth, auth policy, migration semantics или future scope.

## 18. Readiness

Статус ровно один:

- `READY_FOR_PLANF3`
- `BLOCKED`
- `BLOCKED_BY_SCOPE_OVERDESIGN`

`READY_FOR_PLANF3` разрешён только если requirements проверяемы, current state установлен, high-impact unknowns закрыты или явно приняты, выбранное решение минимально достаточно, contracts/failure behavior/validation описаны, а future work не попал в текущий scope.
