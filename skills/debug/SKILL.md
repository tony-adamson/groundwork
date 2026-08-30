---
name: debug
description: "Disciplined diagnosis loop for hard bugs, flaky failures and performance regressions: build a feedback loop that goes red on this bug → minimise → rank hypotheses → instrument → fix with a regression test → clean up. Use when the user says debug/diagnose, or reports something broken, throwing, failing intermittently or slow, and the first read of the error did not fix it."
---

# Debug → root cause with a red-capable loop

Adapted from `diagnosing-bugs` (mattpocock/skills, MIT). Phases are gated: skip one only with an explicit reason in the chat.

The first error is handled by the global rule (read the message and the stack trace in full, fix). This skill starts when that did not work: the same error came back, the failure is intermittent, or the symptom is "slow" / "sometimes wrong".

## Hard boundaries

- Redact secrets in everything you show (`<REDACTED>`); build loops against env vars, never paste credentials.
- No fix before Phase 1 is done. Reading code to build a theory before a red-capable command exists is the failure this skill prevents.
- Production is not a lab: no instrumentation or replay against live systems without explicit confirmation; use read-only tools (`prod-ro-sql`, bounded logs) for facts.
- Reference codes: hypotheses are `H1…`, findings `F1…`; codes do not change during the session.

## Phase 1: build the feedback loop

**This is the skill.** A tight pass/fail signal that goes red on _this_ bug; everything after it is mechanical. Spend disproportionate effort here.

Ways to construct one, in roughly this order:

1. Failing test at whatever seam reaches the bug: unit, integration, e2e.
2. curl / HTTP script against a running dev server.
3. CLI invocation with a fixture input, diffed against a known-good output.
4. Headless browser script asserting on DOM / console / network.
5. Replay of a captured artifact: save a real request, payload or event log to disk and push it through the code path in isolation.
6. Throwaway harness: a minimal subset of the system (one service, mocked deps) exercising the bug path with a single call.
7. Property / fuzz loop (`hypothesis`, `fast-check`): for "sometimes wrong output", run hundreds of random inputs and look for the failure mode.
8. Bisection harness: if the bug appeared between two known states, automate "boot at state X, check" so `git bisect run` can drive it.
9. Differential loop: same input through old vs new version (or two configs), diff the outputs.
10. Human-in-the-loop script, last resort: a short script that tells the human exactly what to click and captures the output back.

Then tighten it: faster (skip unrelated init, narrow scope), sharper (assert the exact symptom, not "didn't crash"), deterministic (pin time, seed RNG, isolate filesystem, freeze network). A 2-second deterministic loop is a debugging superpower; a 30-second flaky one is barely better than none.

Non-deterministic bugs: the goal is a **higher reproduction rate**, not a clean repro. Loop the trigger 100×, parallelise, add stress, narrow timing windows. A 50 % flake is debuggable; 1 % is not.

If you genuinely cannot build a loop: stop, list what you tried, and ask for (a) access to an environment that reproduces it, (b) a redacted captured artifact (HAR, log dump, recording with timestamps), or (c) permission for temporary instrumentation. Do not hypothesise without a loop.

**Completion criterion** — one command, already run at least once (show the invocation and its redacted output), that is:

- red-capable: drives the real bug path and asserts the user's exact symptom;
- deterministic (or pinned at a high reproduction rate);
- fast: seconds, not minutes;
- agent-runnable without a human.

## Phase 2: reproduce and minimise

Run the loop, watch it go red. Confirm it fails with the symptom **the user described**, not a nearby one — wrong bug means wrong fix. Capture the exact symptom (message, wrong value, timing) for later verification.

Minimise: cut inputs, callers, config, data and steps **one at a time**, re-running after each cut, keeping only what is load-bearing. Done when removing any remaining element turns the loop green. The minimal repro shrinks the hypothesis space and becomes the regression test.

## Phase 3: hypothesise

Produce **3–5 ranked hypotheses** before testing any: single-hypothesis generation anchors on the first plausible idea. Each must be falsifiable — state its prediction: "If `H1` is the cause, then changing Y makes the bug disappear / changing Z makes it worse." No prediction — no hypothesis; discard or sharpen.

Show the ranked list to the user before testing. They often re-rank instantly ("we deployed #3 yesterday") or know what is already ruled out. Do not block on it: proceed with your ranking if there is no answer.

## Phase 4: instrument

Every probe maps to one prediction from Phase 3. Change one variable at a time.

Tool preference: debugger / REPL inspection when available (one breakpoint beats ten logs) → targeted logs at the boundaries that distinguish hypotheses → never "log everything and grep".

Tag every debug log with a unique prefix, e.g. `[DEBUG-a4f2]`, so cleanup is a single grep.

Performance regressions: logs are usually the wrong tool. Establish a baseline measurement (timing harness, profiler, query plan), then bisect. Measure first, fix second.

## Phase 5: fix with a regression test

Write the regression test **before the fix**, but only at a **correct seam**: one where the test exercises the real bug pattern as it happens at the call site. A seam that is too shallow (a single-caller unit test when the bug needs the chain of callers) gives false confidence.

If no correct seam exists, that is itself a finding: report it, the architecture prevents locking the bug down.

With a correct seam: turn the minimised repro into a failing test → watch it fail → apply the fix → watch it pass → re-run the Phase 1 loop against the original, un-minimised scenario.

The fix follows the global rules: minimal sufficient change, local patterns, no refactoring of unrelated code.

## Phase 6: clean up

Required before declaring done:

- the original repro no longer reproduces (Phase 1 loop re-run);
- the regression test passes, or the absence of a seam is documented;
- every `[DEBUG-…]` line is removed (grep the prefix);
- throwaway harnesses deleted or moved to a clearly marked debug location;
- the confirmed hypothesis is stated in the commit message, so the next debugger learns.

## Report

- First line: `DEBUG_FIXED` / `DEBUG_NO_LOOP` (could not build a loop; what was tried, what is needed) / `DEBUG_NO_SEAM` (fixed, regression test impossible at a correct seam).
- The loop command, the confirmed hypothesis code, the minimal repro, `git diff --stat`.
- Verification status honestly: what ran, what was skipped.

## Language

Write reports in the user's language — the language of the request, **not** of these instructions. Do not translate file names, symbols, commands or statuses.
