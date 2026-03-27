# Migration Rules

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
