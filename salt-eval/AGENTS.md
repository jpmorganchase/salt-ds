# Agent instructions for salt-eval

These instructions apply to any coding agent working in `salt-eval/`. The repository's rules for authoring Salt components don't apply to harness code; its TypeScript and Biome conventions do.

## Before you start

1. Read [README.md](./README.md), then [CONTEXT.md](./CONTEXT.md). Use its terms exactly. If you need a new term, add it to CONTEXT.md in the same change.
2. Find the task you're working on in [roadmap.md](./roadmap.md). Work on one roadmap task at a time.
3. Read the document for the area you're changing: [tasks](./docs/tasks.md), [grading](./docs/grading.md), [experiments](./docs/experiments.md) or [architecture](./docs/architecture.md).

## Invariants

Never break these. If a task seems to require it, stop and ask.

1. **No trial runs inside this repository.** Copy the starting point to a directory outside the repository and install Salt from a registry or from packed tarballs. Never link to `packages/*` source. The agent under test must not be able to read Salt source, repository rules, tasks, checks or reference solutions.
2. **Nothing confidential or held-out goes into git.** This repository is public. Held-out tasks, tasks derived from internal J.P. Morgan work, transcripts and outputs live in the private store.
3. **Every check is justified and tested.** It cites the request or a guidance anchor, passes on the reference solution and fails on a known-bad output.
4. **No comparison without pins and noise.** A reported difference names both arms' pins, the number of tasks and trials and the noise floor.
5. **No tuning on held-out tasks.** Don't read held-out tasks or their traces while changing a context product. Never copy task text or failing outputs into a context product.
6. **Salt facts come from the pinned Salt version:** its published types, docs and changelog. Not from memory.

## Working on tasks

- Follow the acceptance checklist in [docs/tasks.md](./docs/tasks.md).
- Write the "why it's hard" line first. If you can't, the task isn't ready.
- Don't name Salt components in a request unless the task's specificity is API-level.

## Working on the harness

- Build the smallest thing that runs one task end to end. Then stop and read the output.
- Keep Salt coupling at the package boundary. Read Salt facts from the installed packages, not from `packages/*` source, so salt-eval can leave this repository cheaply ([ADR 0001](./docs/adr/0001-salt-eval-lives-at-repo-root.md)).
- Prefer the repository's existing toolchain (TypeScript, Biome, Vitest, Playwright, axe-core) over new dependencies.

## Recording decisions

- A decision that is hard to reverse, surprising without context and the result of a real trade-off gets an ADR in `docs/adr/`.
- When you finish a roadmap task, tick it and add one line of evidence: a link to a report, a trial page or a pull request.

## Writing docs

- Link to files, never to `#section` anchors or folders, and name the section in the text instead: see "Isolation" in `docs/architecture.md`. Section and folder links don't open reliably in the editor.
