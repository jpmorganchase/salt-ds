# Copilot Host Guidance

Use this file when the consumer is working in VS Code Copilot or IntelliJ Copilot.

## Host Reality

The host may have uneven tool availability, noisy terminal output, partial chat-session resources, and a strong bias toward momentum.
Counter that by making workflow completion explicit.

## Scope Rules

- Bias toward the current file, current selection, active feature folder, and nearby imports before broad repo sweeps.
- Read only enough surrounding files to ground the Salt decision.
- Do not convert a narrow bug-fix into a repo-wide architecture sweep unless the root cause demands it.

## Tool Availability Rules

- Confirm whether MCP tools are actually available before planning around them.
- If the host lacks MCP, say so and switch to the CLI.
- If shell tools such as `rg` are missing, switch to host-native alternatives without changing the Salt workflow story.
- Do not confuse host limitations with Salt guidance.

## Completion Rules

- Large output is not the same as successful output.
- A generated patch is not proof that canonical Salt discovery completed.
- A successful build is not proof that the Salt workflow contract completed.
- For create and migrate work, run source-level Salt validation after the first scaffold pass when code is available.
- For create work, prefer `compact -> retrieval support -> exact follow-through -> full only when needed`.
- If compact create is still `partial` or `blocked`, inspect the catalog support surface before escalating:
  - MCP: `salt://catalog/candidates/{query}` and `salt://catalog/entity/{name}`
  - CLI fallback: `salt-ds info --json --catalog-query "<prompt>"` and `salt-ds info --json --entity "<name>"`
- Do not let the host paraphrase a grounded exact entity back into a broader prompt on the next call.

## Communication Rules

- Keep user-visible progress updates honest: say when you are switching transport, when a result is partial, and when a region is still unresolved.
- If the host made a best-effort fallback, name that fallback.
- If a required follow-through item is still open, say so before showing implementation.
