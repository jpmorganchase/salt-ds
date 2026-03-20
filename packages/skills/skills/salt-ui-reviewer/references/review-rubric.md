# review rubric

Use this rubric to judge impact, not to generate comment volume.

## component choice

- Check whether the UI uses the most constrained Salt primitive, pattern, or foundation that fits the need.
- Before accepting custom UI or abstraction, check whether Salt already provides a standard component or pattern for the job.
- Flag custom compositions that recreate a Salt primitive or pattern without a strong reason.
- Check whether the package choice is appropriate and whether a more canonical Salt option exists.

## composition

- Prefer flat, readable hierarchy with obvious ownership of layout, semantics, and state.
- Flag wrapper stacks, pass-through components, duplicated structure, and prop plumbing that hide the real UI intent.
- Ask whether the same outcome can be achieved with fewer layout nodes or a clearer pattern.

## foundations

- Check spacing, sizing, density, typography, color, and elevation against Salt foundations and tokens.
- Check that token family choices and direct-use decisions follow the canonical Salt token policy instead of visual guesswork.
- Check that borders or separator lines use the right structural tokens and that container surfaces do not mix mismatched background and border levels.
- Flag places where the UI drifts because it uses raw values or inconsistent density assumptions.
- Treat local overrides as suspect until they are justified by the product need.

## styling discipline

- Prefer token-driven styling and narrowly scoped overrides.
- Flag ad hoc CSS that restyles Salt components into a different system.
- Check whether styling choices create unnecessary visual noise or state ambiguity.

## accessibility

- Check keyboard flow, focus visibility, semantics, labels, announcements, contrast, and interactive target clarity.
- Prioritize issues that break access, create confusion, or make important states invisible.
- Consider empty, loading, validation, and error states, not just the happy path.

## maintainability

- Check whether the structure is easy to extend without duplicating layout or styling rules.
- Flag custom abstractions that obscure the underlying Salt pattern or make simple changes expensive.
- Prefer explicit structure over clever indirection.

## severity guide

- Critical: broken access, missing semantics, unusable workflows, or dangerous state ambiguity.
- High: wrong primitive or pattern, severe composition issues, or strong foundations drift.
- Medium: maintainability issues, noisy styling, or preventable complexity.
- Low: minor cleanup or polish that does not change the main UX outcome.
