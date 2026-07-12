# Layered Conventions Happy Path

This is the shortest end-to-end example for a team testing shared layered
policy through the read-only Salt MCP workflow.

## 1. Connect Salt MCP

Configure `@salt-ds/mcp` in the host and use the public repo-aware tools:

- `create_salt_ui`
- `review_salt_ui`
- `migrate_to_salt`

There is no separate CLI workflow or initialization step.

## 2. Start with reviewed repo-local policy

```text
.salt/
└── team.json
```

Copy `project-conventions.example.json` to `.salt/team.json`, then adapt and
review the rules for the repo. Salt MCP reads policy but does not create or
mutate these files.

## 3. Add shared upstream policy only when needed

If the organization publishes shared conventions, copy the reviewed JSON into
the consumer repo (for example `.salt/lob.json`) and add `.salt/stack.json`:

```json
{
  "contract": "project_conventions_stack_v1",
  "layers": [
    {
      "id": "lob-defaults",
      "scope": "line_of_business",
      "source": {
        "type": "file",
        "path": "./lob.json"
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

All layers are data-only JSON files contained within the declared repo root.
Package-backed JavaScript policy is deliberately unsupported, so policy
inspection cannot execute code in the MCP process.

## 4. Inspect policy through a repo-aware workflow

Call the relevant workflow with an explicit `root_dir`. For example:

```json
{
  "query": "Create a compact account-actions toolbar using approved repo conventions.",
  "root_dir": "/absolute/path/to/consumer-repo"
}
```

Inspect:

- `workflow.project_conventions_check`
  - whether declared policy was detected and whether a conventions check was required
- `artifacts.project_policy.layersConsulted`
  - the repo-local JSON layers loaded for this workflow
- `artifacts.project_policy.warnings`
  - missing, escaped, oversized, or invalid layers and incomplete policy details

Use `get_salt_project_context` separately only when the resolved repo root or
installed Salt package state is disputed.

## 5. Keep the workflow unchanged

After policy is in place, teams still use the same public MCP tools:

- `create_salt_ui`
- `review_salt_ui`
- `migrate_to_salt`

Layered policy refines the source-backed Salt guidance. It does not become a
second workflow product, and Salt MCP does not mutate project files.
