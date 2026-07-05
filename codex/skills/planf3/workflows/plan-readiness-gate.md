# Plan Readiness Gate

Запускается перед `READY_FOR_BUILD`.

## 1. Traceability gate

Каждое material requirement/decision из `SOLUTION.md` должно иметь:

- одну или несколько задач;
- validation step;
- observable pass condition.

Нельзя оставлять requirement только в prose.

## 2. Design boundary gate

План не должен вводить или выбирать:

- новую архитектуру;
- public behavior;
- auth policy;
- source of truth;
- persistence semantics;
- migration semantics;
- lifecycle rules;
- fallback contracts.

Если это нужно — `BLOCKED_FOR_SOLUTION_AMENDMENT`.

## 3. Minimality gate

Проверь, что план:

- реализует smallest sufficient diff;
- не добавляет dependency/subsystem/state/abstraction вне `SOLUTION.md`;
- не реализует future work;
- не рефакторит unrelated code;
- имеет files-to-change budget и `Estimated LOC net`;
- не строит платформу для локальной задачи;
- включает rejected overengineering.

Если корректно, но overbuilt — `BLOCKED_BY_SCOPE_OVERDESIGN`.

## 4. Operation semantics gate

Для каждой material operation/action/job/command/game action определены:

- inputs;
- preconditions;
- postcondition;
- repeat/retry/concurrency;
- missing-target behavior;
- partial failure;
- auth/safety;
- observable result.

## 5. State lifecycle gate

Для нового/изменённого state/storage/cache/relationship/snapshot/artifact определены:

- creation;
- update;
- deletion;
- owner changes;
- rollback/cleanup;
- source of truth.

## 6. Executable validation gate

Каждая behavioral validation имеет:

- setup;
- command;
- assertion;
- cleanup;
- expected exit status.

Long-running interactive command не является acceptance command.

## 7. Command sanity gate

Проверь команды:

- завершаются конечным образом;
- используют правильные path/quoting;
- имеют правильную семантику exit code;
- не дают false positive/false negative;
- учитывают tracked и untracked files;
- не выполняют destructive/external side effects.

## 8. Scope gate

Каждая planned file имеет причину. Каждая задача маппится на `SOLUTION.md` или validation. Исключённые области остаются исключёнными.

## 9. Result

Внутренний результат:

- `PASS`
- `FAIL: <failed gates>`

`READY_FOR_BUILD` разрешён только после `PASS`.
