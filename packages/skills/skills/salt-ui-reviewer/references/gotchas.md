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
