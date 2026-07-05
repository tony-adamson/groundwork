# Order of analysis

Go step by step. Skip only what genuinely does not apply. Do not propose future changes.

## 0. Start

1. Run `pwd`.
2. Find the Git root, branch, revision, and initial working tree status.
3. Read `AGENTS.md`, `CLAUDE.md`, README, CONTRIBUTING, docs, manifests, build/test/release instructions.
4. Find code roots, package roots, schemas, config roots.
5. Find a `graphify` graph. If present — assess its freshness and use it as a map, not as evidence.

## 1. Determine the system type

Identify one or more archetypes: mobile, frontend, backend, game, desktop, CLI, library, SDK, data/ML, infra, monorepo, mixed.

Do not apply the backend lens to every project by default.

## 2. Determine the purpose and main scenarios

Record the system's purpose, runtime, build model, main user/system scenarios, and the current shape of the architecture.

## 3. Study the structure

Find the main modules/apps/packages/services/assets/configs/schemas/tests. Do not describe every file.

## 4. Find the entry points

Depending on the project: app lifecycle, routes, commands, screens, API endpoints, jobs, game loop, package exports, event handlers, scripts, build entry points.

## 5. Trace the control flow

For the focus area or key scenarios, describe the real execution path: trigger → components → side effects → errors → completion.

## 6. Trace the data/state flow

Find state ownership, storage, cache, derived state, network, synchronization, save/load, transactions, lifecycle boundaries.

## 7. Record contracts and invariants

Contracts are not just APIs. A contract can be UI behavior, save format, CLI output, animation rule, design token, schema, public type, accessibility promise, release convention.

Confirm invariants with code, a test, a schema, or a config. Do not invent them.

## 8. Study verification

Find existing tests, typecheck, build, lint, simulator/emulator/device/browser/manual checks, CI/release scripts. Safe checks may be run if they do not modify external systems.

## 9. Record the simplicity baseline

Mandatory:

- which local patterns already exist;
- what the project does simply;
- which frameworks/layers/state managers/services are currently absent;
- which new dependencies would be suspicious;
- where future work must be kept separate.

## 10. Compile the unknowns

Separately write down everything that cannot be confirmed: external services, production state, live APIs, client repos, design files, devices, credentials, undocumented behavior.

## 11. Write CURRENT_STATE.md

Use the two-block structure from the template:

- a short human block;
- a detailed agent block.

## 12. Final check

1. Run the final working tree status.
2. Compare with the baseline.
3. State that you changed only `CURRENT_STATE.md`.
4. If unexpected changes appeared — do not fix them automatically; record them.
