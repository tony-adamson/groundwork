# Evidence policy for SOLUTION.md

## Statement types

- `REQUIREMENT` — a requirement from the user, an issue, a PRD, a product doc, or a mandatory standard.
- `FACT` — confirmed by code, a test, a config, a schema, a manifest, CURRENT_STATE evidence, or official docs.
- `INFERENCE` — a conclusion drawn from several facts.
- `ASSUMPTION` — an accepted condition without full confirmation.
- `DECISION` — a chosen solution.
- `UNKNOWN` — unknown or contradictory.

Do not use confidence percentages.

## Current-state claims

For existing-system design, material statements about the current behavior must reference:

- a CURRENT_STATE Evidence ID;
- a file path/symbol;
- a test;
- a schema/config/manifest;
- a safe command;
- official docs for external behavior.

## External docs

For framework/platform/API behavior, use authoritative/version-specific docs. A blog post or the model's memory is not enough for a material decision.

## Traceability

Every requirement must have:

- a source;
- a design response;
- an observable acceptance condition;
- verification.

Every decision must have:

- drivers;
- evidence;
- consequences;
- a reversal strategy.

## Forbidden

- a "best practice" without drivers;
- a future need presented as a current requirement;
- subagent consensus as evidence;
- unjustified new architecture;
- leaving PlanF3 to choose public behavior.
