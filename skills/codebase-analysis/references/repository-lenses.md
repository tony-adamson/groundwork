# Universal repository lenses

Determine the archetypes first. One repository can be mixed.

## Universal core

Always applies:

- purpose;
- structure;
- entry points;
- lifecycle;
- control flow;
- data/state flow;
- contracts;
- invariants;
- dependencies;
- error handling;
- verification;
- release/distribution;
- simplicity baseline;
- unknowns.

## Mobile

Lifecycle, navigation, UI composition, state ownership, main-thread/actor isolation, offline/cache/sync, permissions, deep links, notifications, background execution, accessibility, performance, build/signing/distribution.

## Frontend/Web

Routing, rendering model, component boundaries, state, network contracts, SSR/CSR/SSG/hydration, browser storage, sessions/cookies, accessibility, responsive behavior, bundle impact, hosting.

## Backend

API/event contracts, persistence, transactions, consistency, auth/authz, validation, idempotency, jobs/queues, retries/timeouts, observability, deployment, rollback, backup/recovery.

## Game

Game loop, input latency, deterministic state, physics, animation, assets, save/load, scene/state transitions, frame budget, platform controls, replay/debug tools.

## Desktop/CLI

Process/app lifecycle, command dispatch, stdout/stderr/exit codes, filesystem, IPC, local state, OS integrations, packaging, updates, terminal/GUI compatibility.

## Library/SDK

Public API, source/binary compatibility, extension points, dependency surface, error model, supported platforms, versioning, packaging, publication, consumer migration.

## Data/ML/Infra

Pipelines, inputs/outputs, artifacts, reproducibility, data lineage, orchestration, environment separation, credentials, state ownership, rollback, monitoring, scheduling, cost.

## Rule

Do not create long empty `not applicable` sections. List the applied lenses compactly and expand only what is relevant.
