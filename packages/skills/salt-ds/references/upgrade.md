# Salt DS — Upgrade Reference

## Upgrade Rules

Use this file only for `upgrade` work after project context is known.

## Priority Order

1. version boundary
2. required change
3. canonical replacement
4. validation of updated code
5. optional cleanup and modernization

## Critical Rules

- establish the current Salt version, target version, and packages in scope before suggesting changes
- treat breaking changes, deprecated usage, and behavior changes as required work before optional cleanup
- obtain canonical Salt guidance through MCP or CLI before proposing Salt-specific replacements
- keep canonical replacement guidance separate from repo-local conventions, shims, or wrappers
- when updated code is available, validate the changed result through the review workflow before treating the upgrade as complete
- treat custom CSS overrides, selector hacks, and compatibility wrappers as suspect until the target Salt API proves they are still needed
- do not mix unrelated redesign work into the mandatory upgrade path unless the user explicitly asks for modernization beyond the version move
- if the upgrade output is partial, noisy, or truncated, use `references/shared/degraded-tooling.md` and fail closed rather than guessing the replacement path

## Decision Rule

Separate findings into:

- required now
- safe optional cleanup
- validation still needed

Do not blur those categories in the final recommendation.

---

## upgrade workflow

## 1. establish the boundary

- Find the current Salt version, target version, and the packages in scope.
- Use manifests, lockfiles, import usage, or explicit user input when available.
- Do not guess across version ranges when the boundary affects the recommendation.
- If the source UI is not Salt-based yet, this is not an upgrade workflow; use `migrate` first.

## 2. identify upgrade impact

- Use `upgrade_salt_ui` or `salt-ds upgrade` to identify breaking changes, behavior changes, deprecations, and recommended replacements.
- Separate required changes from informational changes early.

## 3. inspect the affected code

- Use `review_salt_ui` or `salt-ds review` to find deprecated usage, invalid patterns, obvious fix opportunities, and custom styling that may no longer be needed.
- Group findings by API, pattern, package, or theme/bootstrap decision rather than by noisy file order.

## 4. choose canonical replacements

- Prefer documented Salt replacements over compatibility shims or project-specific workarounds.
- If a replacement direction is still unclear after the workflow pass, read the returned sources and related guides before reaching for bespoke implementation.
- If theme or provider guidance changes across versions, confirm whether repo policy or asset availability changes the safe path.

## 5. plan the upgrade

- List required code changes first.
- Then list optional cleanup or modernization tasks that can be handled separately.
- Call out CSS overrides, wrappers, or theme shims as explicit keep/remove/validate decisions.

## 6. validate the upgraded result

- After the first upgrade pass, run the review workflow again on the updated Salt code when it is available.
- Confirm whether deprecated usage is gone and note any remaining primitive, composition, token, or styling issues.
- Add runtime evidence only when source review still leaves an important gap.

## 7. return the result

- Summarize the version boundary, the required changes, the optional cleanup, the validation outcome, and any remaining risks.

---

## output template

## upgrade summary

- State the source boundary, target boundary, and the main upgrade theme.
- State whether the result covers required changes only or also includes optional cleanup.
- State which post-upgrade validation surface was used:
  - `review_salt_ui`
  - `salt-ds review`
  - or still pending

## required changes

- List what is affected, where it appears, and the canonical replacement or decision.
- Call out deprecated APIs, pattern shifts, theme/provider changes, and CSS overrides separately when they materially affect the upgrade.

## optional cleanup

- List cleanup or modernization that is safe to separate from the version move.
- Mark clearly when an item is nice-to-have rather than required.

## risk notes

- Call out regression risks, testing focus, rollout concerns, and remaining unknowns.
- If validation is still pending, say exactly what remains unverified.

## compliance checks

- State that the version boundary was established before recommending changes.
- State whether canonical Salt upgrade guidance was obtained through MCP or CLI.
- State whether updated code was revalidated after the first upgrade pass.
- Note whether repo conventions affected the recommendation or only the implementation detail.

---

## common upgrade gotchas

- Do not suggest changes without checking the version boundary first.
- Prioritize breaking changes and deprecated usage before optional modernization.
- Prefer canonical replacements over ad hoc compatibility hacks.
- Distinguish required upgrade work from optional cleanup.
- Do not stop after planning the upgrade if updated code is available; validate the upgraded result with the review workflow.
- Treat legacy CSS overrides and selector hacks as suspect until the target Salt API proves they are still needed.
- Do not overclaim from partial or noisy upgrade output.
- Do not let generic rendering success override an incomplete Salt upgrade contract.
