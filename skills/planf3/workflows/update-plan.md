# Update Plan

1. Find the target Markdown plan from the request.
2. Determine the exact scope of the change.
3. Edit only the affected sections.
4. If the change is material for implementation tasks, validation, scope, public behavior, operation semantics, state lifecycle, or minimality — reset the status to `DRAFT`.
5. Run the Plan Challenger and the Lean Plan Challenger.
6. Run `plan-readiness-gate.md`.
7. Set `READY_FOR_BUILD` only after PASS.
8. If a new solution decision is needed — `BLOCKED_FOR_SOLUTION_AMENDMENT`.
9. If the plan has become overbuilt — `BLOCKED_BY_SCOPE_OVERDESIGN`.
10. Add an entry to Amendments: date, what changed, why, readiness result.
11. Report the final status and the file path.
