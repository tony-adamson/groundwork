# Evidence policy

Every material statement about the current system must have a verifiable basis.

## Statement types

- `FACT` — directly confirmed by code, a test, a config, a schema, a manifest, a safe command, or repository documentation.
- `INFERENCE` — a reasonable conclusion drawn from several facts.
- `UNKNOWN` — no sufficient confirmation, or the sources conflict.

Do not use model confidence percentages.

## Acceptable sources

- a relative file path;
- a symbol: class/function/type/route/component/task/test/target/module;
- a test name;
- a schema/migration/file format;
- a manifest/build/config key;
- a CI workflow;
- a safe read-only command and its material output;
- documentation inside the repository, if it does not contradict the code.

## Conflicting sources

If the README says one thing and the code says another:

1. record the conflict;
2. state which source is stronger for the current behavior;
3. do not hide the outdated documentation;
4. do not silently pick the convenient version.

## Evidence index

All material statements in the agent block must reference an Evidence ID or inline evidence.

ID format: `E-001`, `E-002`, ...

## Forbidden

- presenting an inference as a fact;
- citing graphify as a source of truth;
- concluding production behavior from local code alone;
- treating a file not being found as proof, when the search was limited;
- turning a best practice into a fact about the project.
