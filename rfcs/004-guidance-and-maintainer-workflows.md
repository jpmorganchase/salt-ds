# RFC 004: Guidance, agent integration, and maintainer workflows

| Item               | Value                                                                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status             | Draft for team discussion; not approved for implementation                                                                                         |
| Date               | November 6, 2026                                                                                                                                   |
| Main baseline      | `3bd9580d2a09e9bc0415efd30469f211256fe08f`                                                                                                         |
| Related work       | Existing agent-docs and maintainer branches, pinned below                                                                                          |
| Decision requested | Adopt a common documentation source, version-aware consumer guidance, and a proportional maintainer workflow; evaluate their usefulness separately |
| Initial delivery   | Review the independent documentation corrections and maintainer pilot, then validate packaged agent integration and a small task evaluation        |

## Summary

Salt should help people and coding agents reach the same supported implementation. Maintain technical facts with their owning APIs, design decisions in their guides, and example code in executable sources. Generate package-local documentation and check data from those sources, resolve them against the consumer's installed packages, and keep project instructions small.

The existing `ai-agent-docs` branch is the starting point for this work. A skill, local reader, knowledge CLI, or MCP interface can make the content easier to use, but none should become a second authority for Salt behavior. Choose additional delivery mechanisms when a measured discovery or workflow problem justifies them.

Maintainers need a different workflow from consumers: recover the current change and prior decisions, state the observable contract, select a discriminating check, and report exactly what was verified and delivered. Existing contribution procedures remain authoritative.

There are three independent acceptance questions:

1. Does the package contain accurate, discoverable, version-matched information?
2. Do deterministic checks report valid, actionable findings without excessive false positives?
3. Do people and agents complete representative tasks more successfully?

A passing package check cannot answer the third question. Runtime-generated UI is another capability, with its own renderer, state, data, and action ownership; it remains a bounded exploration rather than a condition for improving coding-agent support.

## 1. Problem and scope

Salt's supported usage spans APIs, interaction choices, accessible compositions, examples, theme availability, and application responsibilities. A props table alone cannot explain whether a user needs navigation, a command, a choice, or a change of presentation. More instructions alone do not establish that an agent retrieves the right guide or follows it successfully.

Maintainer reviews face a related problem: a plausible implementation or passing test can still miss the actual contract. A focus test may pass because its setup repaired the defect; a generated example may compile while omitting the state or assets needed by a consumer. The workflow must connect the requested outcome to evidence.

This RFC covers documentation authorship, package-local guidance, agent setup and diagnostics, consumer-task evaluation, and the maintainer pilot. It also records the boundary with runtime-generated UI. Component behavior belongs to [RFC 001](./001-component-contracts-and-react.md), native form contracts to [RFC 002](./002-native-form-integration.md), and theme/runtime integration to [RFC 003](./003-theme-and-runtime-integration.md).

It does not select new build tools, replace Salt's design language, require a hosted service or MCP server, or add an agent evaluation to every documentation edit. Public component changes remain subject to the other RFCs' compatibility decisions.

## 2. Existing work and evidence

The following references were inspected for this consolidation. They are implementation starting points, not evidence that all changes are released, merged, or fully validated. This RFC branch contains the proposals only; it does not merge these branches.

| Work                                                                                                                              | Pinned revision | What it provides                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------- |
| [Agent documentation and CLI](https://github.com/jpmorganchase/salt-ds/tree/68dda09261e36269f10225e80161e551de830000)             | `68dda092`      | Generated package documentation, manifests/check data, `salt-ds init`, `salt-ds check`, and task guidance.        |
| [Maintainer workflow pilot](https://github.com/jpmorganchase/salt-ds/tree/59c4b1d2014a129095b82f99a9fceb0b4c097a78)               | `59c4b1d`       | Small instruction entry points, a runbook, read-only local context helper, and documentation authoring guidance.  |
| [API documentation corrections](https://github.com/jpmorganchase/salt-ds/commit/851546b0b666a09790a0ad411c2b4a9cce1bae2b)         | `851546b`       | Corrected defaults/descriptions and presentation of literal prop values.                                          |
| [Site example validation](https://github.com/jpmorganchase/salt-ds/commit/3e33f204947ba669f4a694faca270e3874811792)               | `3e33f20`       | Site type checking and corrections to copied example usage.                                                       |
| [Consumer guidance and shared examples](https://github.com/jpmorganchase/salt-ds/commit/0f54d1c3101f50906dcbc339e2f256f4b8e8f2df) | `0f54d1c`       | Selection, composition, forms and accessibility guidance; shared executable examples and interaction regressions. |

The agent-docs generator currently derives Markdown from website sources, preserves example dependencies, validates generated links, and emits package manifests. The CLI resolves installed package documentation and can add check execution to an explicitly selected project script. It detects stale generated instructions. The checker skips newer check-data schemas with an upgrade notice and rejects invalid schemas as setup errors; a successful exit does not establish that every package was checked. These are branch capabilities, not assumed capabilities of today's published Salt packages. [Generator documentation][agent-readme] [CLI documentation][cli-readme] [Current checker][checker]

The same generator README records that mandatory primitive-chooser routing did not cause agents to open the guide or improve scores in a 16-task evaluation. Treat that report as a reason to investigate retrieval and outcomes separately, not as a general estimate of agent effectiveness. The runs were not repeated for this RFC. The branch now keeps the chooser discoverable and adds a specific accessibility-repair route. [Task guidance and evaluation][agent-readme]

The independent documentation branches are useful even if the larger agent-docs branch does not merge. Review their current diffs and dependencies before adoption; the shared-example extraction is substantial and should be delivered in coherent reviewable slices. Earlier checks or branch existence do not substitute for validation against the revision eventually proposed for merge.

## 3. Proposed decisions

| ID  | Proposal                                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------- |
| G1  | Maintain one canonical source for each technical fact, usage decision, and executable example.                            |
| G2  | Ship derived documentation and check metadata with the package version they describe.                                     |
| G3  | Resolve the target application's installed packages; do not substitute the latest website or another workspace's version. |
| G4  | Keep project instructions small, with task-specific routes justified by evidence.                                         |
| G5  | Separate deterministic errors, contextual recommendations, and design judgment.                                           |
| G6  | Evaluate package integrity, diagnostic quality, and task outcomes independently.                                          |
| G7  | Adopt a proportional maintainer workflow using the existing contribution guide and check infrastructure.                  |
| G8  | Keep runtime-generated UI as a separately approved experiment with application-owned actions and state.                   |

These decisions request direction. They do not approve every existing branch change, finalize a new metadata schema, or select a runtime-UI implementation.

## 4. Documentation ownership and authoring

### Canonical sources

| Information                                                             | Maintained source                                                                                | Derived uses                                                                      |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Public API names, types, defaults, and deprecations                     | Public types, exports, and API descriptions checked against implementation and accepted behavior | Website API tables, package Markdown, check metadata                              |
| Component choice, design intent, limitations, and application ownership | Authored usage/accessibility/pattern guides                                                      | Website pages and package-local guidance                                          |
| Example behavior                                                        | Executable example source and its focused verification                                           | Preview, code display, stories where appropriate, complete agent-readable example |
| Token availability and deprecation                                      | Theme sources, supported entry points, and reviewed migration guidance                           | Token reference and version-specific diagnostics                                  |
| Maintainer procedure                                                    | Contribution guide, content style guide, and focused runbook                                     | Short agent entry points linking to the procedure                                 |

An implementation defect must not become the intended contract simply because source inspection found it. Resolve disagreements among implementation, documented promises, design intent, and the requested repair. Version matching establishes relevance; it does not establish correctness.

Apply the existing [authoring proposal][authoring] to human and AI-assisted edits:

- Start with the reader's decision or task. Explain when to use the component and the alternatives that materially change the interaction.
- Distinguish requirements, recommendations, defaults, capabilities, and work owned by the application. Keep qualifications next to the advice they constrain.
- Verify props, exports, defaults, dependencies, providers, themes, and version requirements against the documented revision.
- Treat examples as claims about supported usage. A complete recipe includes the relevant state, handlers, styles, data, and lifecycle behavior. A focused snippet identifies its omissions.
- Reuse executable source for previews and code displays. Avoid copyable examples that depend on unpublished source or unexplained site-only helpers.
- Preserve meaning when converting formats: accessibility qualifications, diagram relationships, links, anchors, and supporting files must survive.
- Select verification according to the changed claim. A wording correction and an example that restores focus need different evidence.

Keep theme concepts separate: layering explains visual hierarchy; application backgrounds explain root/scoped surface ownership; modes explain light/dark behavior. This division preserves the clarified documentation direction and supports RFC 003 without turning one page into a general theming manual.

## 5. Consumer guidance and retrieval

### A supported-use workflow

The consumer workflow should establish the requested interaction, identify the installed Salt version, retrieve the relevant guidance and complete example, implement with public APIs, and verify the behavior. A repair must distinguish existing code that embodies the intended contract from existing code that is the defect.

Guidance should answer concrete decisions such as these:

| User intent                                                    | Guidance the agent or developer needs                                                                                                          |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Choose a value, search options, or invoke a command            | Explain selection versus editable search versus actions; identify supported Salt components and their limits.                                  |
| Change between list and card presentations of the same records | Preserve shared query, filters, selection, and meaningful focus; choose semantics from the interaction rather than its border or visual shape. |
| Repair a validation error                                      | Inspect the actual control's name, invalid state, error association, focus, and application validation ownership.                              |
| Delete the item that opened a dialog                           | Verify a logical surviving focus target and the resulting announcement after the trigger disappears.                                           |
| Choose an input for a numeric quantity or identifier           | Explain stepping/range semantics and exceptions; a numeric keyboard hint alone does not determine the domain model.                            |

Guidance must use Salt's actual exported APIs and documented capabilities for the installed version. Do not invent providers, props, or interactions to satisfy a requested pattern. Unsupported patterns require an explicit supported Salt composition, a documented limitation, or a separate component proposal.

### Content shape

Keep rationale, accessibility reasoning, and worked usage in Markdown. Use structured metadata for discovery, package/version identity, stable references, and machine-checkable facts. Generate both from the same owned sources wherever possible; do not maintain a parallel JSON account of every behavior.

Put concise usage and accessibility guidance before large examples. Split long content by coherent task, link to complete examples and their supporting files, and retain prerequisites with the part being read. The existing generator already extracts large examples and reference lists; improve discovery from observed retrieval failures before introducing another indexing system. [Long-page handling][agent-readme]

Stable semantic page identifiers and a richer example catalog may help future readers. Introduce them only with a concrete consumer and compatibility policy. Example metadata should describe capabilities, required providers/dependencies, state ownership, and limits; it must not claim interactions absent from the executable example.

### Delivery choices

The baseline is installed documentation plus the current small setup/check CLI. A focused reader can reduce navigation cost; a skill can structure a repeated workflow; MCP can expose the same operations to a client that needs tools. A previous knowledge-package experiment is a comparison candidate, not a prerequisite or a selected new authority.

Compare delivery approaches using the same corpus, package versions, task, tools, and budget. If the CLI also adds better guidance or validation, describe the result as a comparison of whole workflows. Do not attribute the change solely to Markdown, JSON, skills, or tool calls.

## 6. Diagnostic policy

Continue version-aware checks for facts that can be established from the installed metadata and statically visible code. Diagnostics should identify the file/location, rule, supported concern, relevant documentation, and a useful next step. Unknown or skipped coverage must be visible.

Use a clear distinction:

| Kind                                     | Example                                                                           | Expected behavior                                                                                   |
| ---------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Deterministic contract check             | Unknown token or a documented deprecated API                                      | Explain the version-specific fact and applicable migration path.                                    |
| Structural check with limited visibility | A required part is absent from children that can be fully inspected               | Report only within the known scope; wrappers and dynamic children can make the result inconclusive. |
| Contextual recommendation                | A numeric `Input` may represent a bounded quantity better served by `NumberInput` | Warn with conditions and legitimate exceptions; do not perform an unconditional replacement.        |
| Design or interaction judgment           | Whether a search belongs in a menu or a selection control                         | Route to guidance and verify the task; do not invent a universal static threshold.                  |

The numeric-input recommendation exists at the pinned agent-docs head. Its warning message says to retain `Input` for numeric codes and numbers without a set range, but the checker cannot identify those domain exceptions and still warns on matching syntax. Use it as a diagnostic-quality case, not proof that a syntactic property determines the right control. [Current checker][checker]

Preserve the CLI's existing rule behavior while reviewing its release contract. New or stricter rules need positive, negative, alias/wrapper, and incomplete-code cases as applicable, with a documented severity and suppression policy. A deprecation diagnostic, an invalid program, and a stylistic preference are different concerns even if a current CLI configuration makes multiple categories fail a command.

Do not equate a clean Salt check, successful type check, accessibility scan, or screenshot with correct keyboard interaction, accessible focus recovery, valid application data, or a successful task. Each result establishes only what its check observes.

## 7. Evaluation plan

### Layer A: Package and setup integrity

Use a fresh consumer with actual packaged artifacts and the packaged CLI. Check version/path resolution, manifests, links, complete examples, stale instructions, schema compatibility, and target-project selection in a workspace with two Salt versions. Verify setup idempotence and preservation of unrelated instructions. If setup changes a project script, use the explicitly chosen script and ensure the resulting command actually runs the check.

Exercise the consumer's supported public imports and copied recipe dependencies. This is package verification; it is separate from a model trial.

### Layer B: Rule quality

For each proposed rule, retain representative valid and invalid usage, expected diagnostic/exception, and observed false positives. Verify that an agent can reach the cited local page and make a supported repair. Keep advisory component-choice rules advisory until there is a justified stronger contract.

### Layer C: Task outcomes

Begin with a small fixed pilot of representative tasks before scaling. Include a no-Salt-instructions baseline and the proposed guidance workflow, and add a third condition only when testing a specific delivery hypothesis. Use fresh sessions, repeated attempts, equal task/tool/time budgets, a fixed corpus and installed runtime, and recorded model/client versions. Keep some tasks held out from instruction tuning.

Record retrieval and success separately: pages opened, guide relevance, component/semantic choice, public API correctness, behavior, keyboard/focus/errors, state preservation, corrective attempts, latency, and cost. Attribute a failure to discovery, unclear guidance, an incorrect choice, implementation, or unsuccessful repair where the evidence supports that distinction. Preserve failed attempts and run artifacts.

Start from real Salt gaps: installed-version discovery, a presentation switch retaining state, invalid-field repair, dialog trigger removal, a small correction that should stay small, and deliberate migration away from defective existing usage. Reuse the contract fixtures in RFCs 001 and 002 as independent acceptance evidence.

[Open Design System Bench][benchmark] is a candidate harness and includes starter and harder tasks. Its default generating-agent tools exclude shell execution, so an evaluation of Salt's check/fix/recheck workflow must deliberately enable and record that workflow. Use the real packaged Salt setup and Salt-specific diagnostics rather than assuming generic catalog or token grading verifies Salt usage. No benchmark run or new model comparison is claimed by this RFC.

Agree the decision criterion before a trial: a demonstrated improvement on the targeted failure mode, no material regression on held-out interactions, an acceptable false-positive burden, and a reasonable verification cost. Report denominators and uncertainty; a small pilot is directional evidence, not a general success rate. Evaluations should answer consequential workflow questions, not gate every wording change.

## 8. Maintainer workflow

Adopt the [existing pilot runbook][runbook] with small agent entry points linking to it. Keep icon generation, React compatibility, render composition, deprecation, and theme procedures in `CONTRIBUTING.md`; do not duplicate them in a growing instruction file.

The intended workflow is:

1. Recover the actual task, current branch/PR revision, CI state, relevant prior decisions, and explicit scope exclusions.
2. State the observable outcome and a plausible wrong result. Include exported hooks/contexts and supported consumer compositions when relevant.
3. Choose evidence that distinguishes those outcomes. For a regression fix, establish that the regression test fails for the defect, or that a deliberate break makes it fail; inspect whether test setup masks the failure. A clear static type incompatibility can establish a type defect. Other changes use the proportional checks appropriate to their claims.
4. Use the smallest useful checks while iterating, then the broader existing checks justified by the affected contract and shared dependencies.
5. Review findings by trigger, violated contract, impact, and evidence. Separate defects from preferences and unresolved questions.
6. Report the revision and scope checked, remaining uncertainty, and actual delivery state. Stop when the requested outcome has sufficient evidence.

The pilot's `maintainerContext.mjs` is a read-only summary of local Git context and relevant guidance. It does not fetch remote state, inspect PR reviews, or run validation. A local tracking ref is not proof of the current remote head. Preserve this boundary in both command output and instructions. [Pilot entry point][pilot-agents]

Try the workflow on ordinary tasks and record when it prevents a repeated finding, misses context, or adds unnecessary work. A second reviewer or model evaluation is warranted for a concrete unresolved risk, not a mandatory ceremony on every PR. An evidence-based review with no findings is complete.

## 9. Boundary with runtime-generated UI

Repository code generation produces code that an application's development and review process can own. Rendering UI during a conversation additionally needs a runtime contract. Documentation helps choose and compose controls; it does not provide that renderer or the application's state/actions.

If there is a committed product use case, approve one separate search–filter–detail experiment comparing a prebuilt Salt widget with composition from a curated serializable catalog. The application owns authoritative data, permissions, state, and allowed actions; a trusted renderer maps validated descriptions to supported Salt components. The model selects from that contract rather than supplying arbitrary executable event handlers.

Specify the Salt catalog and renderer contract before selecting an implementation. [MCP Apps][mcp-apps] addresses delivering interactive interfaces inside compatible hosts; the Salt catalog, state, actions, and interaction behavior still need their own contracts. No runtime-UI implementation is selected here.

Measure completed tasks, state across updates and turns, keyboard/focus behavior, error recovery, latency, and repair effort. A valid JSON document or attractive screenshot is insufficient. Continue this work only if the concrete workflow benefits; it must not delay independently useful documentation and maintainer improvements.

## 10. Delivery slices and acceptance

| Slice                                      | Scope                                                                                                                              | Acceptance evidence                                                                                                                    |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| G-1: Independent documentation corrections | Review the API/site-validation branches and adopt focused corrections. Split shared examples by coherent topic if needed.          | Accurate source-backed descriptions; examples type-check and perform their stated interaction; no unrelated generated changes.         |
| G-2: Maintainer pilot                      | Adopt the short entry points, canonical runbook, authoring guidance, and local context helper after reviewing the existing branch. | Correct local-context limitations; ordinary tasks provide useful checks and accurate completion reports without duplicated procedures. |
| G-3: Packaged consumer integration         | Prove version-matched docs, setup, check data, stale detection, and complete recipes from packed artifacts.                        | Layer A passes for a fresh consumer and a workspace with different Salt versions; skipped coverage is explicit.                        |
| G-4: Focused effectiveness evaluation      | Run a small paired task pilot; review rules and retrieval failures.                                                                | Reproducible artifacts, separate retrieval/outcome measures, valid exception cases, and a written decision on the targeted workflow.   |
| G-5: Conditional additional interfaces     | Add a reader, skill, MCP adapter, or runtime-UI prototype only for an established need.                                            | A specific unmet problem and evidence that the additional interface improves it enough to maintain.                                    |

G-1 and G-2 can proceed independently of publishing agent-docs. G-3 uses the relevant reviewed source corrections; G-4 depends on a working consumer fixture. The runtime experiment in G-5 requires its own sponsor and scope.

## 11. Alternatives, risks, and open decisions

**Website-only guidance** avoids package content but cannot by itself guarantee that advice matches the installed release. **An agent-only documentation corpus** can target agents closely but duplicates technical ownership. **A mandatory skill or MCP service** may improve a particular client workflow, but increases distribution and maintenance obligations before demonstrating a discovery benefit. **Static checking alone** cannot validate interaction intent. **A larger generic instruction file** is easy to add but can create more reading without better retrieval or outcomes.

The main risks are stale generated instructions, lost meaning during conversion, examples that imply unsupported behavior, false-positive checks, and evaluation overfitting. The proposed ownership rules and independent evidence layers address these risks without assuming one tool format wins.

Before publication, decide:

- Who owns the derived-doc/check-data schemas, compatibility notices, and release checks?
- Which contextual rules remain warnings, and how can consumers explain intentional exceptions?
- Which client/model and task set represent the first supported evaluation, and where are its artifacts retained?
- Does an observed retrieval problem justify stable page IDs, example metadata, or a dedicated reader now?
- What current evidence is still needed before adopting each existing branch?
- Is there an actual runtime-generated-UI product owner and use case? If not, retain the experiment as deferred.

## References

[agent-readme]: https://github.com/jpmorganchase/salt-ds/blob/68dda09261e36269f10225e80161e551de830000/tooling/agent-docs/README.md
[cli-readme]: https://github.com/jpmorganchase/salt-ds/blob/68dda09261e36269f10225e80161e551de830000/packages/cli/README.md
[checker]: https://github.com/jpmorganchase/salt-ds/blob/68dda09261e36269f10225e80161e551de830000/packages/cli/lib/salt-check.mjs
[authoring]: https://github.com/jpmorganchase/salt-ds/blob/59c4b1d2014a129095b82f99a9fceb0b4c097a78/content-style-guide.md
[runbook]: https://github.com/jpmorganchase/salt-ds/blob/59c4b1d2014a129095b82f99a9fceb0b4c097a78/.github/maintainer-workflow.md
[pilot-agents]: https://github.com/jpmorganchase/salt-ds/blob/59c4b1d2014a129095b82f99a9fceb0b4c097a78/AGENTS.md
[benchmark]: https://github.com/christophhdesign/open-design-system-bench
[mcp-apps]: https://modelcontextprotocol.io/extensions/apps/overview
