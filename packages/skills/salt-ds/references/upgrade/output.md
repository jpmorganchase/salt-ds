# output template

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
