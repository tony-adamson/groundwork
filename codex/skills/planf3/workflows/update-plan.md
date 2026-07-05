# Update Plan

1. Найди target Markdown plan из запроса.
2. Определи точный scope изменения.
3. Правь только затронутые секции.
4. Если изменение material для implementation tasks, validation, scope, public behavior, operation semantics, state lifecycle или minimality — верни статус в `DRAFT`.
5. Запусти Plan Challenger и Lean Plan Challenger.
6. Запусти `plan-readiness-gate.md`.
7. Ставь `READY_FOR_BUILD` только после PASS.
8. Если нужен новый solution decision — `BLOCKED_FOR_SOLUTION_AMENDMENT`.
9. Если план стал overbuilt — `BLOCKED_BY_SCOPE_OVERDESIGN`.
10. Добавь запись в Amendments: дата, что изменилось, почему, readiness result.
11. Сообщи итоговый статус и путь к файлу.
