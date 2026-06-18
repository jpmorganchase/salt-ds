# Salt Review

Use review for existing Salt UI, changed Salt code, deprecated usage, Salt-specific accessibility and hierarchy issues, primitive choice, and safest fixes.

## Required Path

1. Load `core.md`.
2. Call `get_salt_project_context` when repo shape matters.
3. Call `review_salt_ui` with the source under review.
4. If the workflow asks for reference evidence, call `get_salt_reference`.
5. Apply fixes only when the review output and user request make the edit safe.
6. Rerun `review_salt_ui` after edits when Salt-specific behavior changed.

## Rules

- Report findings before summaries.
- Separate Salt-specific findings from generic code style.
- Do not claim runtime/browser evidence unless the host supplied it outside Salt MCP.
- Do not recommend CLI review, runtime inspect, hooks, attestations, or review-resume resources as public v1 behavior.
