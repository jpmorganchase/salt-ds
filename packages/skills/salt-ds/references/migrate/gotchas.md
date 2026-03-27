# common migration gotchas

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
