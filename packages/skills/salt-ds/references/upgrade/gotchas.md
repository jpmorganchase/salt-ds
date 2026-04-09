# common upgrade gotchas

- Do not suggest changes without checking the version boundary first.
- Prioritize breaking changes and deprecated usage before optional modernization.
- Prefer canonical replacements over ad hoc compatibility hacks.
- Distinguish required upgrade work from optional cleanup.
- Do not stop after planning the upgrade if updated code is available; validate the upgraded result with the review workflow.
- Treat legacy CSS overrides and selector hacks as suspect until the target Salt API proves they are still needed.
- Do not overclaim from partial or noisy upgrade output.
- Do not let generic rendering success override an incomplete Salt upgrade contract.
