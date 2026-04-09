# upgrade workflow

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
