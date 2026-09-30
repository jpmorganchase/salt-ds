---
status: proposed
date: 2026-09-30
---

# salt-eval lives in the Salt repository, at `salt-eval/`

salt-eval stays in the salt-ds repository as a top-level `salt-eval/` folder, not in a separate repository and not under `packages/`, `tooling/` or `test/`. Its job is to tell the Salt team whether a change to Salt guidance, components or context products helped. That loop is shortest when the guidance, the task bank's anchors to it and the evidence change in the same branch, and when agents improving Salt can read the eval's context.

## Considered options

- **A separate repository.** It would enforce independence from any one context product and keep confidential tasks out of a public repository by default. Rejected for now: it breaks the same-branch loop (change the docs, rebuild the context product, rerun the targeted tasks), anchors can't be checked against the docs at the same commit and agents working on Salt guidance lose the eval's context. Its two advantages are kept another way: a private store holds confidential material, and the isolation rules keep the agent under test away from the repository.
- **`tooling/salt-eval` or `packages/salt-eval`.** Rejected because the root workspace globs `packages/**` and `tooling/**` are recursive. Every starting-point app inside would become a Yarn workspace and resolve `@salt-ds/*` to local source, so the agent under test would see unreleased Salt code instead of a consumer install. `packages/` also implies a published library.
- **`test/salt-eval`.** Rejected because `test/` holds Salt's own browser and performance tests. salt-eval evaluates agents and context products, runs on a different cadence and carries its own data.

## Consequences

- This repository is public, so held-out tasks, tasks derived from internal work and all run outputs live in a private store outside git.
- Trials never run inside the repository ([AGENTS.md](../../AGENTS.md), invariant 1), so the agent can't read Salt source, repository rules or the task bank.
- salt-eval reads Salt facts from installed packages, not from `packages/*` source, which keeps moving it out cheap.
- How salt-eval joins the Yarn project, as a listed workspace or a standalone project with its own lockfile, is decided when the first code lands.

## Revisit when

- most tasks become confidential,
- the eval has to cover more than Salt, such as other design systems or many consuming repositories,
- its dependencies or CI needs conflict with salt-ds's public CI or
- ownership moves to a team outside Salt.
