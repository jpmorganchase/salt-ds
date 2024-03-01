# Salt content style guide

Content written for Salt should follow this style guide. This includes component documentation, pattern guides and other website pages.

Use American English and follow general guidance for producing clear content—concise, active voice, second person, present tense.

## Guidance

Entries are listed in alphabetical order.

### Arrow keys

The correct terms for the four arrow buttons on a keyboard are:

- <kbd>Up arrow</kbd>
- <kbd>Down arrow</kbd>
- <kbd>Left arrow</kbd>
- <kbd>Right arrow</kbd>

### Best practices

Use as a section header where necessary to draw the reader's attention to recommended tips and guidance. Try not to skip levels when using section headers. See the section section below for more information.

"Best practices" is preferred to "guidance" as it provides greater clarity on what a reader can expect from the section, and provides greater differentiation from other parts of the section.

### Components

Write the term components in sentence case.

When referring to the component as a whole, use Pascal case wrapped in back ticks. Use the name of the component as it appears in code, i.e. `PillNext` rather than `Pill`.

It's likely you will need to use this version if:

- You are introducing the component in a document for the first time.
- You are recommending the component in a document where the component is not a primary subject.
- You are describing a release or new version of the component.
- You are describing how to import the component for use in a project.

When referring to an instance of a component, use sentence case. **If in doubt, use sentence case**.

Here is an example of a correctly-formatted sentence: "I see `Button` has just been released. My project has so many buttons."

### Foundations

Used when referring to the Salt foundations. Avoid the term if not referring to the Salt foundations (or foundations in another design system) to reduce confusion.

Write both the term foundation and the name of the foundation in sentence case, e.g. "Read more in the size foundation."

### Key combinations

Wrap individual keys in \<kbd> tags.

Remember that when using the `KeyboardControl` component to produce a table, the component adds these tags to keys in the function column. Don't worry about adding tags elsewhere in the table, as it would make the table very large and hard to read.

Place modifier keys, such as Shift, before other keys in a combination.

Use + to separate keys within a combination. Add a space to either side of +.

Use / to separate alternative keys or key combinations. Add a space to either side of /.

### Patterns

Used when referring to the Salt patterns. Avoid the term if not referring to the Salt patterns (or patterns in another design system) to reduce confusion.

Write both the term pattern and the name of the pattern in sentence case, e.g. "Refer to the button bar pattern."

### Prop

Use prop, do not use property. Wrap the prop in back ticks. Write out the statement in full to make the formatting clear.

- Correct: "Set `wrap={true}`"
- Incorrect: "Set the `wrap` prop to `true`"

Outline the simplest possible complete statement. When a user can use a prop with no values, such as `aria-hidden`, recommend the reader use it as-is, rather than passing a Boolean or a string value. When a user can pass a Boolean or string value, prefer Boolean where possible.

Refer to props using the definite article where appropriate, e.g., "Use the `disabled` prop."

### Salt

The name of the design system is Salt. You can describe Salt as a design system, i.e. "We used the Salt design system in our project."

Do not use Salt Design System, Salt DS, or SALT.

### Sections

Section levels should always follow a clear order—as an example, an H3 should follow an H2 or another H3. Refer to the [W3C guidance](https://www.w3.org/WAI/tutorials/page-structure/headings/) for more information.

### Space

Use <kbd>Space</kbd> to refer to the keyboard button. Use \<kbd> tags where appropriate. Don't use <kbd>Spacebar</kbd>.

### Tab

Use <kbd>Tab</kbd> to refer to the keyboard button. Use \<kbd> tags where appropriate. Avoid the term tabbing where possible.

Use tab order. Don't use tabbing order.
