# migration workflow

## 1. establish the boundaries

- Find the current Salt version, the target version, and the packages in scope.
- Use user input, package manifests, lockfiles, or explicit code references when available.
- Do not guess across version ranges if the boundary materially affects the advice.
- If the source UI is not Salt-based yet, use `translate_ui_to_salt` first to plan Salt adoption; this workflow is for Salt-native upgrade and modernization work once the target structure is in Salt.

## 2. map the upgrade impact

- Use `compare_salt_versions` to identify breaking changes, behavior changes, and deprecations between the versions in scope.
- Separate required changes from informational changes early.

## 3. inspect the code

- Use `analyze_salt_code` to locate deprecated usage, invalid patterns, and obvious fix opportunities in the affected code.
- Group findings by api, pattern, or package rather than by raw file-by-file noise.

## 4. choose canonical replacements

- Use `get_salt_entity` for current guidance and `get_salt_examples` when the replacement pattern is not obvious.
- Prefer documented replacements over compatibility shims or project-specific workarounds.
- Keep canonical Salt replacements separate from repo-specific project conventions or compatibility conventions.
- If the migration changes token usage, validate the replacement token family and direct-use rules against the canonical token policy rather than carrying old styling choices forward.
- If a custom compatibility layer is still needed, state why the canonical replacement is insufficient and keep the workaround clearly scoped.

## 5. plan the migration

- List required code changes first.
- Then list optional cleanup or modernization tasks that can be handled separately.
- Call out testing areas, interaction changes, and rollout risks.

## 6. return the result

- Summarize the migration, enumerate affected apis or patterns, recommend the next actions, and note the main risks.
