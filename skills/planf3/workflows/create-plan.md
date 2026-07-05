# Create Plan

Пайплайн:

```text
SOLUTION.md или USER_PROMPT
→ draft implementation plan
→ Plan Challenger
→ Lean Plan Challenger
→ corrections
→ Plan Readiness Gate
→ READY_FOR_BUILD
```

## 1. Определи источник

1. Если есть `SOLUTION.md` со статусом `READY_FOR_PLANF3`, используй его как архитектурный контракт.
2. Если `SOLUTION.md` отсутствует, можно создать план только для локальной низкорисковой задачи. Для архитектурной задачи верни `BLOCKED` и попроси `solution-design`.
3. Если `SOLUTION.md` имеет `BLOCKED` или `BLOCKED_BY_SCOPE_OVERDESIGN` — не планируй.
4. Прочитай `CURRENT_STATE.md`, если он релевантен.
5. Прочитай локальные инструкции: `AGENTS.md`, `CLAUDE.md`, README, build/test docs.

## 2. Зафиксируй границы

В плане должны быть явные:

- authoritative requirements;
- что строим;
- что не строим;
- complexity budget;
- files-to-change budget;
- оценка LOC net для всего плана;
- validation commands;
- stop conditions.

## 3. Создай draft Markdown-план

Файл: `specs/<descriptive-kebab-name>-implementation-plan.md`.

Обязательная структура:

```md
# План реализации: <название>

# Блок 1. Для человека

## 1. Коротко
## 2. Что будет сделано
## 3. Что не делаем
## 4. Риски
## 5. Как проверить
## 6. Готовность

---

# Блок 2. Для агента

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

Коротко, без перегруза:

- цель;
- минимальный подход;
- основные файлы/области;
- explicit non-goals;
- главные риски;
- одна команда или список команд для финальной проверки;
- статус.

Не больше 1–2 экранов текста.

## 5. Agent block

Должен быть достаточен для автономного Build Plan:

- source priority;
- `SOLUTION.md` decisions;
- plan status;
- phase statuses: `[]`, `[wip]`, `[x]`, `[f]`;
- разрешённые и запрещённые области;
- exact validation commands;
- observable pass conditions;
- stop conditions;
- verifier policy;
- final review requirements.

## 6. Minimality contract

Обязателен:

| Category | Budget | Exceeded? | Justification |
|----------|--------|-----------|---------------|
| New dependencies | 0 by default | | |
| New persistent state | 0 unless required | | |
| New subsystems/workers/schedulers | 0 unless required | | |
| New global abstractions | 0 unless reused now | | |
| New docs | only contract/usage/validation | | |

Если план превышает бюджет без доказанного текущего требования — исправь или поставь `BLOCKED_BY_SCOPE_OVERDESIGN`.

## 7. Files to change budget

| File / directory | Existing/New | Why required | Requirement | Can be avoided? |
|------------------|--------------|--------------|-------------|-----------------|

Каждый новый файл должен иметь причину. Если можно сделать локально без нового слоя — предпочитай локально.

Под таблицей укажи суммарную оценку: `Estimated LOC net: ~N`. Она используется стоп-правилом 2× во время Build Plan.

## 8. Фазы

Фазы должны быть последовательными, маленькими и проверяемыми.

Для каждой фазы:

- цель;
- scope;
- allowed files;
- forbidden changes;
- tasks;
- phase validation;
- verifier focus;
- exit criteria.

Не распараллеливай зависимые фазы.

## 9. Plan Challenger

Запусти fresh read-only Plan Challenger. Он ищет correctness gaps:

- missing requirements;
- changes to `SOLUTION.md` contracts;
- decisions deferred to builder;
- missing operation/state lifecycle;
- missing auth/safety/failure behavior;
- non-reproducible validation;
- incorrect commands;
- invalid fallback mechanisms.

## 10. Lean Plan Challenger

Запусти fresh read-only Lean Challenger. Он ищет overengineering:

- unnecessary files;
- unnecessary dependencies;
- generic abstractions with one current call site;
- persistent state that can be derived;
- future work;
- unrelated refactors;
- validation harness larger than feature;
- docs that do not define contract/usage/validation.

## 11. Коррекция

Accepted findings исправь. Unsupported findings отклони с причиной. Если найдено новое design decision — `BLOCKED_FOR_SOLUTION_AMENDMENT`.

## 12. Readiness

Запусти `plan-readiness-gate.md`.

Только после PASS ставь `READY_FOR_BUILD`.

## 13. Финал

Сообщи:

- путь к созданному плану;
- статус;
- что было исключено как overengineering;
- какие проверки должны пройти перед коммитом.
