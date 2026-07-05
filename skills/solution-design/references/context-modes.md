# Контекстные режимы

## Несколько пожеланий

Объединяй изменения в один `SOLUTION.md`, только если они имеют общую цель, область системы, contract/data/release boundary или техническую зависимость.

Если изменения независимы — не создавай искусственную архитектуру. Раздели на workstreams или верни `BLOCKED` с рекомендуемыми отдельными вызовами.

## Existing-system mode

Используй, когда есть код, который будет изменён.

Обязано учитывать:

- current behavior;
- contracts/invariants;
- compatibility;
- existing verification;
- regression surface;
- simplicity baseline.

Если `CURRENT_STATE.md` отсутствует, выполни focused discovery. Не создавай `CURRENT_STATE.md` автоматически.

Если baseline невозможно установить — `BLOCKED` с точным запросом `codebase-analysis <focus>`.

## Greenfield mode

Используй, когда production-кода ещё нет.

Исходи из требований, платформ, ограничений, данных, безопасности, бюджета, сложности эксплуатации и компетенций команды.

Не выбирай технологию “потому что популярна”. Каждое важное решение связывай с design drivers и minimality contract.

## Hybrid mode

Используй, когда есть skeleton/prototype/часть системы или новый клиент к существующему backend.

Существующие части — constraints. Отсутствующие части — greenfield.

## CURRENT_STATE.md

Статусы:

- `CURRENT` — относится к задаче и актуальному коду;
- `PARTIAL` — полезен, но не покрывает весь affected scope;
- `STALE` — релевантный код изменился после анализа;
- `IRRELEVANT` — другой project/subsystem;
- `ABSENT` — нет подходящего документа.

`CURRENT_STATE_COMPLETE` не означает, что документ покрывает любую новую задачу. Смотри declared scope и user focus.
