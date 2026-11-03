# Salt content style guide

Content written for Salt should follow this style guide. This includes component documentation, pattern guides and other website pages.

Use American English and follow general guidance for producing clear content—concise, active voice, second person, present tense.

## Authoring best practices

Apply these practices whether you write the content yourself or use AI to help.
Establish the sources for technical claims before polishing the wording.

### Give the page a clear purpose

Identify what the reader needs to decide or do, and put the useful answer early.
Explain when to choose the component or pattern, the important alternatives, and
any limitations that affect that choice. Keep design intent, implementation setup
and other independently useful tasks in their own sections or linked pages.
Use only the sections needed for the task; a small correction does not require
rewriting the whole page.

### Check claims against their sources

Check API names, defaults, imports and behavior against the public types, exports
and implementation for the version being documented. Use the relevant design
guidance and accepted decisions to explain intended behavior and recommendations.
If these sources disagree, investigate and resolve the discrepancy; an
implementation bug should not silently become the documented contract.

Keep each kind of information in its maintained source: API descriptions with
the API, usage decisions in the relevant guide, and example code in its executable
source. Link to that information instead of maintaining another copy in agent
instructions. Explain hook and function arguments and return values directly
when a component props table does not describe them.

### Explain decisions, requirements and ownership

Distinguish a recommendation from a requirement, a default from an option, and a
component's capability from work the application must implement. Use "must" for
a requirement, and state the conditions that make it necessary. Explain who owns
state, validation, submission, focus or recovery when that affects correct use.

Keep prerequisites and qualifications beside the advice they constrain. Include
relevant providers, required parts, dependencies, licenses, versions, themes and
exceptions. A section should remain accurate when read on its own. Use descriptive
titles and summaries, and use aliases only for names that mean the same thing.

### Make examples honest and usable

Describe what the example actually demonstrates. For example, distinguish local
filtering of downloaded data from filtering performed by a service. State the
limits of a demonstration, such as local validation that does not submit data.

Use supported public package imports. Include or link the supporting files,
styles and dependencies that a reader needs; avoid unpublished package source,
stories and site-only helpers in copyable examples. A focused snippet may omit
surrounding code if the omissions are clear. A complete recipe needs the relevant
state, handlers and lifecycle behavior. Reuse the executable example source for
previews and code displays, and place it beside the guidance it demonstrates.

### Preserve meaning beyond the visual presentation

State a diagram's important relationships and instructions in text, including
the relevant components and tokens. Give informative images meaningful alt text
and use captions for additional explanation. Leave alt text empty for decorative
images.

When the checkout generates other documentation formats, inspect the changed
output as well as the website. Check that qualifications, diagram explanations,
examples, supporting files, links and anchors survive conversion. A successful
build alone does not establish that the meaning was preserved. Use the generator's
README and scripts in that checkout for its checks; new MDX components may need
conversion support. Keep substantive caveats when shortening or splitting content.

### Verify the change proportionally

Choose checks for the claim or behavior that changed:

| Change                                    | Useful evidence                                                                                |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Wording or links                          | Style, factual accuracy, working destinations and anchors.                                     |
| Usage recommendation                      | Relevant design guidance and supported public behavior.                                        |
| Example code                              | Types, imports and dependencies; exercise the interaction it claims to demonstrate.            |
| Focus, keyboard or accessibility guidance | Rendered semantics and the affected interaction, including the relevant transitions.           |
| Generated documentation, when present     | Generation checks and inspection of changed output; a focused fixture for a conversion change. |

Use existing checks and fixtures. Read commands from the current checkout rather
than assuming every branch has the same tooling. Follow the existing release
procedures for the artifact that carries the change. An agent evaluation can help
assess a consequential change to agent instructions; it is not a gate for every
wording edit.

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
