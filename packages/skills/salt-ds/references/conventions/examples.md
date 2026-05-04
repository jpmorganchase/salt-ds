# Examples

## Contents

- [Repo Instruction Snippet](#repo-instruction-snippet)
- [Preferred Component](#preferred-component)
- [Approved Wrapper](#approved-wrapper)
- [Pattern Preference](#pattern-preference)
- [Banned Choice](#banned-choice)
- [Keep It Small](#keep-it-small)

Use the bundled template first, then add only the rule sections the repo actually needs.

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

When bootstrapping a simple repo, pair `.salt/team.json` with a short repo instruction block. Create or update `AGENTS.md` by default when the repo has no established repo-local instruction file. If the repo already uses `CLAUDE.md` or another repo-local instruction file, update that file instead of creating a second one.

```md
Use the Salt MCP for canonical Salt guidance.

If a Salt workflow result says project conventions matter:

- keep repo-local policy in `.salt/team.json` when it exists
- use `.salt/stack.json` only when the repo already declares layered upstream policy
- use repo-aware Salt workflows so Salt applies the declared project conventions
- keep the canonical Salt choice visible as provenance
```

Keep this snippet small. Do not introduce `.salt/stack.json` in the default bootstrap unless the repo genuinely has shared upstream layers.

## Preferred Component

Use when the repo replaces a canonical Salt answer with one approved local component:

```json
{
  "salt_name": "<canonical-salt-name>",
  "prefer": "<repo-wrapper-name>",
  "reason": "<repo policy reason>",
  "docs": ["./docs/<repo-wrapper>.md"]
}
```

## Approved Wrapper

Use when the repo wants the canonical Salt primitive to stay visible, but wrapped:

```json
{
  "name": "<repo-wrapper-name>",
  "wraps": "<canonical-salt-name>",
  "import": {
    "from": "@/components/<RepoWrapper>",
    "name": "<repo-wrapper-name>"
  },
  "reason": "<repo policy reason>",
  "use_when": ["<repo-approved use>"],
  "avoid_when": ["<repo-specific avoid>"],
  "migration_shim": false,
  "docs": ["./docs/<repo-wrapper>.md"]
}
```

## Pattern Preference

Use when the repo has one approved shell or page pattern:

```json
{
  "intent": "<repo intent>",
  "prefer": "<repo-pattern-name>",
  "canonical_salt_start": "<canonical-salt-pattern-name>",
  "reason": "<repo policy reason>",
  "docs": ["./docs/<repo-pattern>.md"]
}
```

## Banned Choice

Use when a repo bans one canonical choice:

```json
{
  "name": "<canonical-salt-name>",
  "reason": "<repo policy reason>",
  "replacement": "<repo-approved-replacement>",
  "docs": ["./docs/<policy-doc>.md"]
}
```

## Keep It Small

- Start with one or two rule sections if that covers the repo.
- Do not add every wrapper in the repo if only a few matter for agent decisions.
- Prefer a small file with clear reasons over a large catalog of implementation details.
- Bootstrap with `.salt/team.json` plus a small repo instruction snippet before introducing `.salt/stack.json`.
- For a repo with no existing instruction file, that bootstrap companion should normally be `AGENTS.md`.

## Optional Working Agreement

If repeated accepted deviations or host/tool constraints keep resurfacing, pair the conventions files with a short working agreement generated from `assets/salt-working-agreement.template.md`. Keep it short and decision-oriented.
