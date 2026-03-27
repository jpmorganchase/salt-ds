# review gotchas

- Prefer the most constrained Salt primitive that satisfies the need.
- Do not recommend bespoke replacements until you have checked whether Salt already has a canonical component, pattern, or foundation.
- Treat extra wrappers as suspicious until they clearly improve semantics, layout, or state ownership.
- Flag raw spacing, sizing, and styling values unless there is a clear, local justification.
- Flag direct palette-token usage, non-fixed border thickness, or mismatched container surface tokens when the UI styles Salt components directly.
- Remember that valid API usage is not the same as good design-system usage.
- Prefer simpler hierarchy and quieter defaults over clever composition or decorative styling.
- Do not bury major issues under a long list of minor comments.
- Call out when a custom abstraction hides a standard Salt pattern or makes future changes harder.
- Prefer MCP-backed evidence when recommending a different primitive or pattern.
- For narrow debug/fix tasks, confirm the intended Salt primitive or pattern before recommending local CSS changes.
- For alignment and centering issues, inspect the layout owner, parent flex/grid chain, and wrappers before blaming the leaf component.
- Treat dashboard and metric drift as possible structure or shell problems, not just card-level styling problems.
- If Salt MCP is unavailable, keep the same review workflow and use the Salt CLI only as fallback access to canonical Salt guidance.
- If the review question is really about deprecations, package drift, or version-shaped behavior, treat it as upgrade work instead of forcing it into a generic review.
- If code is available and MCP is unavailable, run `salt-ds review <file-or-dir>` before escalating to runtime evidence.
- In debug/fix mode, return the smallest credible fix and the verification still needed instead of expanding into a broad findings list.
- If you use `salt-ds review <file-or-dir> --url <url>` or `salt-ds runtime inspect <url>`, keep fetched-HTML fallback findings separate from canonical Salt guidance and from full browser-session testing claims.
