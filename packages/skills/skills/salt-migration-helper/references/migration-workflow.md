# migration workflow

## 1. establish the boundaries

- Find the current Salt version, the target version, and the packages in scope.
- Use user input, package manifests, lockfiles, or explicit code references when available.
- Do not guess across version ranges if the boundary materially affects the advice.
- If the source UI is not Salt-based yet, use `translate_ui_to_salt` first to plan Salt adoption; this workflow is for Salt-native upgrade and modernization work once the target structure is in Salt.
- If the user expects runtime validation, identify whether there is a usable Storybook or app URL and whether the Salt CLI is available in the consumer environment.

## 2. map the upgrade impact

- Use `compare_salt_versions` to identify breaking changes, behavior changes, and deprecations between the versions in scope.
- Separate required changes from informational changes early.

## 3. inspect the code

- Use `analyze_salt_code` to locate deprecated usage, invalid patterns, obvious fix opportunities, and CSS overrides that may no longer be needed in the affected code.
- Group findings by api, pattern, or package rather than by raw file-by-file noise.
- Note any CSS modules, style blocks, token overrides, or selector hacks that appear to compensate for old Salt behavior.

## 4. choose canonical replacements

- Use `get_salt_entity` for current guidance and `get_salt_examples` when the replacement pattern is not obvious.
- Prefer documented replacements over compatibility shims or project-specific workarounds.
- Keep canonical Salt replacements separate from repo-specific project conventions or compatibility conventions.
- If the migration changes token usage, validate the replacement token family and direct-use rules against the canonical token policy rather than carrying old styling choices forward.
- If CSS overrides exist, check whether the target Salt API, pattern, or token change removes the reason for the override.
- If a custom compatibility layer is still needed, state why the canonical replacement is insufficient and keep the workaround clearly scoped.

## 5. plan the migration

- List required code changes first.
- Then list optional cleanup or modernization tasks that can be handled separately.
- Highlight CSS overrides and migration shims as a separate decision, and ask whether they should be removed now, retained temporarily, or validated after the code migration lands.
- If runtime evidence is needed to decide on cleanup, plan a before and after `salt-ds review <file-or-dir> --url <url>` pass around the migrated state.
- Call out testing areas, interaction changes, and rollout risks.

## 6. validate the migrated result

- After the first migration pass, run `analyze_salt_code` again on the migrated Salt code when updated code is available.
- Confirm whether deprecated usage is gone and note any remaining primitive, composition, token, or styling issues.
- If CSS overrides remain, state whether they still appear justified or should be removed.
- If rendered structure or remaining overrides are still uncertain and the Salt CLI is available, run `salt-ds doctor` when runtime target confidence is low and `salt-ds review <file-or-dir> --url <url>` on the relevant before URL, after URL, or both.
- Prefer browser-session evidence when available, and treat `fetched-html` fallback output as narrower evidence for structure, landmarks, and accessible names.

## 7. return the result

- Summarize the migration, enumerate affected apis or patterns, recommend the next actions, note the main risks, and include the post-migration validation outcome.

## runtime-assisted examples

### MCP-unavailable fallback example

- If Salt MCP is unavailable but the Salt CLI is available, keep the same upgrade workflow and let the CLI provide fallback canonical guidance underneath.
- Establish the version boundary first, inspect the current code, make the migration changes, then run `salt-ds review <file-or-dir>` on the updated code.
- Only if rendered structure, landmarks, or leftover cleanup are still uncertain, use `salt-ds doctor` and `salt-ds review <file-or-dir> --url <url>` before deciding whether risky overrides or shims can be removed.
- In the final response, state clearly that canonical Salt guidance came from the fallback path because MCP was unavailable, and keep runtime evidence separate from that canonical guidance.

### before-and-after browser-session example

- Run `salt-ds review <file-or-dir> --url <before-url>` before the migration when you need baseline evidence for rendered structure or runtime failures.
- Make the migration changes and re-run `analyze_salt_code`.
- Run `salt-ds review <file-or-dir> --url <after-url>` on the migrated page.
- If both inspections use `browser-session`, compare:
  - runtime/page errors
  - screenshots or rendered structure summaries
  - landmarks, roles, and accessible names
- Use that evidence to decide whether remaining CSS overrides or shims still appear necessary.

### fetched-html fallback example

- If either pass falls back to `fetched-html`, do not treat the result as full proof that a CSS override or shim is safe to delete.
- Use fallback output only for narrower claims about:
  - page title or load status
  - landmark and role summaries
  - coarse structure differences before and after the migration
- If the cleanup decision is risky, ask for browser-session inspection or wider manual validation before removing the override or shim.
