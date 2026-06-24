# Consumer Repo Workflow Example

This workflow example is the smallest external-consumer repo shape Salt expects.

Use it as a file-layout reference, not as the canonical workflow guide. Consumers should be able to use Salt from [`../../site/docs/getting-started/ai.mdx`](../../site/docs/getting-started/ai.mdx) alone.

## Example Layout

```text
consumer-app/
├── AGENTS.md
├── package.json
├── mcp.config.example.json
└── .salt/
    └── team.json
```

## Files

- `package.json`
  - minimal React app dependencies that consume Salt, plus a `ui:verify` review script
- `mcp.config.example.json`
  - example Salt MCP configuration
- `AGENTS.md`
  - the shared repo workflow contract for Salt UI tasks
- `.salt/team.json`
  - the default repo-local conventions file
- `.github/copilot-instructions.md`
  - optional VS Code adapter generated only when a repo wants host-specific scaffolding

## What This Example Shows

- `salt-ds + MCP` as the default path
- an IDE-first workflow order of `review`, `upgrade`, `migrate`, then `create`
- zero-config canonical Salt value before repo policy exists
- `.salt/team.json` as the default conventions layer
- root `AGENTS.md` as the shared cross-IDE workflow contract
- VS Code adapters generated from the same repo contract only when explicitly requested
- `salt-ds init` as the optional step that adds durable repo policy and the managed root instruction block after first-run value
- `ui:verify` as an optional repo-local wrapper around `salt-ds review`
- `salt-ds + CLI` as the restricted-environment fallback when MCP is blocked
- manual CLI kept workflow-first through `salt-ds info`, `salt-ds create`, `salt-ds review`, `salt-ds migrate`, and `salt-ds upgrade`
- `salt-ds doctor` and `salt-ds runtime inspect` reserved for runtime evidence and support work

## Important Boundary

- Salt MCP stays canonical for Salt decisions.
- `.salt/team.json` stays repo-local.
- `.salt/stack.json` is optional and advanced, not the default.
- runtime evidence supports a workflow; it does not replace canonical Salt guidance.

## Demo: agent provenance attestations

`salt-ds init --add-agent-hooks` writes a `.github/hooks/salt.json` manifest
that wires three hook commands: `PostToolUse` runs review on edited files,
`SessionStart` warms the agent's context, and `Stop` verifies attestation
drift at end of session.

This example uses a single-file NDJSON store at `.salt/attestations.ndjson`
because it is the smallest thing that works. **Salt does not pick this
path**; it is a demo default. Production repos can substitute git notes,
signed commits, a check-API call, a SIEM event, or any other audit store
they already operate. The Stop hook command Salt writes is:

```
npx salt-ds review --verify-attestations
```

…which reads from stdin. The wiring that gets your store into stdin is the
consumer's choice.

### Wiring for this demo

1. The `PostToolUse` hook pipes its stdout (the attestation NDJSON line) into
   `.salt/attestations.ndjson`. In `.github/hooks/salt.json`, change the
   `PostToolUse` command from `npx salt-ds review --hook` to:

   ```
   npx salt-ds review --hook --emit-attestation >> .salt/attestations.ndjson
   ```

2. The `Stop` hook reads the same file back. Change the `Stop` command from
   `npx salt-ds review --verify-attestations` to:

   ```
   npx salt-ds review --verify-attestations < .salt/attestations.ndjson
   ```

3. Add `.salt/attestations.ndjson` to `.gitignore` if you do not want the
   audit log committed. Adding the file to git is also a valid choice — that
   is exactly what makes `git notes` a viable alternative store.

Salt does not pick the hashing algorithm (`hash_alg` is per-payload, default
`sha256`), the retention policy, the GC story, or the bypass mechanism. See
`packages/cli/docs/ci-integration.md` for the full composition pattern.

## Related Docs

- [`../../packages/skills/README.md`](../../packages/skills/README.md)
- [`../../site/docs/getting-started/ai.mdx`](../../site/docs/getting-started/ai.mdx)
- [`../project-conventions/README.md`](../project-conventions/README.md)
