# Salt maintainer workflow

Use this workflow to implement, fix and review Salt changes. Keep the task's scope
and existing contributor procedures visible. A copy edit needs a smaller check
than a change to focus management or an exported API.

## 1. Recover the current task

Read the request and any related issue. When a PR exists, read its description and
relevant review discussions. Confirm the current PR head, CI results and any
accepted, rejected or deferred decisions. Check whether failures and previous
validation belong to that revision.
Use the available GitHub integration or CLI; a resolved thread alone does not
establish that its concern was valid or fixed.

From the repository root, collect local context with:

```sh
node scripts/maintainerContext.mjs
```

After installing dependencies, `yarn maintainer:context` runs the same command.
Use `--base <local-ref>` for a different comparison base and `--json` for structured
output. The default is `origin/main`; refresh that ref when current remote state
matters. The helper does not fetch, read GitHub or run tests. Its tracking-ref
status describes local Git knowledge, not proof of the remote branch's current
state. It includes committed changes from the merge base and staged, unstaged and
untracked files. Inspect the diff and preserve work outside the task.

Read the relevant [contributor guidance](../CONTRIBUTING.md). For icons, follow the
[complete icon procedure](../CONTRIBUTING.md#how-to-add-a-new-icon), including
generated outputs and synonym changes. Use existing scripts to regenerate files.

## 2. State the contract and choose the relevant cases

Describe the intended observable result and a plausible wrong result the change
must prevent. Identify affected public components, hooks, contexts and supported
consumer compositions. Use the existing specification and decisions to resolve
questions; surface a material unresolved behaviour choice before encoding it in
tests.

Choose cases that exercise the changed behaviour:

| Change                      | Cases to consider                                                                                                                                                                         |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focus or collection state   | Initial state; entering forwards/backwards; removal, disabling or reordering; empty state; focus inside/outside; controlled parent accepting, overriding or ignoring a proposed selection |
| SSR, ARIA or composition    | Exact element associations; wrappers; custom rendering; the actual focusable node; behaviour of the composed components                                                                   |
| Exported API or types       | A representative previous consumer call shape; custom context providers; generic values; ref and callback behaviour                                                                       |
| Generated content or assets | Correct source input; repeatable generation; preservation of meaning; unintended changes elsewhere in the generated diff                                                                  |
| Visual behaviour            | Relevant composition, viewport, density and theme; existing stories and scoped visual checks                                                                                              |

These are prompts for selection, not a mandatory Cartesian product. Focusable
disabled items and empty-state behaviour depend on the widget's contract. Two
conflicting tests require a behaviour decision, not an assumption that the newer
expectation is correct.

## 3. Implement with a discriminating check

For a bug, reproduce the supported trigger and use the existing fixture or helper
where possible. Establish that the regression test fails before the fix, or show
that a temporary break of the intended behaviour makes it fail. A clear static
type incompatibility can also establish a defect.

Assert the exact user outcome: the intended focus target, the input's association
with its label, or the preserved consumer call. Check that the test's setup does
not repair the initial defect before the assertion. Avoid tests that only mirror
the implementation or pin incidental text and counts.

Keep the implementation within scope, inspect generated diffs, and update the
relevant documentation and changeset. Follow the existing
[deprecation](../CONTRIBUTING.md#prop-deprecation) and
[theme](../CONTRIBUTING.md#theming) procedures when applicable.

## 4. Run the relevant existing checks

Select checks from the contract and affected dependencies as well as changed
paths. A shared helper may affect components outside its directory. Run the
smallest useful check while iterating, then the broader checks justified by the
change. Keep the existing [CI workflow](workflows/test.yml) authoritative.

Commands below run from the repository root; replace angle-bracket placeholders
with the selected files or test paths.

| Purpose                      | Existing command                                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Changed-file formatting      | `yarn exec prettier --check <files>`                                                                                                 |
| Changed-file Biome checks    | `yarn lint <files>`                                                                                                                  |
| Focused unit tests           | `yarn test --run <test-path>`                                                                                                        |
| Focused browser tests        | `yarn test:components <test-path>`                                                                                                   |
| Another supported browser    | `TEST_BROWSER=webkit yarn test:components <test-path>` (or `firefox`; install it with `yarn playwright install <browser>` if needed) |
| Source compatibility         | `yarn typecheck` and `yarn typecheck:react19`                                                                                        |
| Built consumer compatibility | `yarn build`, then `yarn typecheck:consumer`                                                                                         |
| Published package output     | `yarn build`, then `node scripts/checkPackages.mjs`                                                                                  |
| CSS                          | `yarn lint:style`                                                                                                                    |
| Visual regression            | Follow the [Chromatic procedure](../CONTRIBUTING.md#chromatic) and use relevant existing stories                                     |

`yarn prettier` rewrites the repository; use the explicit check command above when
verifying formatting. Documentation-only changes normally need formatting, link
and factual checks, rather than a component test run.

Local browser tests use source aliases; CI tests public Salt imports against built
package output. Record which path, React version and browser were exercised.
Source type checks and built consumer checks also establish different things.
Existing failure screenshots and attachments are available from CI. Inspect the
evidence before calling a failure flaky or unrelated. Report unavailable checks as
blocked or not run, with the reason; do not imply they passed.

## 5. Review the remaining uncertainty and finish

For each required finding, give the supported trigger, violated contract, user
impact and evidence. Mark questions and optional suggestions accordingly. Reopen
a previous decision only when new evidence warrants it. A review with no
substantiated findings is complete. Use another reviewer or a broader test run to
resolve a concrete remaining risk, rather than repeating reviews indefinitely.

Keep a short note in the PR description or existing task record when work spans
sessions. Include only decisions and evidence that will change the next action:

- **Outcome and scope:** intended behaviour and explicit exclusions.
- **Decisions:** chosen behaviour, rationale, deferred issues and when to revisit.
- **Validation:** revision or local diff checked, actual commands, environment,
  results and remaining checks.
- **Delivery:** local commit, published head and any outstanding action or block.

If the code changes after validation, rerun the checks affected by that change.
When publishing is requested, verify the remote branch contains the intended
commit. If publishing is blocked, preserve the patch and identify that remaining
step. Do not equate a local commit with a delivered change.

## Trying the pilot day to day

Use normal tasks and PRs. Note when this workflow prevented a repeated finding,
helped select a useful check, missed important context or added unnecessary work.
Keep feedback in the existing task record or pilot PR when one exists. Adjust the
guidance from those examples; a model evaluation or an extra reviewer is not a
gate on every PR.
