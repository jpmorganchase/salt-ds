# Consumer Repo Setup

This is the supporting setup reference for teams using Salt in a separate application repo.

The AI tooling is experimental. Keep the setup small and workflow-first.

Start from the main AI page first:

- [`../../../site/docs/getting-started/ai.mdx`](../../../site/docs/getting-started/ai.mdx)

Use this doc when you need the longer setup/reference details behind that page.

## Default Model

Use the stack like this:

- `salt-ds`
  - the `salt-ds` workflow layer for consumers
- Salt MCP
  - the preferred transport for canonical Salt guidance
- Salt CLI
  - the fallback transport when MCP is blocked
- `.salt/team.json`
  - the default repo-local policy file
- runtime evidence
  - optional second-pass verification only

If nothing else in this guide applies, start there.

## 1. Install The `salt-ds` Skill

`salt-ds` is the public Salt workflow skill for consumers.

Use the current verified install source from [`skills-install-source.md`](./skills-install-source.md).

Use `salt-ds` as the front door for:

- bootstrap repo conventions
- build new Salt UI
- review existing Salt UI
- migrate non-Salt UI into Salt
- upgrade Salt versions and deprecated usage

## 2. Configure Salt MCP

Add the Salt MCP to your agent configuration:

```json
{
  "mcpServers": {
    "Salt": {
      "command": "npx",
      "args": ["@salt-ds/mcp@latest"]
    }
  }
}
```

Use MCP whenever it is available. It is the preferred path to canonical Salt lookup, recommendation, translation, validation, and upgrade guidance.

Consumer operating guides:

- [`getting-good-results.md`](./getting-good-results.md)
- [`troubleshooting.md`](./troubleshooting.md)

If MCP is blocked, install the published CLI fallback:

```sh
npx -y @salt-ds/cli@latest info . --json
```

Or install it once with:

```sh
npm install -g @salt-ds/cli
```

Then use the `salt-ds` command directly when a local fallback or manual path is needed.

## 3. Separate Detected Context From Declared Policy

Use detected context and declared policy for different jobs:

- `salt-ds init`
  - bootstrap the default `.salt/team.json` plus repo instruction file when a repo has not adopted Salt policy yet
- `salt-ds info --json`
  - detected repo context such as framework, workspace shape, Salt packages, imports, repo instructions, and runtime targets
- `.salt/team.json`
  - declared team policy such as approved wrappers, banned choices, and local pattern preferences

Do not treat `.salt/team.json` as the whole project model.

## 4. Add Project Policy Only When The Repo Needs It

Keep repo-local wrappers, shells, layout rules, and banned choices outside the core Salt MCP.

Use project conventions when the repo has:

- approved wrapper components
- page-shell or navigation-shell rules
- local layout or pattern preferences
- migration shims
- banned choices that change the final project answer

Recommended location:

```text
.salt/team.json
```

For most teams, that is enough:

1. keep `.salt/team.json` in the repo
2. tell the agent to read it only when `guidance_boundary.project_conventions.check_recommended` is `true`
3. apply those repo-local conventions after the canonical Salt step

Treat `.salt/stack.json` as an advanced layered upgrade only when the repo genuinely needs layering. That can mean local file-backed layers for one repo, or shared package-backed layers for repos using a shared conventions pack. Do not make it part of the default consumer path.

For teams using shared conventions packs, the thing your organization publishes should be a shared conventions pack, for example `@acme/salt-conventions`. The thing your repo installs and uses is still `salt-ds`.

## 5. Work By Workflow

Use workflows, not tool lists, as the main mental model.

### Bootstrap Repo Conventions

- use `salt-ds`
- generate or clean up `.salt/team.json`
- add a small repo instruction snippet to `AGENTS.md` or the repo's existing instruction file

### Build New UI

- use `salt-ds`
- let it choose the canonical Salt path first
- apply `.salt/team.json` only if the guidance boundary says repo conventions matter
- validate the first pass before treating the job as complete

### Review Existing UI

- use `salt-ds`
- keep canonical Salt findings separate from repo-local adjustments
- use runtime evidence only if source reasoning is still insufficient

### Migrate Into Salt

- use `salt-ds`
- say explicitly that the starting point is non-Salt UI and should be translated into Salt
- treat project conventions as a downstream refinement, not as the canonical source

### Upgrade Salt Versions

- use `salt-ds`
- establish the version boundary first
- re-run validation after the upgrade changes are made
- keep leftover CSS overrides and shims as explicit cleanup decisions

## 6. Keep The Workflow Names Stable Across Transports

The user-facing workflows should not change just because the transport changes.

When MCP is available, let the `salt-ds` skill use it as the canonical transport underneath.

On the MCP path, establish repo context first, then choose the main workflow. The user-facing workflow names should still stay `create`, `review`, `migrate`, and `upgrade`.

Do not teach underlying MCP tool names as part of the consumer workflow. Consumers should think in:

- create
- review
- migrate
- upgrade
- review with runtime evidence when needed

## 7. No-MCP Environments

When MCP is unavailable, keep the same workflow model:

- the same `salt-ds` skill should remain the front door
- the environment should fall back to the Salt CLI underneath
- use `salt-ds info --json` as the detected-context entry point when the CLI is driving the workflow
- use `salt-ds init` first when the repo still needs `.salt/team.json` and repo instructions
- keep the public CLI workflow-first through `salt-ds create`, `salt-ds review`, `salt-ds migrate`, and `salt-ds upgrade`

Use `salt-ds review --url <url>` when source validation and runtime evidence should stay in the same workflow pass. Keep `salt-ds doctor` and `salt-ds runtime inspect` in the runtime-evidence layer.

Do not introduce a second manual command vocabulary for restricted environments. Keep the same workflow commands and let the CLI handle the canonical Salt reasoning underneath.

## 8. Runtime Evidence

Keep runtime evidence in a second pass:

1. canonical Salt reasoning first
2. repo policy second
3. runtime evidence only when uncertainty remains

Use the evidence layer like this:

- cheap URL fetch or fetched HTML
  - title, status, coarse structure, obvious landmarks
- `salt-ds doctor`
  - when the reachable Storybook or app target is unclear
- `salt-ds review <path> --url <url>`
  - when source validation and runtime evidence should stay in the same workflow pass
- `salt-ds runtime inspect <url>`
  - when the task is explicitly evidence-only debugging or support work and the target URL is already known

Do not use runtime inspection to decide canonical Salt component or pattern choice.

## Keep The Layers Clear

- Salt MCP answers:
  - what is the nearest correct Salt answer
- project policy answer:
  - how this repo wants Salt applied
- detected context answer:
  - what this repo looks like right now
- skills answer:
  - what workflow to follow and what evidence to gather

Do not treat repo-specific wrappers or local patterns as if they came from the Salt registry.

## Related Docs

- [`../../../site/docs/getting-started/ai.mdx`](../../../site/docs/getting-started/ai.mdx)
- [`../README.md`](../README.md)
- [`getting-good-results.md`](./getting-good-results.md)
- [`troubleshooting.md`](./troubleshooting.md)
- [`beta-guide.md`](./beta-guide.md)
- [`skills-install-source.md`](./skills-install-source.md)
- [`../../skills/README.md`](../../skills/README.md)
- [`consuming-project-conventions.md`](./consuming-project-conventions.md)
- [`project-conventions-contract.md`](./project-conventions-contract.md)
- [`../../workflow-examples/consumer-repo/README.md`](../../workflow-examples/consumer-repo/README.md)
