# Examples

Use the bundled template first. Then add only the rule sections the repo actually needs.

If your organization has both line-of-business and team conventions, keep them in separate files that both use `project_conventions_v1`. The LoB file should carry shared defaults; the team file should only add or override what is local to that repo.

Default layout:

```text
repo/
├── AGENTS.md
└── .salt/
    └── team.json
```

Layered upgrade:

```text
.salt/
├── team.json
├── stack.json
└── lob.local.json
```

## Repo Instruction Snippet

When bootstrapping a simple repo, pair `.salt/team.json` with a short repo instruction block:

- create or update `AGENTS.md` by default when the repo has no established repo-local instruction file
- if the repo already uses `CLAUDE.md` or another repo-local instruction file, update that file instead of creating a second one

```md
Use the Salt MCP for canonical Salt guidance.

If a Salt MCP response sets `guidance_boundary.project_conventions.check_recommended` to `true`:

- read `.salt/team.json` if it exists
- if `.salt/stack.json` also exists, resolve layers in that order instead
- let project conventions override the final project answer
- keep the canonical Salt choice visible as provenance
```

Keep this snippet small. Do not introduce `.salt/stack.json` in the default bootstrap unless the repo genuinely has shared upstream layers.

## Preferred Component

Use when the repo replaces a canonical Salt answer with one approved local component:

```json
{
  "salt_name": "Button",
  "prefer": "AppButton",
  "reason": "Product actions use AppButton for analytics and approved defaults.",
  "docs": ["./docs/app-button.md"]
}
```

## Approved Wrapper

Use when the repo wants the canonical Salt primitive to stay visible, but wrapped:

```json
{
  "name": "AppButton",
  "wraps": "Button",
  "import": {
    "from": "@/components/AppButton",
    "name": "AppButton"
  },
  "reason": "Adds analytics and approved defaults without changing the underlying Salt primitive.",
  "use_when": ["primary product actions", "toolbar actions"],
  "avoid_when": ["sandbox examples"],
  "migration_shim": false,
  "docs": ["./docs/app-button.md"]
}
```

## Pattern Preference

Use when the repo has one approved shell or page pattern:

```json
{
  "intent": "workspace shell navigation",
  "prefer": "WorkspaceShell",
  "canonical_salt_start": "VerticalNavigation",
  "reason": "The repo composes canonical Salt navigation primitives into one approved shell wrapper.",
  "docs": ["./docs/workspace-shell.md"]
}
```

## Banned Choice

Use when a repo bans one canonical choice:

```json
{
  "name": "UNSTABLE_SaltProviderNext",
  "reason": "The repo is standardized on SaltProvider only.",
  "replacement": "SaltProvider",
  "docs": ["./docs/platform-conventions.md"]
}
```

## Keep It Small

- Start with one or two rule sections if that covers the repo.
- Do not add every wrapper in the repo if only a few matter for agent decisions.
- Prefer a small file with clear reasons over a large catalog of implementation details.
- Bootstrap with `.salt/team.json` plus a small repo instruction snippet before introducing `.salt/stack.json`.
- For a repo with no existing instruction file, that bootstrap companion should normally be `AGENTS.md`.
