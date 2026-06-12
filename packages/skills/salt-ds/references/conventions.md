# Salt DS — Conventions Reference

## project conventions

Use this only when a consumer application repo has wrappers, page patterns, shells, or migration conventions that may change the final answer.

## Rules

- Treat the core Salt MCP as canonical Salt guidance only.
- If a Salt workflow result says project conventions matter, make sure declared repo policy exists and let the repo-aware Salt workflow apply it before finalizing the answer.
- The default consumer setup is `.salt/team.json`.
- For a simple bootstrap with no existing repo-local instruction file, pair `.salt/team.json` with `AGENTS.md` by default.
- If the repo already uses `CLAUDE.md` or another repo-local instruction file, update that existing file instead of creating a second one.
- Add `.salt/stack.json` only when the consumer wants layered conventions such as `Salt -> LoB -> Team`.
- Do not require consumers to implement deterministic layered merge in normal repos; repo-aware Salt workflows should own it.
- Do not require a standalone `salt-project-conventions doctor` command in consumer repos today.
- Validate the conventions shape from the contract and file contents directly until a consumer-facing conventions check returns through the main `salt-ds` CLI or another clearly published surface.
- Use the `topics` field to narrow what to look for:
  - `wrappers`
  - `page-patterns`
  - `navigation-shell`
  - `local-layout`
  - `migration-shims`
- If project conventions are unavailable, say the answer is a canonical Salt starter direction that still needs consumer-repo alignment.
- Do not present repo conventions as if they were part of the official Salt registry.

- If the repo has repeated accepted deviations or host/tool constraints that do not fit cleanly in `.salt/team.json`, keep a small working agreement using `assets/salt-working-agreement.template.md` instead of scattering those decisions through chat history.

---

## Project Conventions Contract

Use project conventions only for downstream rules that refine canonical Salt guidance in one application repo or one shared organizational layer.

For most repos, keep one `.salt/team.json` file. If your organization also has a shared line-of-business layer, add `.salt/stack.json` and keep that shared layer separate from the team file. Each actual layer still uses the same base contract.

## Required Shape

Start with:

- `contract`
  - must be `project_conventions_v1`
- `version`
  - repo-owned version string

Common optional sections:

- `project`
- `preferred_components`
- `approved_wrappers`
- `pattern_preferences`
- `banned_choices`
- `notes`

## Boundary

- Salt MCP stays canonical and Salt-only.
- Project conventions stay downstream from the MCP.
- If multiple downstream layers exist, keep shared LoB defaults separate from team-specific overrides.
- Do not describe repo wrappers or local shells as if they were part of the official Salt registry.

## Merge Order

When multiple rules match, apply them in this order:

1. `banned_choices`
2. `preferred_components`
3. `approved_wrappers`
4. `pattern_preferences`
5. canonical Salt answer

## Rule Intent

- `preferred_components`
  - use when the repo explicitly replaces one canonical Salt choice with another repo-approved component name
- `approved_wrappers`
  - use when a repo-approved wrapper wraps a canonical Salt primitive
  - include import and usage-provenance fields when they materially change how the wrapper should be applied
- `pattern_preferences`
  - use when the repo standardizes one shell or page pattern around canonical Salt building blocks
- `banned_choices`
  - use when the repo forbids a specific choice and may require a replacement

## Authoring Rules

- Prefer explicit, evidence-backed rules over broad prose.
- Add `docs` links when the repo has ADRs, component docs, or migration notes that justify the rule.
- Keep `notes` for durable repo-wide guidance, not temporary migration chatter.
- If the rule only repeats canonical Salt guidance, it does not belong here.
- For approved wrappers, add `import`, `use_when`, `avoid_when`, and `migration_shim` when those details affect the final project answer.

## Bootstrap Companion

When you create a new `.salt/team.json` file for a simple repo, pair it with a small repo instruction snippet.

Default bootstrap rule:

- if the repo already uses a repo-local instruction file such as `CLAUDE.md` or another established equivalent, update that file
- otherwise create or update `AGENTS.md` by default
- do not create multiple competing repo instruction files unless the user explicitly asks for that

That companion snippet should:

- tell the agent to use the Salt MCP for canonical Salt guidance
- tell the agent that the Salt CLI is only the fallback transport when MCP is unavailable
- tell the agent to keep repo-local policy in `.salt/team.json` and let repo-aware Salt workflows apply it when project conventions matter
- mention `.salt/stack.json` only as the layered upgrade path, not the default
- keep the canonical Salt answer visible when a repo rule changes the final choice

## Optional Working Agreement

If the repo has recurring accepted deviations, host/tool constraints, or validation defaults that are too narrative for `.salt/team.json`, keep them in a short working agreement using `assets/salt-working-agreement.template.md`. Treat that file as downstream context, not as canonical Salt policy.

---

## Examples

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

---

## Review Checklist

Use this when reviewing or simplifying an existing project conventions setup.

## Structure

- If the repo is simple, does it use `.salt/team.json` cleanly?
- If the repo uses `.salt/stack.json`, is that justified by real layering?
- If the repo is bootstrapped for simple usage, does its repo instruction snippet point to `.salt/team.json` first?
- Does each conventions payload use `project_conventions_v1`?
- Is there a `version` where the repo expects one?
- Are there only supported top-level sections?

## Rule Quality

- Does each rule reflect a durable repo convention instead of a one-off preference?
- Does each rule have a concrete `reason`?
- If a replacement exists, is it explicit?
- Are there repo docs or code references worth adding to `docs`?

## Duplication

- Does a `preferred_components` rule duplicate an `approved_wrappers` rule?
- Does a `pattern_preferences` rule overlap with a note that should be removed?
- Are there rules that only restate canonical Salt guidance and should be deleted?

## Merge Safety

- Would a `banned_choices` rule block the intended replacement cleanly?
- Are wrapper rules more specific than pattern rules where they overlap?
- Are notes informative without changing merge behavior implicitly?

## Final Check

- Can the file still be explained as repo-local refinements on top of canonical Salt?
- If multiple layers exist, is the split between LoB and team still clear?
- Would an external consumer understand why each rule exists?
- Is the file small enough to maintain?
- Does the bootstrap guidance still keep `.salt/stack.json` clearly advanced-only?
