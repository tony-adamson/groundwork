# Универсальные линзы решения

Сначала определи system archetypes. Применяй только релевантные линзы.

## Universal core

- requirements;
- minimality contract;
- components;
- boundaries;
- contracts;
- state;
- flows;
- failures;
- compatibility;
- validation;
- risks;
- future work excluded.

## Mobile

App/scene lifecycle, navigation, UI state ownership, main-thread/actor isolation, persistence/offline/cache/sync, permissions, deep links, notifications, background execution, accessibility, performance, build/signing/distribution.

Не добавляй global state manager, coordinator/router layer или cache engine без текущего requirement.

## Frontend/Web

Routing, rendering, component boundaries, state management, network contracts, SSR/CSR/SSG/hydration, browser storage, sessions, accessibility, responsive behavior, bundle size, hosting.

Не добавляй state library/design system/data layer ради одного экрана.

## Backend

API/event contracts, persistence, transactions, consistency, auth/authz, validation, idempotency, jobs/queues, retries/timeouts, observability, deployment/rollback.

Не добавляй queue/worker/cache/metrics/state machine без requirement.

## Game

Gameplay rule, input, game loop, deterministic state, physics, animation, save/load, assets, frame budget, platform controls.

Не добавляй engine subsystem/tools pipeline ради одной механики.

## CLI/Desktop

Command/GUI entry points, stdout/stderr/exit codes, filesystem, IPC, local state, OS integrations, packaging, updates.

## Library/SDK

Public API, compatibility, error model, extension points, dependency surface, supported platforms, versioning, packaging, consumer migration.

## Data/ML/Infra

Pipeline stages, artifacts, reproducibility, data lineage, orchestration, environment separation, credentials, rollback, monitoring, scheduling, cost.

## Правило

Каждая применённая линза должна помочь выбрать минимальное решение, а не расширить scope.
