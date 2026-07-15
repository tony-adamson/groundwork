---
name: ops-review
description: "Use when explicitly asked for $ops-review to review an implemented change for silent operational failures: missing timeouts, unbounded resources, connection leaks, non-idempotent retries, slow-dependency degradation. Read-only findings report; does not fix code and does not replace load testing."
---

# Ops Review → silent-failure findings

Functional tests and code review verify that the code **does what was intended**. This skill hunts the opposite class: properties whose **absence** produces incidents with no errors in the logs — the server just stops responding. It reviews what the change lacks, not what it does.

This is not a replacement for load testing. It catches the statically visible precursors of what load would expose: the missing `timeout=`, the connection that is never returned to the pool, the query without a limit.

## Hard boundaries

Forbidden:

- modifying code, tests, configs, schemas, dependencies;
- applying fixes — output is findings only;
- creating artifact files — the report goes to the chat;
- expanding into a full-repository audit: the scope is the change and its blast radius;
- demanding infrastructure (metrics platforms, load-test suites) as findings — missing observability may be noted once as `INFO`, never as `BLOCKING`;
- declaring a check passed without `file:line` evidence.

## Launch contract

1. Determine the review scope:
   - an explicit git ref/range or path from the arguments;
   - otherwise the working tree + branch diff against the merge-base with the integration branch;
   - if the scope is empty or ambiguous — ask, status `OPS_REVIEW_BLOCKED`.
2. Read the diff, then the surroundings. The defect is usually the **absent line**, and the diff alone cannot show it. Mandatory surroundings: call sites of every touched function; the construction/config of every client, pool, or session the change uses; resource acquisition and release paths.
3. Build the **I/O inventory**: every network, database, file, subprocess, queue, cache, or lock interaction that the change adds or modifies.

## Core mechanic: trace, don't glance

For each I/O inventory row, trace to evidence in code or config:

- **Time**: which setting bounds how long this call can wait? Name the `file:line` or record `UNKNOWN`. "The library probably has a default" is `UNKNOWN`, not a pass.
- **Resources**: where the connection/session/handle is created; where it is released on the success path, the error path, and the cancellation path; pool size versus expected concurrency.
- **Boundedness**: what limits the result-set size, queue length, cache growth, accepted body size.
- **Repeat**: retry policy and backoff; whether the operation is idempotent under retry.
- **Degradation**: the behavior when a dependency is slow-but-alive — the worst incident class, because nothing errors while every worker blocks.

Full checklists per category: [silent-failure-taxonomy.md](references/silent-failure-taxonomy.md).

## Assumption ledger check

If the conversation or task artifacts contain a scope contract with an assumption ledger ("Допущения"): verify each entry — `CONFIRMED` with evidence, or `UNVERIFIED` with the concrete check that would confirm it. An assumption discovered during review but absent from the ledger is itself a finding.

## Output format

Two blocks in the chat, no files:

1. **Block 1. For the human** — 3–6 sentences: the worst finding, the overall verdict, what to do first.
2. **Block 2. Findings**:

| ID | Category | Severity | Statement | Evidence | Kind | Suggested check |
|----|----------|----------|-----------|----------|------|-----------------|

- Severity: `BLOCKING` (can produce the silent-outage class), `WARN`, `INFO`.
- Kind: `FACT`, `INFERENCE`, `UNKNOWN`.
- Then the assumption ledger statuses, if a ledger exists.
- Then the I/O inventory rows that traced clean (one line each) — so "clean" is visibly earned, not assumed.

## Language

Write the report in the user's language — the language of the user's request and conversation, **not** the language of these instructions. Do not translate file names, symbols, commands, statuses, or APIs.

## Completion criteria

The review is done only if:

- the I/O inventory is built and every row is traced or explicitly `UNKNOWN`;
- every finding carries `file:line` evidence or the `UNKNOWN` kind;
- the assumption ledger was checked when one exists;
- no code, config, or test was modified;
- the final status is exactly one of: `OPS_REVIEW_CLEAN`, `OPS_REVIEW_FINDINGS`, `OPS_REVIEW_BLOCKED`.
