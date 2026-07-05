# Build Plan

Исполняй только план со статусом `READY_FOR_BUILD`.

Task markers: `[]` idle · `[wip]` in progress · `[x]` complete · `[f]` failed.

## 0. Readiness

1. Найди план из запроса.
2. Откажись строить, если статус не `READY_FOR_BUILD`.
3. Прочитай `SOLUTION.md`, `CURRENT_STATE.md`, локальные инструкции и весь plan agent-block.
4. Зафиксируй branch, revision, initial git status, tracked/untracked changes.
5. Не трогай чужие изменения.
6. Поставь `BUILD_IN_PROGRESS` только после этих проверок.

## 1. Minimal diff execution

Реализуй самый маленький diff, который выполняет план.

Запрещено без возврата в `solution-design`:

- добавлять dependency;
- добавлять persistent state;
- добавлять subsystem/framework/worker/scheduler;
- менять public contract;
- расширять scope;
- делать unrelated refactor;
- реализовывать Future Work.

Если план кажется overbuilt — остановись с `SCOPE_OVERDESIGN`.

## 2. Фазовое выполнение

Для каждой фазы:

1. Перечитай связанные requirements и constraints.
2. Реализуй только scope фазы.
3. Запусти phase validation.
4. Проверь diff фазы.
5. Для нетривиальной фазы запусти fresh read-only verifier.
6. Исправь только подтверждённые blocking findings.
7. Отметь фазу `[x]` только после validation + verifier approval.

Не запускай параллельно зависимые фазы.

## 3. Сабагенты

Используй адаптивно:

- маленький проект: обычно 0–1 implementer;
- verifier обязателен для рискованных фаз;
- nested spawning запрещён.

Implementer получает конкретную фазу, allowed files, forbidden changes, validation commands и expected result.

Verifier работает read-only и проверяет только correctness/scope/minimality текущей фазы.

## 4. Repair loops

Не делай бесконечный цикл fix/test.

- 2 попытки на одну фазовую проблему;
- после повторного провала — `[f]` и `BUILD_FAILED` или `BLOCKED` с причиной.

Если причина требует design decision — `BLOCKED_FOR_SOLUTION_AMENDMENT`.

## 5. Stop conditions

Остановись, если:

- нужен новый architecture/public behavior/source-of-truth decision;
- план противоречит `SOLUTION.md` или текущему коду;
- required capability недоступна;
- validation нельзя сделать deterministic;
- нужна destructive/external/production action;
- реализация затронет unrelated user changes;
- minimality budget нарушается без одобрения;
- фактический diff превысил `Estimated LOC net` или files-to-change budget плана в 2 раза — остановись, покажи `git diff --stat`, объясни причину и жди решения.

## 6. Final validation

1. Запусти все global validation commands.
2. Сопоставь каждое material requirement с implementation evidence и pass condition.
3. Проверь tracked/untracked diff.
4. Убедись, что excluded areas не менялись.
5. Запусти финальный read-only review: `/code-review` в Claude Code, ponytail в Pi; если недоступны — отдельный inline-проход, выводящий только findings.
6. Если diff выглядит раздутым — сократи его: `/simplify` в Claude Code; иначе отдельный проход по reuse/simplification с применением правок.

## 7. Final report

На языке пользователя:

- итоговый статус;
- `git diff --stat` (tracked + untracked);
- сравнение фактического diff с `Estimated LOC net` и files-to-change budget плана;
- какие requirements выполнены;
- validation commands + результаты (честно: упало — показать вывод, пропущено — сказать);
- verifier/reviewer findings;
- removed/rejected overengineering;
- **"Что проверить на ревью"**: 3–5 конкретных рисков и как проверить их руками;
- remaining risks/blockers;
- подтверждение, что production/destructive actions не выполнялись.
