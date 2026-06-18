# @salt-ds/cli

Private Salt DS AI tooling support package.

The first public AI tooling release does not ship `@salt-ds/cli` as a consumer workflow product. Consumers should install the MCP server instead:

```sh
npx -y @salt-ds/mcp@latest
```

The CLI package remains in the workspace for internal experiments and support workflows that may inform a later release. Do not document `salt-ds create`, `salt-ds review`, `salt-ds migrate`, `salt-ds upgrade`, runtime inspection, hooks, attestations, or package install instructions as public v1 behavior.

Public v1 workflow ownership:

- MCP owns canonical Salt workflow guidance.
- The optional `salt-ds` skill owns routing and gate-following instructions.
- Hosts own local edits, installs, test runs, runtime evidence, and user-facing explanation.
