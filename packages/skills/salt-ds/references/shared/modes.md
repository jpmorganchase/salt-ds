# Modes

Use this file when the job could be handled either lightly or deeply.

## Default Rule

Choose the lightest mode that still preserves Salt correctness.
Do not force every task into a comprehensive multi-step workflow when the user only wants a quick signal.
Do not let a quick pass quietly become a full redesign.

## Quick-Check

Use for:

- gut-checks
- sanity checks before commit
- current-file or current-selection feedback
- narrow accessibility or hierarchy checks
- `what is the safest next fix?`

Behavior:

- stay close to the current file, selection, diff, or smallest relevant region
- a clearly bounded answer may start before full project context when the issue is confined to the current file, selection, or diff
- prefer source reading and canonical validation over broad repo exploration
- return the top 1-3 issues, the safest next fix, and any confidence gap
- quick-check is not permission to implement create, migrate, or upgrade work
- do not state Salt-specific props, tokens, imports, package names, or composition rules as canonical unless they were verified through MCP or CLI evidence
- if canonical transport is degraded, you may still return provisional observations, but label them as provisional and avoid claiming completion
- escalate to `deep` when the issue is structurally ambiguous, a canonical mismatch is likely, repo policy clearly matters, or transport/tooling must be consulted to answer safely
- if the user clearly wants implementation or a comprehensive answer, escalate to `deep`

## Deep

Use for:

- implementation
- full create workflows
- comprehensive review or accessibility audit
- migration
- upgrade
- repo bootstrap
- any task where the answer should be treated as completion guidance rather than a quick signal

Behavior:

- complete canonical follow-through before finalizing
- use runtime evidence only when the source pass still leaves an important gap
- keep blocked states explicit instead of coding through ambiguity

## Explore-Options

Use only when the user explicitly asks for alternatives, options, comparisons, or `design it twice`.
Load `references/create/explore-options.md` for create work.

Behavior:

- ground the top-level Salt surface first
- default to two Salt-valid directions and exceed two only when the user explicitly asks for more
- make the directions meaningfully different in composition or emphasis, not randomly decorative
- keep shared invariants visible
- recommend a default continuation path after comparison

Do not use explore-options by default for routine implementation.

## Clarify-Blockers

Use when the work is blocked by one or two structural decisions.

Behavior:

- ask one focused question at a time
- explain why the answer changes the Salt direction
- provide a recommended default answer when possible
- stop asking once the blocked decision is resolved
- if the repo or codebase can answer the question, explore it instead of asking the user

Do not turn this into an interview unless the user explicitly wants a deeper design review.
