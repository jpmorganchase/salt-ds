# Salt UI local preview with GitHub Copilot CLI

Use this repository-local preview to make an authorized Salt UI change with a
creator, independent reviewer, and repair loop. It is not a package installer,
a registry workflow, or a second source of Salt component guidance.

## Prerequisites

Install and authenticate the official [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/install-copilot-cli).
The native preview was exercised with version 1.0.83 on Windows. Available models
and authentication depend on the host account; the Skill does not supply either.

Use a project that already has the matching local Salt CLI and Knowledge cohort,
its manifest and lockfile, and its ordinary browser and project checks. The
project-local CLI must report compatible packages before Salt-specific choices:

```sh
node ./node_modules/@salt-ds/cli/bin/salt-ds.js info --json
```

If the project uses a different package layout, locate the declared local CLI
binary instead. Do not use `npx`, a registry, or a cache to fill a missing
package. The candidate is unreleased; maintainers prepare and verify its local
package cohort through the existing [contributor build and pack guide](contributing.md#current-workflow-authoring).
Use the existing [CLI workflow](../../packages/cli/README.md#workflow) for
workspace selection and bounded local retrieval.

Copy these three files together, keeping their repository-relative paths:

```text
skills/salt-ui/SKILL.md
.github/agents/salt-ui-creator.agent.md
.github/agents/salt-ui-reviewer.agent.md
```

## Run the preview

Start the creator interactively:

```sh
copilot --agent salt-ui-creator
```

Supply the authorized task in that session. For example, ask the creator to add incident editing to an existing operations
dashboard, select local Salt coverage for the visible roles, preserve an
unfinished draft when moving to the worklist and back, cover validation,
pending, failure and retry, and verify a second created incident without losing
the first. Supply the application's route, data, state, and acceptance seams;
the creator does not replace them with a demo stack.

After its initial diff and browser/project evidence, the creator hands the task,
diff, selection evidence, browser states, and check results to the named,
read-only `salt-ui-reviewer` subagent. The reviewer independently retrieves only
needed local Salt records and returns findings, limitations, or `REVIEW PASS`.
The creator repairs actionable in-scope findings and reruns affected checks. A
source-changing repair receives a fresh independent confirmation. The flow stops
after two repair cycles; unresolved findings, missing evidence, or unavailable
delegation are reported as incomplete rather than self-reviewed success.

## What the preview currently establishes

On Windows, GitHub Copilot CLI 1.0.83 loaded `salt-ui-creator` through `--agent`
and delegated to the named `salt-ui-reviewer`. A saved-report library and a
project-team modification completed native creation, review and repair. Both
saved preview copies passed independent type, build and browser checks. Their
final native reviewers retrieved task-relevant local records and viewed actual
screenshots after source edits stopped. The team review required a further
evidence repair before passing.

See the [follow-up outcome](../../evals/salt-ai/ui-agent/FOLLOW_UP_RESULTS.md)
for the observed defects, repairs, retained evidence and exact limits. This is
a supervised local delivery result: it does not establish unattended success,
model availability for another account, cost or a quality advantage. The apps
use in-memory fixture state, so refreshing clears their records.

Codex native profile activation and VS Code extension activation remain
unverified. If a host cannot discover the profiles, create the named reviewer,
or retain the reviewer's read-only role, stop and report that limit. Supplying
the instructions to an ordinary agent can test role behavior, but does not prove
native profile activation or an independent review-and-repair result.

The profiles follow the official [GitHub Copilot custom-agent
configuration](https://docs.github.com/en/copilot/reference/custom-agents-configuration).
`skills/salt-ui/SKILL.md` remains the sole authored behavioral source. The
existing `skills/salt-design-system/SKILL.md`, Knowledge inputs, and published
agent-support contract remain unchanged.
