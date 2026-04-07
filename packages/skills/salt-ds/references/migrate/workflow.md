# migration workflow

## 1. establish the boundaries

- Find the current Salt version, the target version, and the packages in scope.
- Use user input, package manifests, lockfiles, or explicit code references when available.
- Do not guess across version ranges if the boundary materially affects the advice.
- If the source UI is not Salt-based yet, use `migrate_to_salt` first to plan Salt adoption; this workflow is for Salt-native upgrade and modernization work once the target structure is in Salt.
- If the user expects runtime validation, identify whether there is a usable Storybook or app URL and whether the Salt CLI is available in the consumer environment.
- If screenshots or mockups are involved, normalize them into structured outline evidence before the canonical Salt migrate step. Do not treat raw image attachments as direct MCP inputs.

## 2. map the upgrade impact

- Use `upgrade_salt_ui` to identify breaking changes, behavior changes, and deprecations between the versions in scope.
- Separate required changes from informational changes early.

## 3. inspect the code

- Use `review_salt_ui` to locate deprecated usage, invalid patterns, obvious fix opportunities, and CSS overrides that may no longer be needed in the affected code.
- Group findings by api, pattern, or package rather than by raw file-by-file noise.
- Note any CSS modules, style blocks, token overrides, or selector hacks that appear to compensate for old Salt behavior.

## 4. choose canonical replacements

- Use `migrate_to_salt`, `upgrade_salt_ui`, and `review_salt_ui` as the public workflow path for current guidance and replacement direction.
- If the replacement pattern is still unclear after the workflow pass, read the returned sources and related guides before reaching for implementation-specific helpers.
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

- After the first migration pass, run `review_salt_ui` again on the migrated Salt code when updated code is available.
- Confirm whether deprecated usage is gone and note any remaining primitive, composition, token, or styling issues.
- If CSS overrides remain, state whether they still appear justified or should be removed.
- If rendered structure or remaining overrides are still uncertain and the Salt CLI is available, use `references/shared/transport.md` to choose `salt-ds doctor`, `salt-ds review <file-or-dir> --url <url>`, `salt-ds migrate <query> --url <url>`, or `salt-ds migrate [query] --source-outline <path>`.
- Prefer browser-session evidence when available, and treat `fetched-html` fallback output as narrower evidence for structure, landmarks, and accessible names.

## 7. return the result

- Summarize the migration, enumerate affected apis or patterns, recommend the next actions, note the main risks, and include the post-migration validation outcome.
