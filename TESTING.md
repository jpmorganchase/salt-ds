# Testing strategy

Salt tests should protect what consumers can observe: semantics, interactions,
accessibility, visual presentation and compatibility. A test should describe a
user-visible contract, not the component's internal implementation.

## Choose the right test

| Test                           | Use it for                                           | Run it with            |
| ------------------------------ | ---------------------------------------------------- | ---------------------- |
| Unit (`*.spec.*`)              | Pure logic and utilities without a browser           | `yarn test`            |
| Browser (`*.browser.test.tsx`) | DOM, keyboard/pointer, focus, ARIA, forms, callbacks | `yarn test:components` |
| Accessibility                  | axe checks of composed stories                       | `yarn test:components` |
| Visual regression              | Appearance, layout, themes and static states         | Chromatic on a PR      |
| Types and compatibility        | Public API, package imports, supported React types   | Typecheck commands     |

For types, run `yarn typecheck`, `yarn typecheck:react19` and
`yarn typecheck:consumer` (the last one after `yarn build`). Accessibility
scans should use `checkAccessibility`; keyboard and focus behavior still need
dedicated browser tests.

Choose the lowest-cost level that can prove the behavior reliably. Do not
duplicate every behavior across test types. An axe scan is not a substitute for
testing a keyboard journey, and a visual snapshot is not proof of semantics.

### Chromatic or a browser test

Chromatic compares screenshots with an approved baseline. A browser test
asserts that something observable happened. Choose by how the state is reached:

- **Rendered without interaction**: layout, borders, variants, densities,
  themes and states set by props or markup. Add a Chromatic QA story
  (`*.qa.stories.tsx` with `chromatic: { disableSnapshot: false }`). One story
  can show every permutation in a `QAContainer`.
- **Reached through hover, drag or keyboard focus**, including state a library
  sets in response to those events. Write a browser test. Play functions can
  click a story into a state such as an open overlay, but CSS `:hover` can't be
  simulated without a pseudo-states addon, which we don't use, and
  `:focus-visible` after scripted focus differs between browsers.

Chromatic runs on `main` and on pull requests labelled `chromatic`, so it does
not check every change, such as Renovate dependency updates. If a regression
must fail CI on every pull request, it needs a browser test.

When a browser test checks styling:

- Assert what changes, not which private token a rule uses. For example, the
  background differs from its resting value while hovered and returns after.
  Resolving component-private custom properties restates the CSS and breaks on
  harmless refactors.
- Compare against public Salt tokens only when they define the contract, such
  as `--salt-focused-outline*` for the focus ring. Checking only that an outline
  exists also passes with the browser's default outline.
- Reach states the way users do: `userEvent.tab()` rather than `focus()`, and
  real pointer input for hover and drag.

## Write behavior-focused, flat tests

- Prefer independent `it("...", ...)` tests with descriptive, consumer-facing
  names. An optional single `describe("Given a ComboBox", ...)` gives context;
  nested `describe` blocks are not required. Keep the **given/when/then** idea
  in the test setup, action and assertion rather than encoding a deep hierarchy.
- Test one meaningful behavior per case. Use `it.each` for small input or
  interaction variations that verify the same contract.
- Compose an existing Storybook story when possible, so examples and tests
  exercise the same public API. Use `renderWithSalt` for the theme and providers.
- Keep setup, interactions and assertions inline in each test, even if that
  repeats a few lines. A reader shouldn't have to leave the test to see what it
  renders or does, and wrappers such as `renderComboBox()` tie tests together
  so one change alters many. Shared repo utilities such as `renderWithSalt` and
  `~browser-test-utils/pointer` are fine, as are small helpers that only read a
  value, such as an element's center.
- Prefer roles, accessible names and observable state from `vitest/browser`
  (`page.getByRole`, `userEvent`, `expect.element`) over implementation classes,
  internal state or snapshots of markup.
- Include relevant default, disabled/read-only, controlled/uncontrolled,
  keyboard, focus, form and callback behaviors. Assert ARIA relationships and
  outcomes, not just the existence of an attribute.
- Use real browser interactions and awaited assertions. Avoid arbitrary sleeps,
  reliance on test order, shared mutable DOM state or broad mocks that hide
  integration behavior.
- Make sure a new test can fail: break the behavior once and confirm the test
  fails. Comparing values that are equal in every theme, or checking for the
  absence of a style that nothing applies, always passes.
- Keep accessibility checks for representative stories; avoid redundant axe
  scans for every permutation unless their markup or behavior differs.
- Do not suppress React compatibility warnings to make a test pass. CI runs
  browser tests against React **16, 17, 18 and 19**, with Strict Mode in 18+.
  Firefox and WebKit run nightly.

For example, a flat user-story test can look like this:

```tsx
import { Button } from "@salt-ds/core";
import { expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

it("activates a Button with Enter", async () => {
  const onClick = vi.fn();
  await renderWithSalt(<Button onClick={onClick}>Save</Button>);

  await userEvent.tab();
  await expect
    .element(page.getByRole("button", { name: "Save" }))
    .toHaveFocus();
  await userEvent.keyboard("{Enter}");

  expect(onClick).toHaveBeenCalledOnce();
});
```

## Organize files for Vitest and shards

**Vitest schedules and shards files, not individual tests.** Nesting fewer
`describe` blocks does not itself improve throughput. A large file can keep one
browser worker occupied while the rest of its shard finishes.

- Start with one test file for a small component. When it becomes expensive,
  split by cohesive consumer behavior: for example `combo-box.keyboard`,
  `combo-box.selection`, `combo-box.form` and `combo-box.accessibility`, all
  ending in `.browser.test.tsx`. A filename should tell a contributor where a
  new test belongs.
- Keep a complete journey together when assertions rely on the same setup.
  Do not create one file per test: every file has collection and browser setup
  costs.
- Keep rendering and interactions inline rather than in shared helpers. Repo
  utilities in `test/browser` and adapter suites are the exceptions. Avoid
  duplicated assertions or implicit ordering between test files.
- When the same contracts must run against multiple date adapters, keep
  separate adapter **entry files** that share the relevant test suite. This
  exposes independent files to Vitest without copying test cases.
- Do not split solely by line count or enforce an arbitrary test count. Use
  measured file elapsed time and shard bottlenecks to find candidates.
- Keep the three-shard React matrix simple. Do not add a custom shard
  sequencer or manual allocations without repeatable CI evidence that they
  improve the critical path.

## Collect and use timings

Each browser shard in CI writes Vitest's standard JSON report and a derived
`browser-file-timings.csv` as a downloadable `browser-test-timings-*` artifact.
The job summary also lists that shard's ten slowest test files. These are
diagnostic artifacts, not new required checks or coverage gates.

To collect a local report after building the packages as needed:

```sh
yarn test:components --reporter=default --reporter=json --outputFile.json=.vitest/browser-test-results.json
node scripts/reportBrowserTestTimings.mjs .vitest/browser-test-results.json
```

The CSV records each file's `endTime - startTime` in milliseconds and its test
counts. File elapsed times **overlap across workers**, so they must not be
summed as a CI wall-clock duration. They can include collection/setup overhead,
which is useful when deciding whether splitting a file is worthwhile.

When improving test performance:

1. Compare runs with the same React version, browser, worker count, shard count
   and CI runner. Look at repeated runs, not one noisy measurement.
2. Inspect the slowest files across the three shards and the longest-running
   shard. Start with outliers (especially files repeatedly taking tens of
   seconds), not the largest source file by lines.
3. Split one cohesive behavior group or remove unnecessary expensive setup,
   then verify all tests still run and no accessibility/adapter/React coverage
   has been lost.
4. Compare the **whole browser-test critical path** and total runner time
   before keeping the change. More files can help parallelism but also increase
   per-file overhead.

Run a specific browser test with `yarn test:components <test-file-path>`.
Set `TEST_BROWSER=firefox` or `TEST_BROWSER=webkit` to investigate a
cross-browser issue locally.
