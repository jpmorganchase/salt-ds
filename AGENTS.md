# Working on Salt

Use the [maintainer workflow](.github/maintainer-workflow.md) for implementation,
bug fixes and reviews. Keep the work proportional to the change.

## Start with the existing guidance

[CONTRIBUTING.md](CONTRIBUTING.md) is the source of truth for setup and contribution
procedures. Read the sections relevant to the task:

- [Icons](CONTRIBUTING.md#how-to-add-a-new-icon): source assets, generation, synonyms,
  tests and changesets.
- [React compatibility](CONTRIBUTING.md#supporting-react-16-to-19) and
  [render props](CONTRIBUTING.md#render-prop-support): public component, hook, context,
  ref and composition changes.
- [Deprecation](CONTRIBUTING.md#prop-deprecation),
  [theming](CONTRIBUTING.md#theming) and
  [pull requests](CONTRIBUTING.md#pull-requests): relevant release and review steps.

Run `node scripts/maintainerContext.mjs` for a read-only summary of the local branch,
changes and relevant guidance. It does not fetch remote state, inspect PR reviews
or run checks. See the workflow for base-ref options and the remaining context to
collect.

## Working rules

- When a PR exists, read its current revision, CI results and relevant previous
  decisions before reviewing. Preserve explicit scope exclusions and accepted
  limitations.
- State the observable behaviour affected by the change. Include exported hooks,
  contexts and supported consumer compositions when relevant.
- Reuse existing scripts, helpers and fixtures. For a regression, identify the
  plausible wrong result that the test must reject and establish that it does.
- Support required findings with a trigger, violated contract, impact and evidence.
  Distinguish an open question or optional preference from a confirmed defect.
- Report which checks ran, their scope and any remaining uncertainty. Do not infer
  that a failure is unrelated or flaky without evidence.
- Complete the requested delivery and verify its state. Distinguish local work from
  published work; keep blocked work recoverable.
- Stop when the requested behaviour has sufficient evidence. No additional findings
  is a valid review result.
