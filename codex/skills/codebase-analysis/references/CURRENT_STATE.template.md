# Текущее состояние

> Удали все подсказки перед финализацией. Не заполняй секции ради формы. Пиши на языке пользователя. Имена файлов, symbols, команды и API не переводи.
>
> Секции без маркера — обязательное ядро. Секции с маркером `[IF: …]` заполняй только при выполнении условия — иначе удали секцию целиком, без `not applicable` и пустых таблиц.

# Блок 1. Для человека

## 1. Короткий вывод

Кратко, 5–12 предложений:

- что это за проект;
- какие части реально проанализированы;
- как система работает в общих чертах;
- какие контракты важнее всего;
- какие unknowns могут повлиять на будущую задачу;
- можно ли использовать документ как вход для `$solution-design`.

## 2. Карта системы простыми словами

- Основные части системы:
- Главные entry points:
- Где живёт состояние:
- Как проверяется работа:
- Что точно не найдено или не подтверждено:

## 3. Важные ограничения для будущих изменений

- Что нельзя ломать:
- Какие существующие паттерны лучше переиспользовать:
- Где не стоит добавлять новую архитектуру без явной причины:
- Какие вопросы потребуют отдельного focused analysis:

**Статус**: `CURRENT_STATE_COMPLETE` или `CURRENT_STATE_PARTIAL`

---

# Блок 2. Для агента

## 1. Метаданные анализа

- **Analysis root** (`pwd`):
- **Repository root**:
- **Git revision**:
- **Branch**:
- **Дата анализа**:
- **Фокус пользователя**:
- **Initial working tree status**:
- **Final working tree status**:
- **Changes attributable to this analysis**:
- **Repository graph status**: `graph used` / `graph generated and used` / `graph unavailable` / `graph stale` / `graph generation failed` / `graph not applicable`
- **Ограничения анализа**:

## 2. Обзор системы

Для каждого существенного утверждения укажи тип: `FACT`, `INFERENCE` или `UNKNOWN`.

- Назначение системы:
- Основные сценарии:
- Технологии, языки, runtime:
- Build/package/release модель:
- Общая архитектурная форма:

## 3. Структура репозитория

Не перечисляй все файлы. Описывай основные директории, modules, apps, packages, services, libraries, assets, schemas, build/config areas.

## 4. Applied analysis lenses

Укажи обнаруженные архетипы:

- mobile / frontend / backend / game / desktop / CLI / library / SDK / data / ML / infra / monorepo / mixed

Для каждой линзы: `applied`, `partially applied`, `not detected`, `unknown`.

## 5. Релевантные компоненты

Для каждого важного компонента:

### <component name>

- **Тип утверждения**:
- **Ответственность**:
- **Ключевые файлы**:
- **Ключевые symbols**:
- **Зависимости**:
- **Потребители**:
- **Текущее поведение**:
- **Evidence**:
- **Unknowns**:

## 6. Entry points

| Entry point | Тип | Файл / symbol | Trigger | Evidence |
|-------------|-----|---------------|---------|----------|

## 7. Control flow

Для основных flows:

### <flow name>

- Trigger:
- Последовательность компонентов:
- Side effects:
- Error handling:
- Completion point:
- Evidence:
- Unknowns:

## 8. Data/state flow [IF: в анализируемой области есть существенное состояние или данные]

Опиши только существующее состояние:

- источники данных;
- ownership состояния;
- transformations;
- storage/persistence/cache;
- synchronization/offline/network;
- transaction/lifecycle boundaries;
- derived state;
- места возможной потери/дублирования/рассинхронизации;
- evidence.

## 9. Существующие контракты

Контрактом может быть UI/UX поведение, API, schema, file format, CLI output, save-game format, rendering rule, design token, accessibility behavior, protocol, build convention.

| Contract | Scope | Evidence | Consumers | Notes |
|----------|-------|----------|-----------|-------|

## 10. Существующие инварианты [IF: найдены инварианты, подтверждённые кодом, тестом или схемой]

| Invariant | Scope | Backing code/test/config | Consequence if violated | Type |
|-----------|-------|--------------------------|-------------------------|------|

## 11. Dependencies and integrations [IF: зависимости или интеграции релевантны фокусу анализа]

| Dependency / integration | Purpose | Version | Config | Used at | Failure behavior | Evidence |
|--------------------------|---------|---------|--------|---------|------------------|----------|

## 12. Simplicity baseline

Этот раздел обязателен. Он нужен, чтобы будущие агенты не добавляли лишнюю архитектуру.

- Существующие простые extension points:
- Паттерны, которые проект уже использует:
- Паттерны, которых проект явно не использует:
- Зависимости, которые уже можно переиспользовать:
- Новые зависимости, которые были бы необычны для проекта:
- Где проект использует локальную state/logic вместо глобальной архитектуры:
- Где future work не должен строиться без явного требования:

## 13. Cross-cutting concerns [IF: есть применимые или materially unknown concerns]

| Concern | Lens | Current arrangement | Files / symbols | Evidence | Gaps |
|---------|------|---------------------|-----------------|----------|------|

## 14. Existing verification

- Existing tests:
- Typecheck/build/lint:
- Simulator/emulator/browser/device/manual smoke:
- CI/release checks:
- Что было безопасно запущено:
- Что не запускалось и почему:
- Verification gaps:

## 15. Evidence index [IF: material statements ссылаются на Evidence ID; при только inline evidence секцию удали]

| ID | Type | Statement | Evidence | Notes |
|----|------|-----------|----------|-------|

Type: `FACT`, `INFERENCE`, `UNKNOWN`.

## 16. Unknowns and limitations

| Unknown | Why unconfirmed | Affected area | What would confirm it |
|---------|-----------------|---------------|-----------------------|

## 17. Handoff для solution-design

- Проанализированный scope:
- Самые важные контракты:
- Самые важные инварианты:
- Simplicity constraints:
- Unknowns, которые могут заблокировать дизайн:
- Рекомендуемый focused `$codebase-analysis`, если нужен:

**Статус**: `CURRENT_STATE_COMPLETE` или `CURRENT_STATE_PARTIAL`
