# Surface Resolution

Use this file when the main risk is collapsing the user's ask too early.

Preserve the owning surface before choosing local implementation details.

## Resolution Order

1. user task
2. owning surface
3. required regions or sub-surfaces
4. nearest Salt pattern or composition
5. local primitives and visual treatment

## Rules

- preserve page-level asks such as `dashboard`, `page`, `screen`, `workspace`, `overview`, `dialog flow`, or `navigation shell` in the first canonical step
- preserve concrete region nouns such as `table`, `chart`, `filter`, `metric`, `header`, `tabs`, or `sidebar` in follow-up create calls
- do not collapse a page ask into a smaller component decision before the owning surface is grounded
- do not infer unresolved peer regions from one valid anchor; one grounded region does not complete the whole surface
- if a region remains unresolved after the canonical step, either keep it pending or ask instead of inventing a bespoke structure
- keep mock data and starter scaffolds subordinate to the workflow contract; they do not replace canonical completion

## When To Stop

Stop or return a clearly-labeled partial scaffold when:

- an essential region is still unresolved
- repeated follow-up for the same region keeps misrouting
- the transport output is partial or truncated in a way that could hide completion gates
- the visual treatment depends on unresolved Salt guidance rather than on already-grounded structure

## Common Mistakes

- turning a page-level ask into disconnected local widgets too early
- paraphrasing concrete nouns into abstract taxonomy prompts
- assuming a table, chart, or metric region is interchangeable with the owning workflow
- using bespoke wrappers or styling to hide an unresolved composition decision
