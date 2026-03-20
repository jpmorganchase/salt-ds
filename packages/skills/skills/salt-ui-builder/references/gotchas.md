# build gotchas

- Do not jump straight to code without choosing primitives and structure first.
- Do not skip the translation map when the source starts outside Salt. Separate direct swaps, pattern rewrites, and manual review points before coding.
- Do not ignore low-confidence translation output. Resolve the blocking clarifying question before you scaffold the wrong structure.
- Do not over-nest layout wrappers when a simpler Salt pattern or layout primitive will do.
- Do not create custom UI, wrappers, or abstractions until you have ruled out an existing Salt primitive, pattern, or foundation.
- Do not invent Salt APIs, props, or components.
- Do not rely on raw values when Salt foundations or tokens should be used.
- Do not finalize token choices without checking the canonical token policy or Salt MCP guidance for the correct family and direct-use rules.
- Do not style borders or separator lines with non-fixed thickness values unless an established Salt pattern explicitly requires it.
- Prefer quieter defaults over decorative UI or needless emphasis.
- Avoid restyling Salt primitives into a separate design language unless the user explicitly asks for it.
- If the input is incomplete, make explicit assumptions before adding speculative complexity.
- If partial code already exists, prefer simplifying and aligning it before rebuilding from scratch unless the structure is fundamentally wrong.
