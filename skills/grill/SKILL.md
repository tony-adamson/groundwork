---
name: grill
description: "Interviews the user until the task is understood in detail, before any design: works the decision tree in rounds, finds facts itself, puts every decision to the user, and records each answer verbatim in GRILL.md. Use only when the user explicitly asks to run grill. Does not design, plan, or write code."
disable-model-invocation: true
---

# Grill → GRILL.md

Adapted from `grilling` and `domain-modeling` (mattpocock/skills, MIT).

A design built from a three-sentence task is the model's guess, and no amount of review fixes a wrong input. This skill runs before `solution-design` and turns the task into decisions the user actually made. `solution-design` then synthesises from them instead of inventing them.

The skill creates or updates `GRILL.md` in the directory returned by `pwd`. The file is the record `solution-design` and `planf3` rely on, so it can be read in a later session; running `solution-design` in the same session is still better, because it keeps what the user said in passing.

## Hard boundaries

You may modify only `GRILL.md`, plus throwaway prototypes in the scratchpad.

Forbidden:

- answering a decision on the user's behalf, including by "a reasonable default";
- designing, choosing an architecture, writing `SOLUTION.md`, a plan, or code;
- turning an open decision into an assumption to keep moving;
- asking the user for a fact you can look up.

## Start

1. Run `pwd`, read the local instructions, and read `CURRENT_STATE.md` if it exists.
2. Write the task into `GRILL.md` verbatim, as the user gave it.
3. If `GRILL.md` already exists for this task, continue its frontier instead of starting over.

## Rounds

Map the task as a **decision tree**: every decision branches into the decisions that hang off it.

- The **frontier** is every decision whose prerequisites are settled. Ask the whole frontier in one round, then wait for the answers.
- A question that depends on another question still open in this round belongs to a later round.
- Every question carries a code (`ВОПРОС-1` in Russian — a word in the user's language plus a number) and your recommended answer with its reason. Codes do not change during the session. A reply like `ВОПРОС-1 ок, ВОПРОС-2: <answer>` is a complete answer; case and a space instead of the hyphen do not matter.
- Format of one question:

  ```
  **ВОПРОС-N. <title>**
  <the question, with the choices if there are any>
  ➡️ <recommended answer and why>
  ```

- Cover what the design will need: who uses it and for what, the observable outcome, what is explicitly out, existing behavior that must survive, data and its owner, failure and edge behavior, limits the user already knows, who accepts the work and what they want to see first.

## Where an answer lives

Route every open point by where its answer is:

| The answer is… | Do this |
|---|---|
| in the code, docs, or `CURRENT_STATE.md` | read it yourself or send a read-only subagent; record the fact with `file:line` |
| in external docs or an API | a read-only research pass against primary sources (official docs, source code, specs); every claim cites its source |
| in the user's head | ask it in the round |
| in someone else's head | write the questions for that person into `GRILL.md` under "Waiting on others" and tell the user who to ask |
| nowhere yet ("how should this feel", "does this state model hold") | propose a throwaway prototype in the scratchpad; the user looks at it, and the one-line answer returns to the interview as a normal answer |

Do not block the round on a running fact search: only the questions downstream of it wait.

## Sharpen against reality

- When the user's words contradict the code, say so with `file:line` and ask which is right: "The code cancels whole orders, you said partial cancellation is possible — which is it?"
- When one word could mean two things, name both and ask.
- Invent concrete scenarios at the edges (the empty case, the repeat, the concurrent case, the forbidden action) and ask what happens.
- If the user names a reference system, read its code for every surface the task touches and ask about each place the task seems to differ from it.

## GRILL.md

Written in the user's language, updated after every round:

```
# GRILL: <short task name>

Task (verbatim): <the user's words>
Status: IN_PROGRESS | CONFIRMED <date> — "<the user's confirming words>"

## Decisions
### ВОПРОС-N. <title>
- Question: …
- Recommended: …
- Answer (verbatim): …
- Why (verbatim, if the user said it): …
- Rejected: <options the user turned down>

## Facts
- <fact> — `file:line` or source URL

## Terms
**<term>**: what it is, in one or two sentences. Not to be confused with: …

## Out of scope (user's words)

## Waiting on others / prototypes
```

A decision exists only as the user's answer. Never write an answer the user did not give.

## Done

The interview is done when the frontier is empty — every branch visited, nothing left silently assumed — **and** the user confirms in so many words that you share the same understanding. Ask for that confirmation explicitly; then set `Status: CONFIRMED` with their words.

There is no limit on questions. If the rounds keep growing, the task is too large: say so and propose splitting it, then grill each part.

If the user stops early, record `Status: STOPPED` and list the open frontier; `solution-design` treats those points as unknowns, not as decisions.

## Language

`GRILL.md` and the questions are in the user's language. Do not translate file names, symbols, commands, statuses, or APIs.

## Completion

Once the status is `CONFIRMED`, the last line of the answer names `solution-design` as the next step, in the user's language; otherwise the answer ends with the next round of questions.
