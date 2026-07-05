# Делегирование

Координатор — единственный автор `SOLUTION.md`.

## Когда использовать сабагентов

- простая локальная задача: 0;
- один сложный flow: 1;
- несколько подсистем или незнакомая область: 2;
- high-risk архитектура: до 3.

Не делай nested spawning. Не делегируй ради процесса.

## Роли

### Context Explorer

Ищет current flow, contracts, invariants, tests, regression surface.

### Domain/Docs Researcher

Ищет official/version-specific docs, platform constraints, protocol guarantees.

### Design Challenger

Свежий read-only контекст. Ищет correctness gaps:

- missing requirements;
- unsupported assumptions;
- ambiguous contracts;
- state lifecycle gaps;
- auth/security gaps;
- missing validation;
- решения, переданные PlanF3.

### Lean Challenger

Свежий read-only контекст. Ищет overengineering:

- unnecessary dependency;
- new subsystem for local feature;
- abstraction with one call site;
- persistent state that can be derived;
- future work in current scope;
- unrelated refactor;
- validation harness larger than feature;
- docs that do not define a contract.

## Формат finding

- section;
- issue;
- violated requirement/contract/minimality rule;
- concrete failure or maintenance cost;
- simpler alternative;
- severity: `BLOCKING`, `NON_BLOCKING`;
- required correction.

`APPROVE` допустим.
