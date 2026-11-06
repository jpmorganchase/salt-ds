# Salt modernization RFCs

**Status: draft for team discussion. Prepared November 6, 2026.**

This set consolidates the recent proposals for evolving Salt into four independently reviewable RFCs. It preserves Salt's architecture and visual language, keeps current consumers supported, and favors small implementation steps with explicit acceptance criteria.

Start with the decisions below. Each RFC then provides the current-state evidence, proposal, compatibility policy, implementation slices, alternatives, and unresolved questions. The documents distinguish recommended direction from unapproved API names and conditional experiments.

The source baseline is [`main` at `3bd9580`](https://github.com/jpmorganchase/salt-ds/commit/3bd9580d2a09e9bc0415efd30469f211256fe08f). Additional implementation branches are pinned where relevant. This branch adds RFCs only. Build-tooling modernization is excluded.

## The four proposals

| RFC                                                                                                      | Decision for the team                                                                                                                                     | First useful delivery                                                                                                                            |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| [001: Component contracts and React integration](./001-component-contracts-and-react.md)                 | Establish shared interaction contracts, retain existing callbacks, and enable React 19 through application recipes and bounded compatibility work.        | Popup conformance cases, save/form/remote-selection recipes, and a small lifecycle/Compiler consumer fixture.                                    |
| [002: Native form integration](./002-native-form-integration.md)                                         | Make ordinary HTML forms reliable, distinguish semantic values from editing/display text, and adopt changed contracts explicitly.                         | Existing-control form characterization plus additive `Switch.inputRef`, followed by a private native-field/custom-selector prototype.            |
| [003: Theme and runtime integration](./003-theme-and-runtime-integration.md)                             | Add system appearance using the current theme model; clarify shell/provider/runtime ownership; keep current styling for standardized SPA/MFE deployments. | `mode="system"`, then initial-document integration; focused MFE reproductions and a bounded CSS compatibility audit can proceed alongside them.  |
| [004: Guidance, agent integration, and maintainer workflows](./004-guidance-and-maintainer-workflows.md) | Maintain one source of documentation truth, ship version-aware guidance/checks, and use a proportional evidence-based maintainer workflow.                | Independent documentation corrections and the existing maintainer pilot, followed by packaged consumer verification and a small task evaluation. |

The first review should decide whether the team agrees with these directions and the initial slices. It should not require agreement on every future API or an estimate for the entire program.

## Shared constraints

- **Preserve the design system.** Learn from modern libraries without adopting another component library or rebuilding the catalog wholesale.
- **Keep the common support floor.** React 19 integration examples and the React 19 MFE scenario do not raise Salt's React or browser requirements. Newer capabilities need explicit boundaries and appropriate fallbacks.
- **Treat behavior as part of compatibility.** Payloads, required blocking, reset, callback timing, ref targets, focus, associations, and supported styling hooks matter alongside TypeScript compatibility.
- **Make adoption local.** A new provider or optional Form must not silently reinterpret existing descendants. Independently useful fixes can ship before broader contracts are ready.
- **Preserve application ownership.** Applications retain domain state, business validation, persistence, network requests, async policy, and authoritative actions. Salt owns the component behavior and integration promises it exposes.
- **Match claims to evidence.** Source inspection, type checks, runtime tests, minimum-browser verification, accessibility review, and agent evaluations establish different things. The RFCs propose future checks without claiming they have already passed.

Current platform and contribution policy: [supported platforms](https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/site/docs/about/supported-platforms.mdx), [React compatibility and contribution procedures](https://github.com/jpmorganchase/salt-ds/blob/3bd9580d2a09e9bc0415efd30469f211256fe08f/CONTRIBUTING.md).

## Important conclusions carried forward

### Existing callbacks remain immediate

React 19 recipes can use Actions without renaming Salt's `on*` callbacks or automatically awaiting them. A new Action prop is conditional on a concrete need and a complete lifecycle contract, including pending state, errors, ordering, and unmount behavior. Native form `action`/`formAction` remains a distinct integration surface. See RFCs 001 and 002.

### Native form support requires a complete lifecycle

A hidden input can serialize a value, but does not establish native validation, visible invalid focus, reset, autofill, or synchronization with controlled state. RFC 002 keeps native controls where they fit and evaluates companions per control family. Changed selection/submission semantics require an adoption boundary.

### System appearance comes before adaptive CSS experiments

The reviewed theme direction starts with `SaltProvider` accepting `mode="system"`, while resolved theme state stays light or dark and the existing default remains light. Initial-document ownership follows. CSS compatibility work is a bounded audit; adaptive output is conditional on demonstrated benefit. Earlier ideas for a broad CSS transformation should not be read as approved work. See RFC 003.

### The principal MFE case is standardized

The immediate deployment scenario is mostly SPAs, with MFEs using React 19 and one tested Salt/theme version set. Shared module instances, host-owned document settings, explicit providers for independent roots, and focused correctness fixes are the recommended starting point. Arbitrary mixed versions and full isolation are separate capabilities. A styling-runtime replacement is not an implied solution. See RFC 003.

### Plain CSS remains the current recommendation

RFC 003 evaluates CSS Modules as an option for private component selectors. A broad migration must first justify its benefit and preserve supported customization. Class scoping, theme ownership, stylesheet delivery, and document-level runtime coordination are separate decisions. CSS Modules are not required for the other RFCs.

### Agent support is an evidence question

Version-matched content and deterministic checks remain useful, while retrieval format and instructions need task-level evidence. Existing documentation corrections and the maintainer pilot can stand independently of the larger agent-docs branch. Runtime-generated UI needs a renderer/state/action contract and stays a separate conditional experiment. See RFC 004.

## Suggested implementation order

These are review and sequencing proposals, not delivery dates or assigned team commitments.

| Stage                                               | Work                                                                                                                                                                                             | What the stage should establish                                                                           |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| 1. Agree contracts and deliver bounded improvements | Popup cases and React recipes; form characterization and `Switch.inputRef`; system appearance; focused MFE reproductions; documentation corrections and maintainer pilot.                        | Useful improvements that preserve existing usage, with observable acceptance criteria.                    |
| 2. Prove the new integration boundaries             | Native field/custom selector, identity and multiselect; typed render composition; initial-document theme ownership and targeted CSS/runtime fixes; fresh packaged-agent consumer and task pilot. | Coherent behavior under controlled updates, errors, reset, SSR, composition, and real consumer workflows. |
| 3. Publish or expand what the evidence supports     | Small supported form surface and migrations; proven composition additions; further controls and deployment capabilities; effective guidance/rules.                                               | Local adoption with explicit guarantees, documentation, and compatible release boundaries.                |
| 4. Revisit conditional experiments                  | Richer event metadata or Action props; adaptive color output; CSS Modules/private selectors; native React styles; additional agent interfaces or runtime-generated UI.                           | A concrete unmet need and enough benefit to justify the extra public and maintenance contract.            |

The first stage is parallel work, not a prerequisite to start every other investigation. No team needs to wait for all four RFCs to finish before shipping an unrelated compatible correction.

## Dependencies and ownership

| Shared concern                                                  | Primary RFC | Coordination required                                                                             |
| --------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------- |
| Selection identity versus labels/query                          | 001         | 002 uses the same identity when defining serialized values.                                       |
| Form payload, validation, reset, and field association          | 002         | 001's React recipes must use a verified form contract.                                            |
| Popup focus and component lifecycle                             | 001         | 003 handles shared document locks, independent roots, and target-window resources.                |
| Provider, portal, document, and style ownership                 | 003         | 001/002 consume the resulting boundaries without adding a competing ownership mechanism.          |
| Canonical guidance, examples, diagnostics, and agent evaluation | 004         | All RFCs supply their accepted contracts and verified examples to the same documentation sources. |

Keep one owner for each shared mechanism. For example, do not independently introduce different object-key systems in the list controls and the new form selectors, or different document-ownership rules in system appearance and MFE integration.

## Decisions that remain open

The detailed tables in each RFC are authoritative. The most consequential publication gates are:

| Area                  | Decision still needed                                                                                                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Component integration | Richer change reasons/cancellation, useful render types, and the need for any Salt-owned Action prop.                                                                                     |
| Form controls         | Public adoption surface; companion strategy; controlled commit boundary; unavailable selections; invalid formatted drafts; repeated-value ordering; reset/default and read-only policies. |
| Themes and runtime    | Initial-document handoff and hydration; document/target ownership; exact supported shared-module configuration; evidence for any CSS or style-delivery change.                            |
| Guidance and workflow | Schema ownership, diagnostic severity/exception policy, representative task/client baseline, and acceptance of the existing implementation branches.                                      |

Unresolved decisions should block only the capabilities that depend on them. They should not turn a small additive fix into a catalog-wide design exercise.

## Coverage of the source discussions

| Discussion or follow-up                                                                                                          | Where consolidated                     | How the final direction is represented                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Base UI comparison, other modern systems, and React direction, November 4–5                                                      | 001, with specialist detail in 002–004 | Learn from explicit contracts and implementation techniques; preserve Salt; start with tests and recipes.    |
| Form rebuild and detailed form RFC, November 5                                                                                   | 002                                    | Consolidates the earlier long draft while retaining lifecycle, migration, and unresolved publication gates.  |
| Theme modernization and plan review, November 5                                                                                  | 003                                    | Uses the reviewed system-appearance-first order and retains current browser support.                         |
| MFE investigation and the same-version/mostly-SPA clarification, November 4                                                      | 003                                    | Prioritizes correctness and ownership for the stated deployment model.                                       |
| CSS Modules follow-up, November 6                                                                                                | 003                                    | Records the current plain-CSS recommendation and a conditional private-selector option.                      |
| Agent-docs, correct usage, accessibility repair, layering/background guidance, and evaluation discussions, October 22–November 4 | 004, with theme boundaries in 003      | Preserves canonical sources, version resolution, lean routing, and separate integrity/rule/outcome evidence. |
| Maintainer review/workflow and independent documentation extractions, November 3                                                 | 004                                    | Reuses the existing pilot and reference branches; does not present them as newly implemented here.           |
| Benchmark suitability and generative UI, November 4                                                                              | 004                                    | Records the candidate task harness and separately gated runtime-UI experiment.                               |

Build tooling, build performance experiments, and task-runner selection are outside this set. Unrelated individual PR fixes are evidence for the proposed workflow where applicable, rather than additional RFCs.

## How to review

Read this index, then the RFC for the area you own. Review the proposed contract, the compatibility boundary, and the first implementation slice before debating optional later APIs. Record a decision as accepted, revised, deferred, or rejected, with the reason and the evidence needed to revisit it.

Acceptance of one RFC does not accept all four. Each implementation change still needs a reviewable scope and evidence for the behavior it changes. Status remains draft until the team records that decision.
