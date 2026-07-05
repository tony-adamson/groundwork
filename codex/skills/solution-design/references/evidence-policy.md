# Evidence policy для SOLUTION.md

## Типы утверждений

- `REQUIREMENT` — требование пользователя, issue, PRD, product doc или обязательного стандарта.
- `FACT` — подтверждено кодом, тестом, конфигом, schema, manifest, CURRENT_STATE evidence или official docs.
- `INFERENCE` — вывод из нескольких facts.
- `ASSUMPTION` — принятое условие без полного подтверждения.
- `DECISION` — выбранное решение.
- `UNKNOWN` — неизвестно или противоречиво.

Не используй проценты уверенности.

## Current-state claims

Для existing-system design material утверждения о текущем поведении должны ссылаться на:

- CURRENT_STATE Evidence ID;
- file path/symbol;
- test;
- schema/config/manifest;
- безопасную команду;
- official docs для внешнего поведения.

## External docs

Для framework/platform/API behavior используй authoritative/version-specific docs. Блог или память модели не достаточно для material decision.

## Traceability

Каждое requirement должно иметь:

- источник;
- design response;
- observable acceptance condition;
- verification.

Каждое decision должно иметь:

- drivers;
- evidence;
- consequences;
- reversal strategy.

## Запрещено

- “best practice” без drivers;
- будущую потребность как текущее requirement;
- consensus сабагентов как доказательство;
- необоснованную новую архитектуру;
- оставлять PlanF3 выбирать public behavior.
