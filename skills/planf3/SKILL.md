---
name: planf3
description: "Создаёт или исполняет минимальный Markdown implementation plan на основе SOLUTION.md или явного запроса. Использовать только по явной просьбе пользователя: планирование или Build Plan. Без презентационных артефактов и future-proof архитектуры."
argument-hint: "[путь к плану или описание задачи] [questionable]"
disable-model-invocation: true
---

# PlanF3 → минимальный implementation plan

PlanF3 работает в двух режимах:

1. **Create Plan** — создать `specs/<descriptive-name>-implementation-plan.md`.
2. **Build Plan** — выполнить уже утверждённый план со статусом `READY_FOR_BUILD`.

План всегда Markdown-first. Не создавай презентационные или визуальные артефакты. Если нужна схема — используй короткий текст или Mermaid только при реальной пользе.

## Главная цель

PlanF3 не ищет “лучшую архитектуру”. Он компилирует утверждённое `SOLUTION.md` в **самый маленький исполняемый план**, который реализует требования, сохраняет контракты и имеет воспроизводимые проверки.

Если `SOLUTION.md` есть, он выше плана. Не переизобретай архитектуру.

## Выходной файл

По умолчанию:

- `PLAN_OUTPUT_DIRECTORY`: `specs/`
- `PLAN_FILE`: `specs/<descriptive-kebab-name>-implementation-plan.md`

План двухблоковый:

1. **Блок 1. Для человека** — короткий readable summary.
2. **Блок 2. Для агента** — подробный execution contract.

## Статусы

- `DRAFT`
- `BLOCKED_FOR_SOLUTION_AMENDMENT`
- `BLOCKED_BY_SCOPE_OVERDESIGN`
- `READY_FOR_BUILD`
- `BUILD_IN_PROGRESS`
- `BUILD_COMPLETE`
- `BUILD_FAILED`

## Minimal Diff Compiler Mode

Когда есть `SOLUTION.md`:

- не улучшай архитектуру;
- не добавляй future-proofing;
- не добавляй dependency/subsystem/state/abstraction вне `SOLUTION.md`;
- не расширяй scope;
- не превращай локальную фичу в платформу;
- не добавляй docs/tests больше, чем нужно для доказательства поведения;
- если плану нужно новое архитектурное решение — `BLOCKED_FOR_SOLUTION_AMENDMENT`.

## Режимы

Если запрос содержит путь к существующему плану и просит реализовать — читай [build-plan.md](workflows/build-plan.md).

Если запрос просит создать план из `SOLUTION.md` или задачи — читай [create-plan.md](workflows/create-plan.md).

Если запрос просит обновить план — читай [update-plan.md](workflows/update-plan.md).

Если запрос просит обновить ссылки между планами — читай [update-references.md](workflows/update-references.md).

Перед `READY_FOR_BUILD` всегда запускай [plan-readiness-gate.md](workflows/plan-readiness-gate.md).

## Обязательные gates перед READY_FOR_BUILD

- correctness gate PASS;
- executable validation gate PASS;
- minimality gate PASS;
- no architecture decision deferred to builder;
- no speculative architecture beyond `SOLUTION.md`;
- no material requirement only in prose;
- no validation based only on static text when behavior can be checked.

## Build Plan

Во время реализации:

- выполняй фазы последовательно;
- делай минимальный diff;
- используй сабагентов адаптивно;
- после нетривиальных фаз запускай fresh read-only verifier;
- исправляй только подтверждённые blocking findings;
- останавливайся при новом design decision, scope overdesign или unsafe action.

## Адаптация к харнессу

Если харнесс не предоставляет инструмент изолированных сабагентов (например, Pi) — роли implementer/verifier/challenger выполняй inline отдельными проходами: verifier-проход выводит только findings, координатор реагирует. Не имитируй запуск сабагентов и не утверждай, что они запускались.

## Язык

Планы и отчёты пиши на языке пользователя. Имена файлов, commands, API, symbols, code identifiers не переводи.
