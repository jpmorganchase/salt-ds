# View switching: list and card presentation

Status: implemented locally following the user's direction to proceed after the
forms review. This continues the content-led work in Unit 033/02a; existing
workflow readiness and release boundaries are unchanged.

## Decision

Use ToggleButtonGroup for a persistent, mutually exclusive choice between List
and Cards for the same records. Use Tabs for distinct content panels, and
NavigationItem for application destinations. SegmentedButtonGroup supplies layout
for related actions rather than a selected-value contract.

The canonical decision and its qualifications now live in
`site/docs/components/toggle-button/usage.mdx`, with links from Tabs, Segmented
button group and Choosing primitives. Keep future editorial changes there.

## Bounded implementation

- A small component example shares filter and record selection across list/card
  presentations. It has no backend or persistence contract.
- Standalone ToggleButtonGroup arrows focus and select the next or previous enabled
  option. Toolbar arrows continue to navigate without changing selection. This
  follows the [ARIA radio-group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/).
- Knowledge selects the canonical decision, alternatives and state/focus guidance
  through the existing standalone-guide mechanism. One evidence question asks for
  the same-record presentation decision and its qualifications.
- Focused browser journeys cover skip/wrap, controlled selection, read-only state,
  toolbar selection, retained example state and accessibility. They do not freeze
  screenshots or documentation wording.

## Limits and follow-up

The example starts with an enabled selected view and changes it through the view
controls. Two pre-existing ToggleButtonGroup entry-focus cases remain separate:
external value changes do not resynchronize its remembered tab stop, and an
initially selected disabled option can leave enabled options outside the tab order.
This slice does not claim complete keyboard conformance for those cases.

Remote loading, large collections and persistence across page visits remain
application concerns. Source review and local checks do not establish formal
manual accessibility approval or promote the operations workflow.
