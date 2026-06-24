# Docs IA and Template Proposal

This proposal focuses on the structure of Salt documentation pages, not the
component category map in [component-ia-proposal.md](./component-ia-proposal.md).

The goal is to make the docs better for:

- designers choosing the right pattern or component
- engineers implementing Salt correctly
- maintainers keeping guidance consistent
- search and retrieval systems that need strong decision-oriented source data

## Current state

### Components

Component pages are currently example-first and tabbed:

- `Examples`
- `How to use`
- `Accessibility`

The top-level component `index.mdx` mostly acts as a metadata shell. The page
heading already exposes description, aliases, package info, and source/design
links, but high-value guidance is split across the heading, the `How to use`
tab, and right-sidebar links.

This means key questions are not answered quickly enough:

- what is this for?
- when should I use it?
- when should I not use it?
- what should I choose instead?
- what is related?

### Patterns

Pattern pages are long-form, single-page guides. They are often richer than
component pages, but they are also less predictable and harder to scan quickly.

Patterns already contain strong guidance, but too much of it is buried in the
body rather than surfaced in a consistent decision layer near the top.

### IA problem

The overall IA is asymmetric:

- components are tabbed and example-led
- patterns are narrative and guide-led

That makes the system harder to browse and harder to learn. It also weakens
decision support because sibling comparisons and scope guidance are not treated
as first-class content.

## Proposal

### 1. Add a real `Overview` page to every component

This is the highest-value IA change.

Do not use `index.mdx` as mostly hidden metadata. Turn it into the main
decision-making landing page for the component.

Recommended component tabs:

- `Overview`
- `Examples`
- `Usage`
- `Accessibility`

### 2. Change what belongs in `Overview`

`Overview` should answer the fast selection questions first.

Required sections:

- `What it is`
- `Anatomy` or `Key parts`
- `Use when`
- `Do not use when`
- `Choose instead`
- `Related components`
- `Related patterns`
- `States and variants` summary

Optional sections:

- `Package and status`
- `Also known as`
- `Implementation notes` summary

The top-level decision summary should be readable in under a minute.

### Anatomy on `Overview`

Yes, anatomy belongs on `Overview` for many components.

Right now, the structure of many components has to be inferred from examples or
from import statements in `Usage`, which is too indirect.

The important refinement is that `Overview` should contain a light anatomy
layer, not a full implementation guide.

Recommended rule:

- simple components can omit anatomy or use a short `Key parts` section
- compound components should show anatomy on `Overview`
- `Usage` can hold deeper structural and behavioral guidance

Good candidates for `Overview` anatomy:

- `Dialog`
- `Accordion`
- `Tabs`
- `Menu`
- `Tree`
- `Pagination`
- `Date picker`

Poor candidates for heavy anatomy treatment:

- `Spinner`
- `Divider`
- `Icon`

For components, anatomy should usually be:

- a numbered parts list
- a small annotated visual where useful
- one-sentence role descriptions for each part

The goal is quick orientation, not full composition instruction.

### 3. Narrow the role of `Usage`

Do not move all usage guidance into `Overview`.

Instead, split it:

- `Overview` handles selection and sibling comparison
- `Usage` handles deeper implementation guidance

`Usage` should focus on:

- behavior rules
- layout/composition notes
- content guidance
- import and props
- advanced usage notes
- references

### 4. Add stronger top-of-page summaries to patterns

Patterns do not necessarily need tabs, but they do need a more structured top
layer.

Every pattern should have a predictable top section that answers:

- what problem does this solve?
- what scope does it own?
- when should I use it?
- when should I not use it?
- what should I choose instead?

Recommended pattern summary block near the top:

- `Problem it solves`
- `Scope and ownership`
- `Use when`
- `Do not use when`
- `Choose instead`
- `Key components`

The long-form guide can remain below that.

## Template changes

### Component template

Recommended component template structure:

1. `index.mdx`
   - description
   - `Use when`
   - `Do not use when`
   - `Choose instead`
   - related components/patterns
   - states/variants summary
2. `examples.mdx`
3. `usage.mdx`
   - deeper behavior/content/layout guidance
   - import
   - props
   - references
4. `accessibility.mdx`

### Pattern template

Recommended pattern structure:

1. introduction
2. decision summary block
3. anatomy
4. layout/build order
5. variants
6. behaviors
7. resources/feedback

Patterns should also gain a more explicit `Choose instead` section where
relevant.

## Pattern page experience

The current pattern model is good at long-form explanation but weak at making
examples feel integrated and actionable.

The main problem is not that patterns lack examples. It is that example types
are fragmented:

- some things are diagrams
- some things are screenshots
- some things are Storybook links
- a few things are live previews

That makes patterns feel inconsistent and less “real” than component pages.

### Recommended pattern IA

If you are open to a larger IA change, I would move patterns toward a more
structured page shape:

1. `Overview`
   - problem it solves
   - scope and ownership
   - use when
   - do not use when
   - choose instead
   - key components
2. `Anatomy and build`
   - anatomy
   - layout
   - required regions
   - optional regions
3. `Examples and variants`
   - live examples where appropriate
   - variant walkthroughs
   - behavior illustrations
4. `Resources`
   - Storybook
   - Figma
   - related patterns/components

That could be implemented either as:

- true tabs/sub-pages, or
- one long page with an explicit top navigation and stronger section design

I would lean toward keeping patterns on one page for now, but giving them a much
stronger internal section model.

## How pattern examples should be embedded

Pattern examples should not all be shoved into one big gallery at the end.

They work best when embedded at the point where the reader is making a design
decision.

Recommended rules:

- use diagrams for anatomy, spacing, and layout explanation
- use live examples for interaction, state, and realistic composition
- use screenshots only when a live example would not communicate the right
  thing or would be too expensive to maintain

### Example block model

Patterns should use a standard example block that is more editorial than the
component example block.

Each pattern example should include:

- example title
- what this example demonstrates
- why it matters
- live preview where appropriate
- optional code reveal
- best-practices callout

This is different from components, where the example often exists to show a
prop or variant in isolation.

For patterns, examples should usually be scenario-led:

- file browser
- settings dialog
- empty state in a bounded region
- KPI summary in a dashboard

### Visually coherent embedding

The most coherent visual model for pattern pages is:

1. summary and decision guidance
2. anatomy/layout explanation
3. embedded scenario examples immediately after the relevant explanation
4. variants and behaviors as richer example sections

So instead of:

- long theory
- then a block of unrelated examples

it becomes:

- explain a concept
- show the example that proves it

That is a much better reading experience.

## Examples architecture

The current technical handling of component examples is simple and mostly sound.

Live examples are loaded from `site/src/examples/<name>` and rendered with
`LivePreview`. That gives Salt a consistent live-preview system with raw source
display and shared theming controls.

What is not working as well is the content split:

- example code lives in `site/src/examples/**`
- example headings and descriptions live in `site/docs/**/examples.mdx`
- pattern examples are mostly diagrams, screenshots, and Storybook links, with
  only limited use of the live example pipeline

That creates drift and makes patterns feel like a different product from
components.

### Recommendation

Use one unified example system for both components and patterns, but do not
force every example into one flat folder or one flat gallery.

The right goal is:

- one example pipeline
- one example metadata shape
- separate organization for component and pattern examples
- page IA that still reflects the content type

### What to keep

- keep a single live-preview renderer
- keep code + raw source loading
- keep examples site-owned rather than scattering docs examples through package
  source trees by default

This is better than moving everything into package folders because many examples
are docs-specific, theme-aware, or rely on site-only assets and wrappers.

### What to change

#### 1. Use a clearer example root

Move toward a structure like:

```text
site/src/examples/
  components/
    avatar/
    switch/
    tabs/
  patterns/
    content-status/
    breadcrumbs/
    preferences-dialog/
```

That is closer in spirit to a dedicated examples workspace, without losing the
site integration that Salt already relies on.

#### 2. Put example metadata next to the code

Example-specific content should live closer to the example code.

At minimum, each example should define metadata such as:

- title
- summary
- optional best-practices bullets
- tags or intent labels
- optional related examples

That can be exported next to the example component instead of being duplicated
in `examples.mdx`.

Page-level editorial framing can still stay in MDX.

That gives a cleaner split:

- code-adjacent metadata for the example itself
- MDX for broader guidance and comparison between examples

#### 3. Patterns should use the same pipeline

Patterns should be able to register live examples the same way components do.

Not every pattern needs this. Some things are better as diagrams:

- anatomy
- spacing
- layout annotations
- responsive behavior illustrations

But when a pattern is genuinely implemented in code, it should use the same
example system as components rather than being pushed out to Storybook only.

Examples:

- `Content status`
- `Breadcrumbs`
- `Keyboard shortcuts`
- `Preferences dialog`
- `Metric`

#### 4. Do not make all examples identical in IA

The technical system can be unified even if page presentation is not.

- components should still have an `Examples` page or tab
- patterns should usually embed examples where they matter in the guide
- some patterns may also justify a dedicated examples section if they have
  enough live variants

### Better than the current state

The current system is better than nothing, but it has two weaknesses:

1. It is stringly typed and manual.
2. Example prose is too far from example code.

The next technical step should not be “make one giant examples folder”.
It should be:

- one example registry
- one metadata shape
- code-adjacent example metadata
- shared rendering for components and patterns

### Recommended end state

The clean end state is:

- a unified examples registry
- examples grouped by `components` and `patterns`
- example code and example metadata colocated
- docs pages assembling those examples rather than hand-describing each one from
  scratch

That gives Salt something closer to the maintainability benefits of a dedicated
examples workspace, while still fitting the docs site and design-system IA.

## `LivePreview` technical recommendation

The current `LivePreview` UX is good, but the implementation is thinner than it
should be.

Today the site:

- dynamically imports the example component
- loads the displayed source with a raw-text import
- couples display-source loading to the file layout

That is simple, but it has real limitations:

- raw imports are bundler-specific
- the model assumes “one file equals one example”
- multi-file examples are awkward
- helper files, CSS, and supporting data are hard to show coherently
- example metadata lives too far from example code
- source cleanup and presentation are harder than they should be

### Recommendation

Keep the `LivePreview` user experience, but replace the example-loading model
with a generated examples registry.

### Generated examples registry

At build time, generate a registry that records:

- example id
- example kind: `component` or `pattern`
- owner: `tabs`, `switch`, `content-status`, etc.
- render module path
- source files
- display source
- example metadata

Recommended metadata:

- `title`
- `summary`
- `bestPractices`
- `tags` or `intents`
- `relatedExamples`

Then `LivePreview` should read from that registry instead of importing raw
source ad hoc.

### Example structure

Recommended example layout:

```text
site/src/examples/
  components/
    avatar/
    switch/
    tabs/
  patterns/
    breadcrumbs/
    content-status/
    preferences-dialog/
```

Each example can still be a normal TSX module, but it should export lightweight
metadata next to the code.

Example shape:

```tsx
export const meta = {
  title: "Default",
  summary: "Shows a basic switch.",
  bestPractices: ["Use for binary on/off settings."],
  tags: ["binary", "settings"],
};

export default function Default() {
  return <Switch label="Email alerts" />;
}
```

### Content placement

Example-specific content should live closer to the code.

Keep next to the example:

- title
- summary
- best-practices bullets
- tags/intents

Keep in page-level MDX:

- editorial framing
- comparison between examples
- broader narrative guidance

That is a cleaner split than today.

### Why this is better

This would allow Salt to:

- support multi-file examples properly
- show supporting files when needed
- normalize display source at build time
- unify component and pattern examples
- reduce drift between code and example description
- keep the current preview UI while making the backend model more durable

### Migration path

Do not replace `LivePreview` first.

Recommended order:

1. add code-adjacent example metadata
2. generate an examples registry at build time
3. switch `LivePreview` to the registry
4. support multi-file example rendering and source display
5. move more pattern examples onto the same pipeline

This is the cleanest upgrade path because it improves the technical model
without forcing an immediate redesign of the user-facing preview component.

## New required decision content

### `Choose instead`

This should become a first-class section, not just something buried in
`When not to use`.

This is one of the most useful things for both humans and tools because it
captures sibling contrast directly.

Examples:

- `Tabs` vs `Navigation item` / `Vertical navigation`
- `Table` vs `Data grid`
- `Content status` vs `Banner` / `Toast` / `Dialog`
- `Switch` vs `Checkbox` / `Radio button`
- `Metric` vs `Chart` / `Analytical dashboard`
- `Link` vs `Button`

### Scope and ownership

Docs should consistently state the scope a surface owns, for example:

- same-page vs cross-page
- local-region vs page-wide vs app-wide
- single control vs grouped interaction vs workflow container

That distinction is already present in many docs, but not in a structured,
repeatable way.

## Structured metadata to consider

This would help maintainers, search, and downstream tooling without requiring
runtime heuristics.

Potential fields:

- `scope`: `inline | local-region | page | app-wide`
- `primaryJob`
- `chooseInstead`
- `requiredRegions`
- `optionalRegions`
- `interactionModel`
- `stateCoverage`
- `exampleIntents`

This should only be added if it is maintainable. The immediate docs IA work
does not depend on it.

## QA and linting

The docs need stronger QA checks, not just better templates.

Recommended lint checks:

- missing required sections
- missing `Choose instead` where `When not to use` names alternatives
- contradictory guidance between sibling surfaces
- copy/paste drift
- missing related links where sibling comparison is important

## Example quality issue

The `Content status` pattern currently contains clear copy/paste drift in its
`Layout` section:

- references to “the two lists and move buttons that make up list builder”
- references to using `Input` to assemble the header area
- references to move buttons between two lists

That content does not describe `Content status` and should be corrected. It is
a good example of why stronger template rules and QA checks are needed.

## Information architecture judgment

Adding an `Overview` page to all components is the right direction.

The important refinement is:

- do not simply move all `Usage` content into `Overview`
- move the decision-making content into `Overview`
- keep implementation detail in `Usage`

That gives Salt a clearer structure:

- `Overview` for selection
- `Examples` for concrete reference
- `Usage` for implementation
- `Accessibility` for compliance and interaction

This is better for humans and also makes the docs more usable as structured
source material.

## Rollout order

1. Update the component template
2. Introduce `Overview` in the component layout
3. Migrate a small set of high-confusion components first:
   - `Tabs`
   - `Switch`
   - `Table`
   - `Link`
   - `Banner`
4. Add top-level decision summary blocks to patterns:
   - `Content status`
   - `Breadcrumbs`
   - `Metric`
   - `Analytical dashboard`
5. Add doc linting for section coverage and copy/paste drift

## Recommendation

Do the component `Overview` change first.

It is the clearest IA improvement, it aligns with how people actually choose
components, and it will make the docs more useful without forcing a full
pattern-site redesign first.

If you want the higher-ambition version after that, the next big move should be
to redesign pattern pages around:

- stronger top-level decision blocks
- integrated scenario examples
- a standard example block for patterns

That would give Salt a much better docs experience than just adding more prose
to the current layout.
