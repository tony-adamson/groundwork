# Universal solution lenses

Determine the system archetypes first. Apply only the relevant lenses.

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

Do not add a global state manager, a coordinator/router layer, or a cache engine without a current requirement.

## Frontend/Web

Routing, rendering, component boundaries, state management, network contracts, SSR/CSR/SSG/hydration, browser storage, sessions, accessibility, responsive behavior, bundle size, hosting.

Do not add a state library/design system/data layer for the sake of one screen.

## Backend

API/event contracts, persistence, transactions, consistency, auth/authz, validation, idempotency, jobs/queues, retries/timeouts, observability, deployment/rollback.

Do not add a queue/worker/cache/metrics/state machine without a requirement.

## Game

Gameplay rule, input, game loop, deterministic state, physics, animation, save/load, assets, frame budget, platform controls.

Do not add an engine subsystem/tools pipeline for the sake of one mechanic.

## CLI/Desktop

Command/GUI entry points, stdout/stderr/exit codes, filesystem, IPC, local state, OS integrations, packaging, updates.

## Library/SDK

Public API, compatibility, error model, extension points, dependency surface, supported platforms, versioning, packaging, consumer migration.

## Data/ML/Infra

Pipeline stages, artifacts, reproducibility, data lineage, orchestration, environment separation, credentials, rollback, monitoring, scheduling, cost.

## Rule

Every applied lens must help choose the minimal solution, not expand the scope.
