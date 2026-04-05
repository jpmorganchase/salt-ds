# Shared Conventions Pack Happy Path

This is the shortest end-to-end example for a beta team testing shared layered policy without adopting a second Salt product.

## 1. Keep the workflow on `salt-ds`

The team installs and uses:

- `salt-ds`

If MCP is allowed, also connect:

- `@salt-ds/mcp`

The workflow stays the same either way.

## 2. Start with repo-local policy

```text
.salt/
└── team.json
```

Use `salt-ds init` if the repo has not adopted Salt policy yet.

## 3. Add shared upstream policy only when needed

If the organization publishes shared conventions, add `.salt/stack.json`:

```json
{
  "contract": "project_conventions_stack_v1",
  "layers": [
    {
      "id": "lob-defaults",
      "scope": "line_of_business",
      "source": {
        "type": "package",
        "specifier": "@example/lob-salt-conventions",
        "export": "markets"
      }
    },
    {
      "id": "team-checkout",
      "scope": "team",
      "source": {
        "type": "file",
        "path": "./team.json"
      }
    }
  ]
}
```

Use a file-backed layer first if the team only wants a local trial.

## 4. Inspect the result with `salt-ds info --json`

Run:

```sh
salt-ds info . --json
```

Important fields:

- `policy.stackLayers`
  - every detected file-backed and package-backed layer
- `policy.stackLayers[*].resolution.status`
  - whether each layer resolved cleanly
- `policy.stackLayers[*].resolution.resolvedPath`
  - where the layer actually resolved from
- `policy.sharedConventions.enabled`
  - whether the repo is using the shared package-backed conventions-pack path
- `policy.sharedConventions.packDetails`
  - the shared pack name, export, installed version, resolution status, and resolved path

For a healthy package-backed path, expect something like:

```json
{
  "policy": {
    "mode": "stack",
    "sharedConventions": {
      "enabled": true,
      "packCount": 1,
      "packDetails": [
        {
          "id": "lob-defaults",
          "packageName": "@example/lob-salt-conventions",
          "exportName": "markets",
          "version": "1.2.3",
          "status": "resolved"
        }
      ]
    }
  }
}
```

## 5. Keep the job workflow unchanged

After policy is in place, teams still use the same jobs:

- `salt-ds create`
- `salt-ds review`
- `salt-ds migrate`
- `salt-ds upgrade`

The layered policy should refine the final answer, not become a second workflow product.
