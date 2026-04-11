# clarifying questions

Ask only the few questions that change the Salt structure or package choice.

## good question types

- Scope: is this a single component, a panel section, or a full page?
- Interaction model: what are the primary actions, selection patterns, or editing flows?
- Data shape: what content density, column structure, or empty states must the UI support?
- Responsiveness: does the layout need distinct mobile, tablet, or desktop behavior?
- Constraints: is there a required Salt package, version boundary, accessibility requirement, or implementation constraint that changes the structure?

## example prompts

- "Is this intended to be a reusable component or a page-level layout?"
- "Should the primary interaction behave like selection, editing, navigation, or review?"
- "Do you need responsive behavior beyond simple stacking?"
- "Are there existing Salt primitives or packages that must be used or avoided?"

## avoid

- Long questionnaires.
- Questions that do not change the chosen primitives or structure.
- Asking for pixel-perfect detail when a reasonable Salt-first default is already clear.

## blocker-question mode

When one unresolved decision blocks the Salt direction:

- ask one question at a time
- say why it changes the structure or pattern choice
- provide your recommended default answer when possible
- if the codebase or repo context can answer it, inspect that first instead of asking the user
