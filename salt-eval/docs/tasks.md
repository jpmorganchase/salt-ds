# Tasks

The task bank decides what salt-eval can tell us. No harness can rescue a task that measures the wrong thing, so the bank comes first (see what I did there).

## What makes a good Salt task

1. **It mirrors real Salt work.** It reads like something a product team would ask a coding agent to do, and it comes from a real source whenever possible (see Sources below).
2. **It turns on Salt decisions.** Its difficulty comes from two to five Salt decisions: which component or pattern, how to compose it and what the guidance says about states, layout, content or accessibility. It doesn't come from generic React, data plumbing or CSS puzzles. The task names these decisions in one line, **why it's hard**.
3. **Two Salt experts would agree on every verdict.** Everything graded is stated in the request or anchored to Salt guidance.
4. **It accepts every valid solution.** Checks test properties of the rendered result, not one way of writing the code.
5. **It respects its fidelity.** A prototype task never fails an output for placeholder links, mock data or missing error handling the request didn't ask for.
6. **It runs offline and repeatably.** No backend, no live data and nothing in the starting point that gives the answer away.

One more test comes from Anthropic's eval guidance, summarized in [prior-art.md](./prior-art.md): when the oracle arm fails a task in every trial, suspect the task before the agent.

## Anatomy of a task

| Field                            | Holds                                                                      |
| -------------------------------- | -------------------------------------------------------------------------- |
| Request                          | The message the agent gets, at the task's specificity                      |
| Work type, fidelity, specificity | As defined in [CONTEXT.md](../CONTEXT.md)                                  |
| Starting point                   | The frozen app the task runs from and the Salt version installed in it     |
| Why it's hard                    | One line naming the Salt decisions under test                              |
| Guidance anchors                 | For each decision, the Salt passage that settles it, or "none"             |
| Checks                           | Required and diagnostic checks, each with its justification                |
| Rubric items                     | Yes-or-no claims for what checks can't decide, each with its justification |
| Not checked                      | What the task deliberately doesn't grade, and why                          |
| Reference solution               | One output that passes everything required                                 |
| Known-bad outputs                | At least one realistic wrong output that fails the checks it targets       |
| Provenance                       | Where the task came from and how it was sanitized                          |
| Split and variants               | Dev or held-out, and the rewordings that share its checks                  |

Choosing a file format is a roadmap task. This table is the contract any format must meet.

"Not checked" is a field on purpose. Writing down what a task doesn't grade stops checks from creeping into territory the request never asked about.

Every starting point's README states one standing expectation: where Salt provides a component or pattern for the job, use it. Checks that catch hand-built versions of Salt components cite it.

## Coverage

Aim for enough spread that a result isn't an artifact of one kind of work, not for every combination.

| Dimension      | Values                                                                                                          | Guidance                                                                                                                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Work type      | Create, extend, migrate, fix                                                                                    | Weight toward extend: most production work adds to an existing Salt app                                                                                                                           |
| Decision type  | Setup and integration, component choice, composition, pattern, foundation, accessibility, content, API currency | Targets and decision points are in [decision-types.md](./decision-types.md). Include cross-component decisions. Salt works as a system: a correct card inside another correct card is still wrong |
| Fidelity       | Prototype, production                                                                                           | Both. Prototypes show whether agents reach for Salt at all; production tasks show whether they get the details right                                                                              |
| Specificity    | Outcome, pattern, API                                                                                           | Mostly outcome, because that's how people ask. API-level variants separate choosing a component from using it                                                                                     |
| Starting point | Empty Salt app, existing Salt app, non-Salt app                                                                 | Existing apps should have their own conventions and wrapper components, like real ones                                                                                                            |

A useful pairing: give an outcome-level task an API-level variant. If agents fail the outcome version but pass the API version, the problem is choosing the component, not using it.

## Sources

In priority order, adapted from Anthropic's guidance in [prior-art.md](./prior-art.md):

1. **Real agent sessions that built Salt UI**, sanitized. The session analyzed in `findings.md` on the `mcp-eval` branch already yields at least three tasks.
2. **Salt support questions and recurring review comments.** What the Salt team corrects again and again is what agents get wrong.
3. **Salt's stated decision points.** Every "When not to use" list and pattern best-practice callout is a decision experts have already written down, such as Card's "As a background containing other cards. Instead, use Panel."
4. **Tasks written by Salt maintainers**, five to ten to start.
5. **Synthesized variants of validated tasks**, such as new domain nouns or reworded requests. Never synthesize a task from nothing.

Two cautions from the same source:

- **Don't pick tasks because today's model fails them.** That samples one model's blind spots rather than what matters for Salt. Say why a task is hard before you run it.
- **Don't rely only on real traffic.** People ask for what they expect to work, which skews easy.

## Traps

| Trap                                                                                    | Why it hurts                                         | Instead                                                        |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------- |
| Naming components in an outcome-level request ("a `FormField` with a `FormFieldLabel`") | Tests one prop placement, not the choice             | Describe the need; name components only in API-level variants  |
| Penalizing prototype shortcuts such as `href="#"`                                       | Fails correct work and erodes trust in the numbers   | State the fidelity; list allowed shortcuts under "Not checked" |
| Checking only that Salt is imported                                                     | Salt-flavored wrong UI passes                        | Check rendered behavior and composition                        |
| Difficulty from generic React (state machines, data fetching)                           | Measures the model, not Salt context                 | Pre-build non-Salt logic in the starting point                 |
| "Build a whole app"                                                                     | Too many decisions per verdict to attribute failures | Two to five Salt decisions per task                            |
| Taste without an anchor ("looks professional")                                          | Experts disagree and judges drift                    | Anchor it, or get the guidance written first                   |
| The answer left in the starting point (the fix in git history, a TODO describing it)    | Measures search, not Salt knowledge                  | Single-commit starting points, reviewed for leaks              |

## Worked examples

These are candidate seed tasks for roadmap Phase 1, still to be validated with Salt maintainers. Paths point into this repository at `@salt-ds/core` 1.72.0.

### 1. Left navigation in an existing app

Extend · production · outcome-level

**Request.** "Our app has five sections: Overview, Accounts, Payments, Reports and Settings. There's no way to move between them. Add navigation down the left side that shows which section the user is on. We use React Router."

**Starting point.** An existing Salt app with Vite, React Router and the five routes defined, `SaltProvider` configured and an app header, but no navigation.

**Why it's hard.** Salt offers two routes to a left navigation, and the newer one, `VerticalNavigation`, is a compound component whose canonical composition includes `VerticalNavigationItemContent`. Router links go through the trigger's `render` prop. Agents working from types or memory drop the content wrapper, as the session in `findings.md` did.

**Guidance anchors.**

- Composition: the Basic example, `site/src/examples/vertical-navigation/Basic.tsx`, nests `VerticalNavigationItem` > `VerticalNavigationItemContent` > `VerticalNavigationItemTrigger` > `VerticalNavigationItemLabel`. No prose on the site says `VerticalNavigationItemContent` is required; only examples show it.
- Routing: `site/docs/components/vertical-navigation/usage.mdx`, "Routing libraries": use the `render` prop on navigation item triggers.
- Accessible name: `site/docs/components/vertical-navigation/accessibility.mdx`: "Provide an accessible name for each vertical navigation component."
- The other route: `site/docs/patterns/vertical-navigation.mdx` builds vertical navigation from "a stack of navigation item components" (`NavigationItem`), while `VerticalNavigation` has its own component page.

Writing this task found a guidance issue before any agent ran: published guidance offers both routes without saying which to prefer. Until maintainers decide, the task accepts both, and the inconsistency goes on the guidance issues list.

**Required checks.**

1. Gate: builds, and every route renders without an uncaught error.
2. Behavior: clicking "Payments" shows the Payments page without a full page reload (the request says React Router).
3. Behavior: the Payments item then has `aria-current="page"` and no other item does. Both Salt routes set it on the active item.
4. Structure: the five items are rendered by Salt navigation components (class `saltVerticalNavigationItem` or `saltNavigationItem`), not a hand-built list.
5. Structure, only if `VerticalNavigation` is used: its `nav` has an accessible name, and every trigger sits inside an element with the class `saltVerticalNavigationItemContent`. Checking rendered classes instead of JSX lets agents wrap items in their own components.

**Diagnostic check.** Which route the output took. It shows which guidance the agent followed.

**Rubric items.** None. Everything this task needs can be checked automatically, which makes it a good first task.

**Not checked.** Icons, collapsing and styling beyond Salt defaults. The request didn't ask for them.

**What failures tell us.**

| Trace shows                                                    | Attribution                                                             | Change to test next                                                                              |
| -------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Nothing about Salt navigation reached the agent                | Retrieval miss                                                          | Product: does a query for "left navigation" or "sidebar" return either route?                    |
| A lookup returned not found and the agent carried on           | Tool misuse, plus a retrieval miss in the product if the name was valid | Product: resolve aliases. Skill: treat not found as a stop                                       |
| The Basic example reached the agent and the wrapper is missing | Misinterpretation                                                       | Compare with the oracle arm before changing anything                                             |
| The oracle arm drops the wrapper too                           | Unclear guidance: the requirement is only implied by an example         | Docs: state it in prose. Component: consider a development warning when a trigger has no wrapper |

### 2. Account overview page

Create · prototype · outcome-level

**Request.** "Build a first version of an account overview page for relationship managers. It needs four headline figures (total balance, available credit, pending payments and overdue invoices) and the ten most recent transactions. Use mock data. Links and buttons don't need to do anything yet."

**Starting point.** An empty Salt app with `SaltProvider` configured.

**Why it's hard.** Many layouts are valid. The Salt decisions are presenting the headline figures as metrics with enough context, grouping with cards without putting cards inside cards and building the layout from Salt layout components.

**Guidance anchors.**

- Cards inside cards: `site/docs/components/card/usage.mdx`, "When not to use": "As a background containing other cards. Instead, use `Panel`."
- Metric context: `site/docs/patterns/metric.mdx`, best practices: "Never leave the user guessing how to interpret your metric."
- Layout: `site/docs/patterns/analytical-dashboard.mdx`, "Dashboard layout": `GridLayout` for the main content area, `FlowLayout` or `StackLayout` for smaller groups.
- Headings: `site/docs/components/card/usage.mdx`, "Content": "Use a short heading that follows the page's heading hierarchy."

**Required checks.**

1. Gate: builds and renders without an uncaught error.
2. Structure: no element with the class `saltCard` contains another.
3. Accessibility: no serious or critical axe-core violations.
4. Structure: heading levels don't skip.

**Required rubric item.** "Each headline figure shows what it measures and in what unit, so a relationship manager could read it without guessing." Anchored to the metric pattern.

**Diagnostic check.** The layout is built from Salt layout components rather than hand-written CSS grid or flex containers. It's diagnostic, not required: the dashboard pattern recommends Salt layouts but doesn't rule out CSS, so requiring it could fail work two experts would accept. If reviewers agree it matters, get the guidance written, then promote the check.

**Not checked.** Links and buttons that do nothing, mock data and responsive behavior. The request allows the first two and doesn't ask for the third.

**What failures tell us.**

| Trace shows                                             | Attribution                                                                                | Change to test next                                                                |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Cards nested; Card's usage page never reached the agent | Retrieval miss                                                                             | Product: does "group of cards" or "card container" reach Card's "When not to use"? |
| Cards nested; the passage reached the agent             | Misinterpretation                                                                          | Compare with the oracle arm                                                        |
| The oracle arm nests cards too                          | Unclear guidance: "a background containing other cards" doesn't read as "don't nest cards" | Docs: say it plainly, with a `Panel` example                                       |

### 3. Edit contact details form

Extend · production · outcome-level

**Request.** "On the client profile page, add a form for editing contact details: full name, email, phone number and preferred contact method (email, phone or post). Email is required and must be a valid address before the form can be saved; tell the user what's wrong next to the field. Put Save and Cancel at the end of the form."

**Starting point.** An existing Salt app whose client profile page shows read-only details and has a stubbed `saveContactDetails` function.

**Why it's hard.** Every control belongs in a `FormField` with a label. The validation message belongs to the `FormField`, so it's announced with the field. Salt's button order for a single-step form differs from the order Salt uses in dialogs.

**Guidance anchors.**

- `site/docs/patterns/forms.mdx`, "Standard layout": "A form control consists of a form field wrapped around" an input, combo box, dropdown, or radio button or checkbox group.
- `site/docs/patterns/forms.mdx`, "Label placement": top placement is the default, and "Don't mix label placements across the same form."
- `site/src/examples/form-field/Validation.tsx`: `validationStatus` on `FormField`, with the message in `FormFieldHelperText`.
- `site/docs/patterns/button-bar.mdx`, "Button order", "Default/Single step form": "Groups core actions on the left", shown as a solid Submit with a bordered Cancel to its right.

**Required checks.**

1. Gate: builds, and the profile page renders without an uncaught error.
2. Accessibility: each of the four controls has an accessible name matching its visible label, and there are no serious or critical axe-core violations.
3. Structure: each control is inside an element with the class `saltFormField`.
4. Behavior: typing "not-an-email" and pressing Save shows an error that's part of the email input's accessible description, and `saveContactDetails` isn't called.
5. Behavior: with valid values, Save calls `saveContactDetails` once with those values.
6. Structure: Save renders as a solid button (`saltButton-solid`) to the left of a bordered Cancel (`saltButton-bordered`). This could have been a rubric item; a check is cheaper and never drifts.

**Not checked.** Phone number format, which the request didn't ask for. Whether the contact method is a radio group or a dropdown: the Forms pattern accepts both.

**What failures tell us.**

| Trace shows                                                                                  | Attribution                                                              | Change to test next                                                       |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| Error rendered as plain text under the input; the validation example never reached the agent | Retrieval miss                                                           | Product: does "form validation" reach the `FormField` validation example? |
| The same, but the example reached the agent                                                  | Misinterpretation                                                        | Compare with the oracle arm                                               |
| Save and Cancel right-aligned although the button bar passage reached the agent              | Misinterpretation (the dialog order applied to a page) or prior override | Docs: show page-form order and dialog order side by side                  |

### 4. Fix seeded defects

Fix · production · outcome-level

**Request.** "This settings page was built quickly and doesn't follow Salt. Fix the Salt issues without changing what the page does."

**Starting point.** A Salt settings page with a test file for its behavior and four seeded defects:

| Seeded defect                                                           | Guidance anchor                                                                   |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `Text` with the `variant` prop                                          | The pinned types mark `variant` `@deprecated` since 1.27.1: "Use `color` instead" |
| A `Card` used as a background around three other `Card`s                | Card usage, "When not to use"                                                     |
| `VerticalNavigationItemTrigger` without `VerticalNavigationItemContent` | The vertical navigation Basic example                                             |
| A form that mixes top and left label placement                          | Forms pattern: "Don't mix label placements across the same form"                  |

**Checks.** One required check per defect, plus two that catch collateral damage: the page's behavior tests still pass, and no file outside the page changed.

**Why it's useful early.** Verdicts are deterministic, each maps to one anchor and it's the cheapest way to learn which guidance each arm actually delivers. Its weakness is that it tells the agent something is wrong, so it doesn't test whether the agent would avoid these mistakes unprompted. Pair it with create and extend tasks.

## Acceptance checklist

A task enters the bank when:

- [ ] The request reads like a real request and names components only if its specificity is API-level.
- [ ] "Why it's hard" names two to five Salt decisions.
- [ ] Every check and rubric item cites the request or a guidance anchor. Anchors marked "none" go on the guidance issues list, and their checks stay diagnostic until the guidance exists.
- [ ] "Not checked" lists what the fidelity and the request leave out.
- [ ] The reference solution passes every required check, and each known-bad output fails the check it targets.
- [ ] Two reviewers independently agree on the verdicts for the reference solution and the known-bad outputs.
- [ ] The starting point builds offline, has a single commit and doesn't contain the answer.
- [ ] Once the harness exists: the oracle arm passes the task in at least some trials.
- [ ] It has a split, and its variants are listed.

## Growing the bank

| Stage      | Size                                                           | Purpose                                                  | Move on when                                                   |
| ---------- | -------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------- |
| Seed       | 5–8 dev tasks                                                  | Prove tasks and checks end to end; find eval defects     | Every task meets the checklist and the noise floor is measured |
| First bank | About 30 tasks, a third held out                               | First comparisons of context products, for large effects | Every work type has at least four tasks                        |
| Ongoing    | New tasks from real sessions; saturated and dead tasks retired | Keep headroom and follow how Salt is actually used       | —                                                              |

Rules as the bank grows:

- **Tasks are versioned.** Changing a request, starting point or check makes a new version, and pass rates don't compare across versions.
- **Held-out tasks burn.** Once anyone uses a held-out task's trace to change a context product, the task moves to dev and gets replaced.
- **Saturated tasks retire to a canary set.** They stay runnable to catch regressions but don't count in comparisons.

## Not tested yet

These are deliberately out of scope. Revisit them when evidence says they matter.

- **Clarifying questions.** Trials run without a human, so requests must be complete. A later task type could leave a decision out on purpose and pass agents that state their assumption.
- **Matching a visual design** from Figma or a screenshot.
- **Performance and bundle size.**
- **Custom theming** beyond the Salt themes configured in the starting point.
