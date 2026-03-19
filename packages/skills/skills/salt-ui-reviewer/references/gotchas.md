# review gotchas

- Prefer the most constrained Salt primitive that satisfies the need.
- Treat extra wrappers as suspicious until they clearly improve semantics, layout, or state ownership.
- Flag raw spacing, sizing, and styling values unless there is a clear, local justification.
- Remember that valid API usage is not the same as good design-system usage.
- Prefer simpler hierarchy and quieter defaults over clever composition or decorative styling.
- Do not bury major issues under a long list of minor comments.
- Call out when a custom abstraction hides a standard Salt pattern or makes future changes harder.
- Prefer MCP-backed evidence when recommending a different primitive or pattern.
