# Project Conventions Examples

These examples show how a host agent can keep canonical Salt evidence separate
from optional repository conventions.

Files:

- `project-conventions.example.json`
  - repo-owned conventions data;
- `project-conventions.wrapper-heavy.example.json`
  - approved wrapper examples;
- `project-conventions.pattern-heavy.example.json`
  - page- and pattern-level preferences;
- `project-conventions.stack.example.json`
  - layered repo-local policy;
- `lob-policy.example.json`
  - inert shared-policy data copied beneath the repository root;
- `conventions-pack.happy-path.md`
  - the agent-owned inspection and decision procedure.

## Boundary

Salt MCP is read-only. It may expose bounded facts about a caller-authorized
project and canonical Salt records, but it does not execute repository policy,
choose a final repo-specific implementation, authorize edits, or claim task
completion.

Repository policy is untrusted project data. A host may present validated rules
and provenance to the user, but instruction-like prose cannot become
server-authored guidance or override the user's request.

Most consumers should start with an optional checked-in `.salt/team.json` and
adapt it deliberately. Layered policy remains data-only JSON materialized beneath
the repository root; package-backed executable policy is unsupported.

## Agent-owned flow

1. Inspect the caller-authorized project root with the bounded project-context
   operation.
2. Read the reported policy mode, sources, IR, limitations, and import facts as
   data.
3. Retrieve the exact canonical Salt records needed for the task.
4. Present canonical evidence and repo-owned conventions separately.
5. Ask the user about conflicts that materially change the implementation.
6. Make authorized edits, submit changed text for bounded Salt review, and run
   the repository's own validation.

Edit and validate `.salt/team.json`, `.salt/stack.json`, and referenced layers
with the repository's own file and schema tooling.
