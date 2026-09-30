# salt-eval

A benchmark for AI coding agents that build React interfaces with the Salt Design System. It exists to answer two questions:

1. **Does Salt context help agents produce better UI?** We run the same tasks under arms that differ only in the Salt context the agent gets (none, docs, an MCP server, a skill or a combination) and compare pass rates task by task.
2. **When it doesn't, what should we improve?** Every failed check is traced to a cause: a guidance gap, unclear guidance, a retrieval miss, tool misuse, misinterpretation, a prior override, an implementation error or an eval defect. Each cause points to a different fix.

## Status

Design phase. These documents are the brief for the code; there is no harness yet. Next steps are in [roadmap.md](./roadmap.md), starting with Phase 0.

## Scope

| salt-eval is                                               | salt-eval isn't                                                                 |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Outcome-based: it grades the UI the agent produced         | A contract test for one context product (the MCP's own evals stay with the MCP) |
| Product-agnostic: any context product can be an arm        | A model leaderboard                                                             |
| Real coding agents working in real starting points         | A single "Salt compliance" score                                                |
| Automated checks, validated judgment and transcript review | A merge gate for Salt pull requests, until its numbers earn that                |

## Principles

1. **Tasks before infrastructure.** The task bank is the product. Build only the harness the current tasks need.
2. **Every metric maps to a decision.** If a number can't change what we do next, we don't report it.
3. **Grade outcomes, not imports.** Importing Salt or using a token proves nothing. Rendered behavior, composition and cited guidance do.
4. **Grade only what the task or Salt guidance states.** If two Salt experts could disagree on a verdict, it isn't a check.
5. **The agent never sees the answers.** Trials run outside this repository, and held-out tasks and run outputs never enter git.
6. **Read transcripts before trusting numbers.** A score tells you which transcripts to read, not what happened.
7. **Change one thing at a time,** and report every difference with its noise floor.

## Reading order

1. [CONTEXT.md](./CONTEXT.md): the vocabulary. Use these terms in tasks, code and conversation.
2. [docs/tasks.md](./docs/tasks.md): what a good Salt task is, with worked examples. The most important document here.
3. [docs/grading.md](./docs/grading.md): checks, rubric items, judges and failure attribution.
4. [docs/experiments.md](./docs/experiments.md): how to compare arms without fooling ourselves.
5. [docs/architecture.md](./docs/architecture.md): the harness that runs and records a trial.
6. [roadmap.md](./roadmap.md): what to build next and how we'll know it worked.

Background: [docs/prior-art.md](./docs/prior-art.md) covers what we took from Atlassian, Anthropic and our own earlier attempts. [docs/adr/](./docs/adr/) records decisions, starting with [why salt-eval lives here](./docs/adr/0001-salt-eval-lives-at-repo-root.md). Agents working in this folder follow [AGENTS.md](./AGENTS.md).

## Layout

This folder holds documentation only. Folders for tasks, starting points, arms and the harness are created by roadmap tasks once they have content.

Held-out tasks, confidential tasks and all run outputs live in a private store outside git. See [what lives where](./docs/architecture.md#what-lives-where).
