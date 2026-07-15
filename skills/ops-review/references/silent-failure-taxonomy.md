# Silent-failure taxonomy

Apply each category to every I/O inventory row. A category "passes" only with `file:line` evidence; otherwise the row gets an `UNKNOWN` finding. Skip a category only when it structurally cannot apply (e.g. no mutation → idempotency is irrelevant), not because the code "looks fine".

## 1. Time

- Every network, database, subprocess, and lock-acquisition call has an explicit, finite wait bound. Trace the actual setting: client constructor argument, config file, framework default that is documented and finite.
- Connect timeout and read/response timeout are separate concerns; a connect timeout alone does not bound a stalled response.
- Library defaults: many popular clients default to **no timeout** (infinite wait). "The default is probably fine" is `UNKNOWN`.
- End-to-end budget: an inbound request that fans out to N calls with timeout T can wait N×T; check the sum against the server/gateway timeout in front of it.

## 2. Resources

- For every acquired connection, session, cursor, file handle, subprocess, temp file: find the release on the success path, **every error path**, and the cancellation path. `with`/`defer`/`finally`-style scoping counts as evidence; a manual `close()` after a call that can raise does not.
- Pool sizing: max pool size versus expected concurrent workers/requests. A pool of 5 behind 50 workers means 45 workers queue silently — the exact "no errors, server not responding" shape.
- Pool exhaustion behavior: does acquiring from an exhausted pool fail fast, wait bounded, or wait forever? Forever is `BLOCKING`.
- Keep-alive/TCP: long-lived connections through NAT/LB — is there a keep-alive or max-lifetime setting, or do half-dead connections accumulate?

## 3. Boundedness

- Queries without `LIMIT`/pagination on tables that grow with users or time.
- In-memory collections fed by external input: request bodies, uploaded files, message batches, caches without eviction, queues without max length.
- N+1: a loop body containing an I/O call whose iteration count comes from data size.
- Fan-out: one inbound event triggering per-item outbound calls without batching or concurrency limit.

## 4. Repeat and concurrency

- Retries: bounded attempts, backoff (ideally with jitter), and only on retryable errors. Retry-on-timeout against a slow dependency multiplies load exactly when the dependency is drowning.
- Idempotency: every mutating operation that can be retried (by code, by client, by infrastructure) — what happens on the second delivery? Duplicate rows, double charges, double sends are the classic answers.
- Shared state touched by concurrent workers: what serializes the access? Optimistic check-then-act without a transaction or lock is a finding.
- Locks: acquisition ordered consistently, held across I/O only when unavoidable, with a bounded wait.

## 5. Degradation

The incident-defining category: the dependency does not fail — it slows down.

- Model it explicitly: "the database answers in 30 s instead of 30 ms — what happens?" Trace the answer: workers block → pool drains → inbound requests queue → server stops responding with **zero errors logged**.
- Bulkheads: does one slow dependency consume the whole worker pool, or is its concurrency capped separately?
- Shedding: when saturated, does the service fail fast (503, queue rejection) or accept work it cannot finish?
- Startup/shutdown: does the service come up healthy when a dependency is down, and does shutdown release in-flight resources?

## 6. Evidence discipline

- `FACT` — traced to code/config at `file:line`.
- `INFERENCE` — follows from a fact plus documented behavior; name both.
- `UNKNOWN` — could not trace; state exactly what artifact would settle it (config file, library docs section, one targeted test).
- Never average severities: one `BLOCKING` `UNKNOWN` on the hot path outweighs any number of clean rows.
