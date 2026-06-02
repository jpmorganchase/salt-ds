# Salt AI Tooling Security Threat Model

Status: active maintainer gate
Date: 2026-05-23
Owner: AI tooling maintainers

## Purpose

This threat model maps MCP, generated context, repo policy, host adapters, and
Salt workflow contracts onto the current Salt AI tooling architecture.

The security posture follows the same product principle as the maintainer
guide:

> Make Salt a narrow authority, not a broad agent runtime.

Salt should protect Salt-specific truth, evidence, workflow gates, repo policy
application, generated context integrity, and unsupported states. Hosts and
agents own local command execution, browser/runtime validation, generic React
work, multimodal interpretation, and user-facing prose.

External context:

- MCP Security Best Practices: `https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices`
- OpenAI prompt injection guidance: `https://openai.com/safety/prompt-injections/`
- OpenAI agent safety guidance: `https://developers.openai.com/api/docs/guides/agent-builder-safety`

## Assets And Trust Boundaries

### Salt-Owned Or Salt-Verified

- generated registry and search-index data
- semantic-core workflow contracts
- compact `salt_workflow_v1` routing fields
- evidence refs and unsupported/degraded states
- generated context manifests and persistence checks
- public MCP tool definitions and public resources
- `.salt` repo policy after trusted project-context resolution
- `context_id` values returned by trusted project-context calls

### Host-Owned Or User-Owned

- local shell commands and package installation
- MCP server install and host connection configuration
- browser, component-preview, accessibility, and app URL validation
- raw screenshots, design-tool frames, PDFs, web pages, and other attachments
- user prompts and product intent
- final prose shown to the user

### Untrusted Until Normalized Or Verified

- retrieved docs and examples
- source files from the current repo
- `.salt` files before root resolution succeeds
- `source_outline` and other host-produced summaries
- screenshot or design-tool observations
- generated artifacts restored from disk
- MCP tool metadata or resources from outside the curated Salt server
- host adapter files that may have been edited by hand

## Existing Safeguards

- Compact workflow output is the authoritative branching contract; hosts should
  inspect `status`, `action.kind`, `resolved_entity`, `request`, `safety`,
  `questions`, and `evidence` before editing.
- Missing or weak evidence produces unsupported, degraded, ask-user, retrieve,
  or blocked states instead of invented Salt facts.
- Repo policy should be applied only after a trusted `root_dir` or reusable
  `context_id` has been established.
- Generated context and generated artifact persistence use explicit manifest or
  persistence-check contracts before reuse.
- MCP public tools are intentionally workflow-first and read-mostly; write and
  persistence operations are explicit follow-through actions.
- Host setup docs keep command execution, package installation, and host-specific
  adaptation in the host/user consent layer.
- Raw screenshot and design-tool payloads are not first-class Salt MCP
  workflow inputs. Hosts normalize them into structured evidence such as
  `migrate_visual_evidence_v1` or `source_outline`.

## Threats And Required Boundaries

| Threat | Example | Required Salt Boundary | Current Safeguard Or Follow-Up |
| --- | --- | --- | --- |
| tool metadata poisoning | A malicious tool description tells the model to ignore Salt gates or call another tool. | Treat tool metadata as routing affordance, not policy. Salt-owned tools must keep descriptions short, factual, and non-instructional beyond their own contract. | Current public surface is curated in MCP tool definitions. Follow-up: add hostile metadata fixtures if external tool catalogs are consumed. |
| MCP resource poisoning | A resource includes hidden instructions, stale guidance, or false Salt facts. | Treat resources as data with provenance. Workflow gates and evidence refs remain authoritative. | Current generated resources use registry/context data. Follow-up: add resource poisoning evals if new public resources are added. |
| prompt injection from docs or examples | Fetched docs say to change imports, skip validation, or prefer non-Salt components. | Retrieved prose can support provenance or gap closure but cannot override compact workflow gates. | Slice 2 documents generated context versus direct docs fetch. |
| prompt injection from source files | A repo file, comment, test fixture, or README instructs the agent to bypass Salt review. | Source files are implementation evidence, not developer instructions. Salt-specific ownership still comes from Salt evidence and trusted repo policy. | Trusted project context and review workflow separate repo evidence from Salt truth. |
| prompt injection from screenshots, `source_outline`, or generated artifacts | A visual note or generated file says to exfiltrate data, write files, or ignore blockers. | Host-normalized evidence must be structured, scoped, and uncertainty-preserving. Free text inside evidence is untrusted input. | Visual evidence schemas and host attachment evals exist, including a hostile `source_outline` trace that fails when the host follows untrusted evidence text as instruction. |
| `.salt` policy poisoning | A malicious or stale `.salt/team.json` claims different packages, themes, or repo rules. | `.salt` policy is repo-local overlay, not canonical Salt truth. Use only after trusted root resolution and surface conflicts. | Project-context tests cover unresolved roots, package health, and context reuse. |
| `context_id` reuse confusion | A host reuses a `context_id` from one repo in another repo. | `context_id` must remain bound to trusted project context. If root health is untrusted or mismatched, retry with explicit `root_dir`. | MCP tests cover explicit context isolation across repos and follow-up reuse. |
| stale generated context persistence | Persisted context from a previous version is reused without checking its manifest. | Persisted bundles and artifacts require exact persistence checks before reuse. Stale context is evidence to refresh, not authority. | Context-pack and artifact persistence schemas/tests exist. |
| local MCP server compromise | A local server install command or package executes arbitrary code. | Salt docs can recommend setup, but the host/user must approve exact install and connection commands. Salt should not hide or auto-run local server setup. | Host setup cards keep install/connect in user-visible host setup. |
| filesystem write abuse | A persistence tool writes outside the intended repo or overwrites user files. | Write paths must stay explicit, scoped, and reviewable. Destructive or broad writes require human confirmation. | Existing persistence tools are explicit. Follow-up: add path-containment tests if write scope expands. |
| host adapter instruction conflicts | Repo instruction files, skill notes, or host rules disagree. | Generated host adapters must be compiled from shared Salt guidance and must not override compact workflow gates. | Current host artifacts are partly generated. Require host adapter security review before expansion. |
| confused deputy or over-broad host authority | A host combines untrusted content with write, install, network, or persistence actions. | Use structured outputs and human confirmation for install, write, persistence, and consequential host actions. | Host guidance tells agents to follow returned actions. Follow-up: benchmark host behavior in Slice 7. |

## Human Confirmation Boundaries

Require visible human confirmation before:

- installing or reconnecting an MCP server
- running package-manager install commands suggested by setup docs
- writing generated context or generated artifacts to disk
- modifying host adapter files or repo instruction files
- deleting, moving, or overwriting user-owned files
- sending runtime, screenshot, repo, or generated evidence to an external service
- accepting a workflow path that conflicts with trusted project context or `.salt`
  policy

Confirmation should show the exact command, path, host adapter, or persistence
target whenever possible.

## Review Checklist For Security-Sensitive Changes

Before approving a public AI tooling change, answer:

- Does this expose new public MCP tool metadata, resources, prompts, or generated
  context that the model may treat as instruction?
- Does this change any `context_id`, trusted project-context, `.salt` policy, or
  persistence behavior?
- Does this add write, install, network, host adapter, or generated-artifact
  behavior that needs human confirmation?
- Does this consume untrusted docs, examples, source files, screenshots,
  `source_outline`, design evidence, or generated artifacts?
- Does this preserve compact workflow gates as authoritative when untrusted text
  disagrees with Salt evidence?
- Does this keep Salt narrow, or does it ask Salt to become a browser runner,
  visual parser, package installer, or generic security monitor?

## Test And Evidence Map

Existing evidence:

- `packages/mcp/src/__tests__/projectContext.spec.ts` covers unresolved and
  mismatched project context behavior.
- `packages/mcp/src/__tests__/createServer.spec.ts` covers `context_id` reuse,
  repo context isolation, persistence writes, and persistence checks.
- `packages/semantic-core` persistence schemas define generated context and
  generated artifact checks.
- Host trace evals check whether agents follow workflow states before editing.
- Host attachment evals fail raw visual handoff, dropped uncertainty markers, and
  hostile source-outline text followed as instruction.
- Host attachment evals include hostile evidence text that attempts to override
  Salt workflow gates but remains untrusted input.
- Skill contract tests keep trusted project context and host adapter guidance
  visible in always-on instructions.

Follow-up tests should be added only when a change exposes the related surface:

- hostile tool metadata text if Salt starts consuming external tool catalogs
- hostile MCP resource text if new public resources carry rich prose
- additional hostile runtime evidence fixtures when component-preview, app URL,
  accessibility, or browser evidence grows new write or persistence sinks
- host adapter conflict fixtures when additional generated host artifacts are
  introduced
- path-containment and overwrite fixtures if persistence writes expand

## Non-Goals

- No browser runner, component-preview runner, accessibility runner, or screenshot parser belongs
  inside Salt MCP as part of this threat model.
- No broad prompt-injection detector is required before a concrete Salt-owned
  sink exists.
- No generated host artifact should be added only to make host setup look more
  complete. Use setup cards and snippets until the host format is stable and
  validated.
