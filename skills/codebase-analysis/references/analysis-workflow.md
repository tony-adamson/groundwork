# Порядок анализа

Иди по шагам. Пропускай только то, что действительно не применимо. Не предлагай будущие изменения.

## 0. Старт

1. Выполни `pwd`.
2. Найди Git root, branch, revision и initial working tree status.
3. Прочитай `AGENTS.md`, `CLAUDE.md`, README, CONTRIBUTING, docs, manifests, build/test/release инструкции.
4. Найди code roots, package roots, schemas, config roots.
5. Найди `graphify` graph. Если есть — оцени актуальность и используй как карту, не как доказательство.

## 1. Определи тип системы

Определи один или несколько архетипов: mobile, frontend, backend, game, desktop, CLI, library, SDK, data/ML, infra, monorepo, mixed.

Не применяй backend-линзу ко всем проектам по умолчанию.

## 2. Определи purpose и основные сценарии

Зафиксируй назначение системы, runtime, build model, основные пользовательские/системные сценарии и текущую форму архитектуры.

## 3. Изучи структуру

Найди главные modules/apps/packages/services/assets/configs/schemas/tests. Не описывай каждый файл.

## 4. Найди entry points

В зависимости от проекта: app lifecycle, routes, commands, screens, API endpoints, jobs, game loop, package exports, event handlers, scripts, build entry points.

## 5. Проследи control flow

Для фокуса или ключевых сценариев опиши реальный путь выполнения: trigger → components → side effects → errors → completion.

## 6. Проследи data/state flow

Найди ownership состояния, storage, cache, derived state, network, synchronization, save/load, transactions, lifecycle boundaries.

## 7. Зафиксируй контракты и инварианты

Контракты — это не только API. Это может быть UI behavior, save format, CLI output, animation rule, design token, schema, public type, accessibility promise, release convention.

Инварианты подтверждай кодом, тестом, схемой или конфигом. Не выдумывай.

## 8. Изучи verification

Найди existing tests, typecheck, build, lint, simulator/emulator/device/browser/manual checks, CI/release scripts. Безопасные проверки можно запускать, если они не меняют внешние системы.

## 9. Зафиксируй simplicity baseline

Обязательно:

- какие локальные паттерны уже существуют;
- что проект делает просто;
- каких фреймворков/слоёв/state managers/services сейчас нет;
- какие новые зависимости были бы подозрительны;
- где future work должен быть вынесен отдельно.

## 10. Сформируй unknowns

Отдельно запиши всё, что нельзя подтвердить: внешние сервисы, production state, live APIs, client repos, design files, devices, credentials, undocumented behavior.

## 11. Напиши CURRENT_STATE.md

Используй двухблоковую структуру из шаблона:

- короткий human-блок;
- подробный agent-блок.

## 12. Финальная проверка

1. Выполни final working tree status.
2. Сравни с baseline.
3. Укажи, что изменил только `CURRENT_STATE.md`.
4. Если появились неожиданные изменения — не исправляй автоматически, а зафиксируй.
