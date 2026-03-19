# common migration gotchas

- Do not suggest changes without checking the version boundaries first.
- Prioritize breaking changes and deprecated usage before optional modernization.
- Prefer canonical replacements over ad hoc compatibility hacks.
- Distinguish required migration work from optional cleanup.
- Do not mix unrelated styling or refactor ideas into the mandatory upgrade path.
- If a replacement pattern changes structure, call out the ux and testing implications, not just the api rename.
- Keep the output scoped to the packages, files, and migration boundaries the user is actually working on.
