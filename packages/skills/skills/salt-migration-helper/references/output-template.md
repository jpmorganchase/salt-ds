# output template

## migration summary

- State the source boundary, target boundary, and the main upgrade theme.
- State which post-migration source-level validation surface was used on the migrated result:
  - `analyze_salt_code`
  - `salt-ds review`
  - or still pending
- State whether `salt-ds doctor`, `salt-ds review <file-or-dir> --url <url>`, or `salt-ds runtime inspect <url>` was used as local evidence and whether the runtime check ran in browser-session mode or a fetched-HTML fallback.

## affected apis or patterns

- List what is affected, where it appears, and the canonical replacement or decision.
- Call out CSS overrides, selector hacks, or migration shims separately when they may no longer be needed after the upgrade.

## recommended actions

- List required changes first, optional cleanup second, and note any blockers or unknowns.
- Call out when a recommendation is a canonical Salt replacement versus a project-specific workaround.
- Note whether any project-specific workaround came from separate project conventions or repo convention rather than from the canonical Salt guidance.
- If token usage changes are involved, note whether the replacement also changes the expected token family or direct-use guidance.
- Ask explicitly whether leftover CSS overrides should be removed, retained temporarily, or validated once the migrated code is in place.

## risk notes

- Call out regression risks, testing focus, rollout concerns, or remaining unknowns.
- Note the risk of retaining obsolete overrides as well as the risk of removing overrides that still cover a real product gap.
- If runtime validation is still needed, say whether that is because CLI runtime evidence is unavailable or because the available fetched-HTML fallback is not enough for the risk in question.
