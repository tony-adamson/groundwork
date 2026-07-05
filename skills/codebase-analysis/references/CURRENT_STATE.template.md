# Current state

> Remove all hints before finalizing. Do not fill sections for form's sake. Write in the user's language. Do not translate file names, symbols, commands, or APIs.
>
> Sections without a marker are the mandatory core. Fill sections marked `[IF: …]` only when the condition holds — otherwise delete the section entirely, with no `not applicable` and no empty tables.

# Block 1. For the human

## 1. Short conclusion

Briefly, 5–12 sentences:

- what this project is;
- which parts were actually analyzed;
- how the system works in broad strokes;
- which contracts matter most;
- which unknowns could affect a future task;
- whether the document can be used as input for `solution-design`.

## 2. System map in plain words

- Main parts of the system:
- Main entry points:
- Where state lives:
- How the system is verified:
- What was definitely not found or not confirmed:

## 3. Important constraints for future changes

- What must not be broken:
- Which existing patterns are better reused:
- Where new architecture should not be added without an explicit reason:
- Which questions will require a separate focused analysis:

**Status**: `CURRENT_STATE_COMPLETE` or `CURRENT_STATE_PARTIAL`

---

# Block 2. For the agent

## 1. Analysis metadata

- **Analysis root** (`pwd`):
- **Repository root**:
- **Git revision**:
- **Branch**:
- **Analysis date**:
- **User focus**:
- **Initial working tree status**:
- **Final working tree status**:
- **Changes attributable to this analysis**:
- **Repository graph status**: `graph used` / `graph generated and used` / `graph unavailable` / `graph stale` / `graph generation failed` / `graph not applicable`
- **Analysis limitations**:

## 2. System overview

For every material statement, state its type: `FACT`, `INFERENCE`, or `UNKNOWN`.

- Purpose of the system:
- Main scenarios:
- Technologies, languages, runtime:
- Build/package/release model:
- Overall architectural shape:

## 3. Repository structure

Do not list every file. Describe the main directories, modules, apps, packages, services, libraries, assets, schemas, build/config areas.

## 4. Applied analysis lenses

List the detected archetypes:

- mobile / frontend / backend / game / desktop / CLI / library / SDK / data / ML / infra / monorepo / mixed

For each lens: `applied`, `partially applied`, `not detected`, `unknown`.

## 5. Relevant components

For each important component:

### <component name>

- **Statement type**:
- **Responsibility**:
- **Key files**:
- **Key symbols**:
- **Dependencies**:
- **Consumers**:
- **Current behavior**:
- **Evidence**:
- **Unknowns**:

## 6. Entry points

| Entry point | Type | File / symbol | Trigger | Evidence |
|-------------|------|---------------|---------|----------|

## 7. Control flow

For the main flows:

### <flow name>

- Trigger:
- Component sequence:
- Side effects:
- Error handling:
- Completion point:
- Evidence:
- Unknowns:

## 8. Data/state flow [IF: the analyzed area has material state or data]

Describe only the state that exists:

- data sources;
- state ownership;
- transformations;
- storage/persistence/cache;
- synchronization/offline/network;
- transaction/lifecycle boundaries;
- derived state;
- places where loss/duplication/desync is possible;
- evidence.

## 9. Existing contracts

A contract can be UI/UX behavior, an API, a schema, a file format, CLI output, a save-game format, a rendering rule, a design token, accessibility behavior, a protocol, a build convention.

| Contract | Scope | Evidence | Consumers | Notes |
|----------|-------|----------|-----------|-------|

## 10. Existing invariants [IF: invariants confirmed by code, a test, or a schema were found]

| Invariant | Scope | Backing code/test/config | Consequence if violated | Type |
|-----------|-------|--------------------------|-------------------------|------|

## 11. Dependencies and integrations [IF: dependencies or integrations are relevant to the analysis focus]

| Dependency / integration | Purpose | Version | Config | Used at | Failure behavior | Evidence |
|--------------------------|---------|---------|--------|---------|------------------|----------|

## 12. Simplicity baseline

This section is mandatory. It exists so that future agents do not add unnecessary architecture.

- Existing simple extension points:
- Patterns the project already uses:
- Patterns the project explicitly does not use:
- Dependencies already available for reuse:
- New dependencies that would be unusual for this project:
- Where the project uses local state/logic instead of global architecture:
- Where future work must not be built without an explicit requirement:

## 13. Cross-cutting concerns [IF: there are applicable or materially unknown concerns]

| Concern | Lens | Current arrangement | Files / symbols | Evidence | Gaps |
|---------|------|---------------------|-----------------|----------|------|

## 14. Existing verification

- Existing tests:
- Typecheck/build/lint:
- Simulator/emulator/browser/device/manual smoke:
- CI/release checks:
- What was safely run:
- What was not run and why:
- Verification gaps:

## 15. Evidence index [IF: material statements reference Evidence IDs; with inline evidence only, delete the section]

| ID | Type | Statement | Evidence | Notes |
|----|------|-----------|----------|-------|

Type: `FACT`, `INFERENCE`, `UNKNOWN`.

## 16. Unknowns and limitations

| Unknown | Why unconfirmed | Affected area | What would confirm it |
|---------|-----------------|---------------|-----------------------|

## 17. Handoff for solution-design

- Analyzed scope:
- Most important contracts:
- Most important invariants:
- Simplicity constraints:
- Unknowns that could block the design:
- Recommended focused `codebase-analysis`, if needed:

**Status**: `CURRENT_STATE_COMPLETE` or `CURRENT_STATE_PARTIAL`
