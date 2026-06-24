# Salt DS — Migrate Reference

## Migration Rules

Use this file only for `migrate` work after project context is known.

## Priority Order

1. preserve user task flow
2. preserve key interaction anchors and critical states
3. move the result toward canonical Salt structure
4. apply repo conventions only after the Salt direction is clear
5. use runtime scoping only when the current experience needs confirmation

## Critical Rules

- obtain canonical Salt guidance via MCP or CLI before choosing Salt replacements, migration targets, or Salt-specific code
- preserve familiarity through task flow, action order, landmarks, and states
- allow Salt-native visual and compositional changes
- do not clone the previous visual system
- treat named external libraries as hints about source shape, not as hardcoded migration rules
- call out confirmation-required workflow changes explicitly

## Stable Rule IDs

- `migrate-preserve-task-flow`
  - preserve the user task flow, action order, and main outcome through migration
- `migrate-preserve-interaction-anchors`
  - preserve the key interaction anchors, landmarks, and critical states users rely on
- `migrate-move-toward-canonical-salt`
  - move the result toward canonical Salt patterns and primitives instead of cloning the previous system
- `migrate-apply-conventions-after-canonical`
  - apply wrappers and local shells only after the Salt direction is clear
- `migrate-use-runtime-for-current-experience`
  - use runtime evidence when current landmarks, action hierarchy, or visible states must stay familiar
- `migrate-confirm-workflow-deltas`
  - call out workflow changes that need explicit confirmation instead of treating them as silent migration output

## Migration Loop

0. Obtain canonical Salt guidance via MCP (`migrate_to_salt` or `upgrade_salt_ui`) or CLI (`salt-ds migrate` or `salt-ds upgrade`) before proposing Salt-specific migration output.
1. Read the migration familiarity contract and scope first.
2. Answer the migration questions before treating the first scaffold as final.
3. Use delta categories to explain the kind of change being proposed.
4. Use `migrate --url` when current runtime structure or state visibility matters.
5. After edits, use post-migration verification to confirm preserved intent.

## Ask Instead Of Guess

- it is unclear what must remain familiar to existing users
- action hierarchy or workflow order might change
- critical states are not obvious from source alone
- runtime scoping is needed to understand landmarks, structure, or state visibility
- repo policy could force a wrapper or shell that changes the final implementation path

## Degraded-Transport Rule

If migrate tooling is partial or noisy, preserve the familiarity contract and visible task-flow anchors, but do not finalize the migrated Salt structure until the unresolved canonical questions are answered.

---

## migration workflow

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

---

## output template

## migration summary

- State the source boundary, target boundary, and the main upgrade theme.
- State which post-migration source-level validation surface was used on the migrated result:
  - `review_salt_ui`
  - `salt-ds review`
  - or still pending
- State whether `salt-ds doctor`, `salt-ds review <file-or-dir> --url <url>`, or `salt-ds runtime inspect <url>` was used as local evidence and whether the runtime check ran in browser-session mode or a fetched-HTML fallback.

## affected apis or patterns

- List what is affected, where it appears, and the canonical replacement or decision.
- Call out CSS overrides, selector hacks, or migration shims separately when they may no longer be needed after the upgrade.

## recommended actions

- List required changes first, optional cleanup second, and note any blockers or unknowns.
- Call out when a recommendation is a canonical Salt replacement versus a project-specific workaround.
- Note whether any project-specific workaround came from declared repo policy rather than from the canonical Salt guidance.
- If token usage changes are involved, note whether the replacement also changes the expected token family or direct-use guidance.
- Ask explicitly whether leftover CSS overrides should be removed, retained temporarily, or validated once the migrated code is in place.

## risk notes

- Call out regression risks, testing focus, rollout concerns, or remaining unknowns.
- Note the risk of retaining obsolete overrides as well as the risk of removing overrides that still cover a real product gap.
- If runtime validation is still needed, say whether that is because CLI runtime evidence is unavailable or because the available fetched-HTML fallback is not enough for the risk in question.

---

## common migration gotchas

- Do not suggest changes without checking the version boundaries first.
- Prioritize breaking changes and deprecated usage before optional modernization.
- Prefer canonical replacements over ad hoc compatibility hacks.
- Distinguish required migration work from optional cleanup.
- Do not stop after planning the migration if updated code is available; validate the migrated result with `review_salt_ui` again.
- Treat legacy CSS overrides and selector hacks as suspect until the target Salt API proves they are still needed.
- Do not mix unrelated styling or refactor ideas into the mandatory upgrade path.
- If a replacement pattern changes structure, call out the ux and testing implications, not just the api rename.
- Keep the output scoped to the packages, files, and migration boundaries the user is actually working on.
- Do not overclaim from screenshots or mockups. If image-derived evidence is low confidence or conflicts with runtime evidence, keep the result provisional and ask for confirmation before implementation.
- Do not treat raw image attachments as direct Salt inputs. Normalize them into structured outline evidence first, or fall back to `--source-outline`.
