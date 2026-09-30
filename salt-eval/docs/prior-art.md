# Prior art

What salt-eval takes from published work and from our own earlier attempts, and what it deliberately doesn't. Sources were read on 30 September 2026.

## Atlassian

Three posts describe the Atlassian Design System's agent context work and how it was measured:

- [Teaching AI to speak our design language](https://www.atlassian.com/blog/ai-at-work/teaching-ai-to-speak-our-design-language) (June 2026): structured content in TypeScript schemas feeding an MCP server, a skill and DESIGN.md files.
- [Atlassian's DESIGN.md is here](https://www.atlassian.com/blog/how-we-build/atlassians-design-md-is-here-what-we-learned-testing-portable-design-context-in-practice) (June 2026): DESIGN.md tested against their MCP server and skill.
- [Giving AI agents design system context from the terminal](https://www.atlassian.com/blog/ai-at-work/giving-ai-agents-design-system-context-from-the-terminal-what-we-learned-building-a-cli) (September 2026): a CLI as a third entry point, benchmarked against the MCP server.

**What we adopt.**

- **The setup.** "A bank of real front-end tasks, each graded automatically, run by the same agent and model on the same questions", where only the context configuration changes. These are our arms.
- **Reading transcripts.** "A benchmark tells you whether the agent succeeded, whereas the transcript tells you whether it succeeded the way you intended." Their most useful improvements "came from things no metric flagged."
- **One source, several entry points.** Their skill, MCP server and CLI serve the same content, which makes the entry point a clean single variable. Salt's candidates can be compared the same way.
- **Re-creation as a failure mode.** Agents given only DESIGN.md were "more likely to re-create components rather than use the existing system." Our checks look for hand-built versions of Salt components.
- **Lint rules as enforcement that costs no tokens.** For us, a lint rule is both a context product and a source of checks.
- **Evals as documentation review.** Their restructuring "surfaced gaps in existing documentation, like missing accessibility guidance and outdated code examples." Our guidance issues list does the same.

**What we don't adopt.**

- **Efficiency as the headline.** Most reported wins are tokens, time, turns and tool calls: 34% faster, 16% fewer tokens, the CLI's 352 s down to 325 s per task. These matter only at equal quality, so we report them as cost.
- **Small percentages without counts or intervals.** "4.9% more accurate code" and "11% fewer errors" come without task counts or intervals, so they can't be told apart from noise. The DESIGN.md post says as much: "this blog is not a research paper."
- **Context available as a result.** Their DESIGN.md table's "design system context available" column describes the product, not the outcome. Exposure per anchor is the task-level version, and it explains outcomes.
- **Their tasks.** Their benchmark is internal. We copy the setup, not the data.

## Anthropic

[Automating eval design and hillclimbing with Claude](https://claude.dev/blog/automating-eval-design-and-hillclimbing/) (Lance Martin, September 2026) sets out principles we adopt nearly whole:

- **Four elements of a good eval.** Tasks mirror production. Stronger models and more thinking score higher. There's headroom at the frontier that broken tasks don't explain. Run-to-run variance is low. "A good task is one where two domain experts would reach the same verdict and everything the grader checks is stated in the task."
- **Adversarial sampling.** Choosing tasks because today's model fails them ends up measuring "that model's failure fingerprint." Say why a task is hard before including it.
- **Sources, in order.** Production transcripts, then bug reports and tickets, then a handful of hand-written cases, then synthesized ones.
- **The cheapest grader that fits.** Code checks where the output is constrained. Otherwise a judge with "a rubric written as checkable claims (not a 1-to-5 scale)", using a judge model that isn't the model under test.
- **Validating the grader.** Grade the same output twice and compare, check the plumbing (timeouts, API errors, cut-off answers) and warn when the baseline is already around 95%.
- **Overfitting.** Split cases into a set the hillclimber may read and a set it never sees, never paste failures into the prompt, keep answers structurally out of reach and make sure noise is smaller than the smallest improvement you'd act on.
- **Sorting failures by cause when scores stall.** Tasks that never improve despite content fixes point to a flawed task or grader.

Their skill example maps directly onto Salt. The skill's content was present, yet the model "was simply writing older API shapes (e.g., from its trained priors)". That's our prior override. Their fix, a table near the top of the skill mapping remembered forms to current ones, is a candidate fix for Salt deprecations such as `Text`'s `variant` prop.

## Our earlier attempts

These live on branches of this repository.

**The `salt-eval` branch (first version).** A Python harness on Inspect AI, with TypeScript graders in `tooling/eval-graders`.

- Keep: paired arms with tasks as the statistical unit, attribution labels, canary strings and held-out rules, checks proven against passing and failing fixtures and private task suites loaded from a path outside git.
- Change: it built schemas, statistics and judge governance before a task bank existed, and shipped two draft cases. Its agent was a planner that produced one TSX module, not a coding agent in a workspace, so real retrieval behavior couldn't be observed. Its typecheck resolved Salt to repository source rather than an installed package. Its requests named the components, so component choice couldn't be tested.

**MCP workflow evals (`mcp-eval` branch, `packages/mcp/src/evals`).** Contract tests for the MCP server: which tool gets called, payload size budgets and transport fallback. They're useful for MCP development, but they're tied to one product's tool names and can't see the UI produced. They stay with the MCP.

**`findings.md` (`mcp-eval` branch).** Notes from a real session that built a financial dashboard with the Salt skill and MCP server. It supplies seed tasks and attribution examples: a `not_found` lookup the agent carried on past, `VerticalNavigation` composed from memory without `VerticalNavigationItemContent`, a review run on truncated code, the deprecated `Text` `variant` and starter examples too long to trim safely. Its review flagged `href="#"` in a mockup, which is why every task states its fidelity.

**Plans on `mcp-eval`** (`evaluation_plan.md`, `improved_plan.md`, `enterprise_plan.md`, `master_plan.md`). Long-range methodology. salt-eval deliberately starts smaller. Revisit their statistical methods once the bank and trial counts can support them.

**Context products in flight.** Skills (`packages/skills/salt-ds` on `mcp`; `skills/salt-design-system` and `skills/salt-ui` on `ai-platform`), the MCP server and docs bundled in packages (`tooling/agent-docs` on `ai-agent-docs`). All are candidate arms, and none is privileged.
