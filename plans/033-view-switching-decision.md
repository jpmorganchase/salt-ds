# View switching: first decision to review

Status: proposed content decision, following the form-control resolution. This is
not new canonical Salt policy or a new execution unit. Existing workflow readiness
and release boundaries are unchanged.

## Developer question

Users need to switch the same incident records between list and card presentations.
Which control should they use, and which state should survive the change?

## Proposed answer

Use ToggleButtonGroup for a persistent, mutually exclusive presentation choice.
Use visible List and Cards labels and give the group a name such as View. Keep the
chosen presentation selected; selecting it again should not leave the view unset.

Use Tabs when selecting a distinct content panel, such as an incident's Details,
Activity and History. Use NavigationItem for an application destination.
SegmentedButtonGroup groups related actions visually; it does not supply a selected
value or selection behavior by itself.

Switching presentation should preserve the query, filters, sort and selected
record where they remain applicable. The application owns this state. Keep focus
on the view control; a presentation switch should not unexpectedly move focus to
a record or trigger a save. Reuse existing Content status guidance if data changes.

## Evidence in current Salt

- `site/docs/components/toggle-button/index.mdx` describes a single related choice
  taking immediate effect and gives ToggleButtonGroup the Segmented control alias.
- `site/docs/components/toggle-button/usage.mdx` recommends mutually exclusive
  options when visual priority and visible options matter.
- `packages/core/src/toggle-button-group/ToggleButtonGroup.tsx` owns one value and
  emits changes only for a different value. The group has radiogroup semantics;
  grouped ToggleButtons have radio/aria-checked semantics.
- `site/docs/components/tabs/usage.mdx` describes logically related content panels.
- `packages/core/src/segmented-button-group/SegmentedButtonGroup.tsx` supplies
  layout/styling rather than a selected-value contract.

## First bounded implementation after the decision is settled

1. Add the criterion and alternatives to Toggle button/Tabs usage and the existing
   Choosing primitives guide; cross-link the canonical sections.
2. Add one small list/card example using the same records and application state.
   Reuse current components and content-status guidance.
3. Verify keyboard operation, selected semantics, focus and retained filters through
   that interaction, then add one source-backed Knowledge question. Assert decision
   evidence, not an exact generated answer or a screenshot snapshot.

## Open review points

Confirm the proposed Salt preference for same-data presentation changes. Also check
keyboard behavior before endorsing the example: the current ToggleButtonGroup arrow
keys move focus without changing its selected value, and Enter/Space select. The [ARIA radio-group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)
expects arrow keys to change selection outside a toolbar. Resolve that difference
before endorsing a standalone view switcher; it is a separate keyboard contract
from the completed invalid-state work.
