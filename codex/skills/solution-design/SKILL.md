---
name: solution-design
description: "Use when explicitly asked for $solution-design to create SOLUTION.md for one concrete software change before implementation planning. Produces a minimal evidence-based design; does not write code or create an implementation plan."
---

# Solution Design → SOLUTION.md

Навык создаёт или полностью обновляет `SOLUTION.md` в директории, которую вернёт `pwd`.

`SOLUTION.md` отвечает на вопросы: **что изменить, почему именно так, какие контракты должны сохраниться, что не входит в scope, как доказать корректность**.

Он не отвечает на вопрос “какие файлы менять по шагам” — это задача `$planf3`.

Итоговый файл всегда двухблоковый:

1. **Блок 1. Для человека** — короткий понятный summary без архитектурного перегруза.
2. **Блок 2. Для агента** — полный контракт для планирования и реализации.

## Жёсткие границы

Разрешено менять только `SOLUTION.md`.

Запрещено:

- писать код;
- менять тесты, конфиги, схемы, зависимости;
- создавать implementation phases или file-by-file checklist;
- автоматически запускать `$codebase-analysis` или `$planf3`;
- перезаписывать `CURRENT_STATE.md`;
- добавлять future-proofing в выбранное решение;
- превращать локальную задачу в subsystem/platform/framework.

## Контракт запуска

Навык требует конкретную задачу: feature, bug fix, refactoring goal, migration, product change, greenfield system.

Если цели нет — не создавай общий архитектурный документ. Спроси задачу.

В начале:

1. Выполни `pwd`.
2. Найди Git roots и initial working tree status.
3. Прочитай локальные инструкции и релевантные docs/manifests.
4. Найди и классифицируй `CURRENT_STATE.md`: `CURRENT`, `PARTIAL`, `STALE`, `IRRELEVANT`, `ABSENT`.
5. Определи режим: `existing`, `greenfield`, `hybrid`.
6. Определи, это один coherent change set или независимые workstreams.

## Основная целевая функция

Не “самая правильная архитектура”, а **минимальное достаточное решение**.

Решение лучше, если оно:

- выполняет observable requirements;
- сохраняет существующие контракты;
- использует текущие паттерны проекта;
- добавляет меньше файлов, зависимостей, слоёв и состояния;
- проще ревьюится, тестируется и удаляется;
- явно выносит future work за пределы текущей задачи.

Если корректное решение выглядит overbuilt, статус должен быть `BLOCKED_BY_SCOPE_OVERDESIGN`, а не `READY_FOR_PLANF3`.

## Обязательная минимальность

`SOLUTION.md` должен содержать:

- минимальный приемлемый вариант;
- explicit non-goals;
- rejected overengineering;
- complexity budget;
- future work parking lot;
- объяснение каждого нового dependency/subsystem/persistent state/abstraction, если они нужны.

## Делегирование

Используй сабагентов только при пользе:

- context explorer;
- domain/doc researcher;
- design challenger;
- lean challenger.

Для нетривиального решения обязательны:

1. fresh Design Challenger — ищет correctness/contract gaps;
2. Lean Challenger — ищет overengineering/scope creep.

Оба работают read-only. Итоговый `SOLUTION.md` пишет только координатор.

Если харнесс не предоставляет инструмент изолированных сабагентов (например, Pi) — выполняй challengers inline: два отдельных прохода, каждый выводит только findings по формату из delegation-policy, затем координатор реагирует. Не имитируй запуск сабагентов и не утверждай, что они запускались.

## Что читать

- [context-modes.md](references/context-modes.md)
- [design-workflow.md](references/design-workflow.md)
- [design-readiness-gate.md](references/design-readiness-gate.md)
- [evidence-policy.md](references/evidence-policy.md)
- [solution-lenses.md](references/solution-lenses.md)
- [delegation-policy.md](references/delegation-policy.md)
- [SOLUTION.template.md](references/SOLUTION.template.md)

## Критерий завершения

`SOLUTION.md` готов, только если:

- есть короткий human-блок;
- agent-блок содержит проверяемые requirements, contracts, decisions, risks, validation;
- выбран минимальный достаточный подход;
- non-goals и rejected overengineering явные;
- каждое значимое требование имеет observable verification;
- PlanF3 не должен заново изобретать архитектуру;
- финальный статус ровно один: `READY_FOR_PLANF3`, `BLOCKED`, `BLOCKED_BY_SCOPE_OVERDESIGN`.
