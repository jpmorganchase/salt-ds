# Canonical Doc And Example Improvements

Use this as the running list of doc and example improvements that would let Salt AI rely less on hand-authored scaffolds and more on canonical Salt source material.

The goal is not to add AI-only docs.

The goal is to make the existing design-system docs and examples more structurally explicit so registry extraction, starter scaffolds, and validation can derive more behavior from canonical sources.

## Current Priority

Focus first on the patterns that already have canonical starter scaffolds:

- `Analytical dashboard`
- `Metric`
- `App header`
- `Vertical navigation`

These are the highest-leverage places to tighten the docs because they already influence create-time implementation shape.

Current status:

- `Metric`: partly addressed in docs; the supporting sections are clearer, but the numbered anatomy list remains diagram-driven
- `Analytical dashboard`: partly addressed in docs; key metrics and main-body regions are clearer, but anatomy remains diagram-driven
- `App header`: partly addressed in docs; named regions are clearer and the variants better explain when navigation is present
- `Vertical navigation`: partly addressed in docs; nested groups and variant usage are clearer, while the numbered anatomy list remains diagram-driven

## Additional Gaps Found During The Top-Tier DS Pass

These gaps matter because Salt now has stronger consumer docs and skill references for common surfaces and design judgment.

The canonical docs need to keep catching up so those AI-facing surfaces can rely more on canonical source material and less on hand-maintained summary prose.

### Surface-Level Gaps

Prioritize clearer canonical guidance for:

- table plus filters
  - what owns the page versus the data region
  - how filters, actions, and supporting summary regions should relate
- form page structure
  - how validation, helper text, and action placement should be grouped
- supporting states
  - loading, empty, error, and success states as part of the owning workflow instead of generic placeholders
- dialog workflows
  - action ordering and bounded-decision structure for announcement and preferences flows

### Design-Language Gaps

Prioritize docs that make these ideas more explicit and extractable:

- task-first composition
- quiet hierarchy
- layout ownership
- appropriate density
- bounded customization

These should come from canonical docs and examples where possible, not only from AI-facing summary references.

## Pattern Improvements

### Shortlist

If only a small amount of doc work happens next, prioritize these three:

- `Metric`
- `App header`
- `Analytical dashboard`

### Analytical dashboard

Files:

- `site/docs/patterns/analytical-dashboard.mdx`
- `site/docs/components/layouts/border-layout/usage.mdx`
- `site/docs/components/layouts/grid-layout/usage.mdx`
- `site/docs/patterns/metric.mdx`

Improvements:

- Add an explicit named-region anatomy section:
  - dashboard header
  - key metrics
  - fixed controls or filters
  - main analytical body
- Make the shell/layout split explicit:
  - `BorderLayout` for the top-level shell
  - `GridLayout` for the main module area
- Status:
  - `Key metrics` is now explicit as a first-class dashboard region
  - the required `main body` region is now explicit
- Still useful:
  - make fixed controls or filters more structurally explicit
  - improve examples further so the anatomy reads as a recognisable starter shape, not only prose
- Add one example that clearly shows:
  - header
  - metrics strip
  - fixed side controls
  - grid-based module area
- Make the relationship to the `Metric` pattern explicit instead of leaving metrics as generic cards or text blocks.

### Metric

Files:

- `site/docs/patterns/metric.mdx`

Improvements:

- Status:
  - supporting sections now make the metric structure and optional enrichments clearer
- Still useful:
  - add a more explicitly minimal example that mirrors the anatomy directly
- Make the “single orientation” rule explicit for multi-metric views.
- Add at least one example that is intentionally minimal and anatomy-first, not embedded only inside a larger dashboard story.
- If indicators are canonical, show one canonical positive/negative example with the same anatomy preserved.

### App header

Files:

- `site/docs/patterns/app-header.mdx`

Improvements:

- Status:
  - named regions are explicit: `branding`, `navigation`, `utilities`
  - the two main variants now make the optional navigation region clearer
- Still useful:
  - add one example that shows the shell with the named regions called out directly
- Add one example that shows the shell with those regions called out directly.
- If skip-link guidance is important, make it part of the explicit header structure instead of a side note.

### Vertical navigation

Files:

- `site/docs/patterns/vertical-navigation.mdx`

Improvements:

- Status:
  - nested navigation, secondary navigation, and modal usage are clearer as pattern variants
- Still useful:
  - add one example that shows the pane-based shell more directly
  - clarify the surrounding content relationship without overcommitting the pattern docs
- Add one example that shows nested/grouped navigation in a recognisable pane-based shell.
- Clarify whether any component relationship is canonical, optional, or only one implementation path.

## Layout Component Improvements

### BorderLayout

Files:

- `site/docs/components/layouts/border-layout/usage.mdx`

Improvements:

- Keep `BorderItem` usage explicit and prominent.
- Make “top-level shell regions only” more explicit if that is the intended guidance.
- Add one example that clearly maps named regions to `BorderItem` positions.

### GridLayout

Files:

- `site/docs/components/layouts/grid-layout/usage.mdx`

Improvements:

- Add one example that reads as a dashboard-module grid rather than generic layout.
- Make it easier to extract “use this for the main dashboard body” style guidance from canonical docs.

## Example Quality Improvements

Across the priority patterns, improve examples so they are easier to treat as canonical implementation evidence:

- prefer examples with named, recognisable regions over abstract placeholder blocks
- keep anatomy consistent between docs prose and example structure
- avoid examples that hide the real pattern structure inside heavy surrounding app code
- add at least one minimal “starter-shape” example where the anatomy is obvious without extra business logic
- make relationships between patterns explicit when one pattern commonly composes another

## Extraction-Oriented Improvements

When touching docs, prefer structure that the registry can realistically extract later:

- explicit anatomy headings
- explicit required vs optional parts where they help readers and do not conflict with diagram-driven anatomy
- explicit region names
- explicit layout role statements
- explicit composition relationships
- examples that match the prose structure

Avoid relying only on:

- broad narrative paragraphs
- implicit visual hierarchy in screenshots alone
- examples whose structure is obvious only to a human reader

## Next Candidates After The Current Priority Set

Consider these only after the current priority patterns are stronger:

- `Search`
- `Button bar`
- `Forms`

These should only move up once the canonical docs are explicit enough to support structured extraction without adding another hand-maintained AI layer.

## What This Unblocks

The recent doc changes make these extractions safer:

- `Metric`
  - clearer supporting guidance for metric structure and optional enrichments
- `Analytical dashboard`
  - clearer region extraction from the dashboard regions section
- `App header`
  - clearer region extraction from anatomy plus the existing variants
- `Vertical navigation`
  - clearer extraction of nested-navigation and variant guidance without changing the anatomy callouts

The main remaining blockers are now example quality and a few still-implicit relationships, not total absence of structure in the prose.

## Deferred Follow-Up: Source-Derived Starter Templates

Status:

- deferred follow-up, not part of the current V1 execution slice

Goal:

- stop treating the current pattern starter JSX bodies as long-term implementation-owned templates
- move the priority starter shapes toward real story or docs example extraction
- keep docs-owned scaffold metadata as the canonical selector for starter shape

Preferred direction:

- keep scaffold semantics in pattern docs frontmatter or other docs-owned metadata
- add a docs-owned pointer for the starter source:
  - a Storybook story export
  - an MDX example block
  - another small extracted source snippet with stable provenance
- have the registry build resolve that source and normalize it into the existing starter template artifact:
  - imports
  - JSX lines
  - notes
  - source URLs

Fallback policy:

- keep one generic fallback path when no tagged source exists
- do not add more pattern-specific JSX blocks in code while this remains deferred
- if a tagged starter source disappears, prefer a loud build warning or failure over silently inventing a new pattern-specific scaffold

Priority scope when revisited:

- `Metric`
- `App header`
- `Vertical navigation`
- `Analytical dashboard`

Definition of done for the follow-up:

- the registry starter template for the priority patterns comes from tagged canonical stories or docs examples
- `buildRegistryPatterns.ts` no longer owns large pattern-specific JSX bodies for those patterns
- fallback starter code remains small, generic, and clearly secondary to extracted source material
