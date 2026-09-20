# Plan 033 pilot knowledge gaps

This is a bounded content inventory for the editable-record pilot, inspected on
2026-09-20. It compares canonical source guidance with the current generated
workflow and Button Loading guides. It is not a completeness score, a requirement
for new headings, or a full audit of Salt documentation.

The pilot already supplies the evidence for its ten agreed questions at the
default 16 KiB context budget. The most useful next work is to clarify a few
remaining design choices and observe the authoring process, rather than extend
the retrieval infrastructure.

## Evidence by topic

“Missing” below means the selected canonical sources do not answer the named
question. It does not mean every page needs that information or that the answer
is absent from the whole repository. “Not applicable” identifies responsibilities
that should not be added to this topic merely to fill a checklist.

| Topic            | Present in canonical content                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Missing or unresolved in the inspected content                                                                                                                                                                                                                                                                            | Not applicable to this topic                                                                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Forms            | Use/exclusion criteria; page versus overlay choice; field and action anatomy; application-owned drafts; validation feedback and focus; pending, failure, retry and explicit cancellation policy. Sources: [When to use](../site/docs/patterns/forms.mdx#when-to-use), [Submission and recovery](../site/docs/patterns/forms.mdx#submission-and-recovery), [Full page](../site/docs/patterns/forms.mdx#full-page), [Overlay](../site/docs/patterns/forms.mdx#overlay-dialogdrawer).                                                             | The cancellation rule requires an explicit policy, but gives no decision factors for choosing preservation versus confirmed discard. That remains a host/design decision; the example's preservation choice is not a universal recommendation.                                                                            | Backend persistence, concurrency and authorization guarantees. Those are application responsibilities and explicit example exclusions.                             |
| Dialog           | Interruption tradeoff, Banner/Toast alternatives, avoidance of nested dialogs, a link to Forms, header/content/actions anatomy, sizing, initial focus, focus trapping and restoration, and confirmation/destructive-action distinctions. Sources: [Usage](../site/docs/components/dialog/usage.mdx#using-the-component), [Default and sizes](../site/docs/components/dialog/examples.mdx#default), [Accessibility](../site/docs/components/dialog/accessibility.mdx#best-practices).                                                           | The selected prose shows the parts and the recipe identifies their owners, but does not explain the relationship between `DialogActions` and the Button bar pattern. It does not establish whether either is equivalent to another action-group component.                                                                | A universal preference for a dialog over a page, or ownership of the host's draft and backend submission.                                                          |
| Button           | Action versus navigation criteria; loading feedback, `loadingAnnouncement`, and a complete loading example. Sources: [Usage](../site/docs/components/button/usage.mdx#using-the-component), [Loading](../site/docs/components/button/examples.mdx#loading).                                                                                                                                                                                                                                                                                    | No additional authored gap was established for the pilot's pending-save question. Button loading alone does not establish form closure, retry or draft policy; those facts are already supplied by Forms and the recipe.                                                                                                  | Repeating the form workflow policy on the Button page, or manually documenting code-derived prop types and defaults.                                               |
| Button bar       | Task-completion use/exclusion criteria, visual grouping, layout components, action hierarchy, dialog placement and narrow-screen stacking. The Cancel appearance contradiction is corrected. Sources: [Use and anatomy](../site/docs/patterns/button-bar.mdx#when-to-use), [Layout](../site/docs/patterns/button-bar.mdx#layout), [Button options](../site/docs/patterns/button-bar.mdx#button-options), [Dialog](../site/docs/patterns/button-bar.mdx#dialog), [Stacked button bar](../site/docs/patterns/button-bar.mdx#stacked-button-bar). | The pattern explains `StackLayout`/`SplitLayout` construction, but not how that advice applies inside `DialogActions`. This is the same composition gap as the Dialog row, not a second missing feature.                                                                                                                  | Draft preservation, submit state ownership, or making one Cancel appearance mandatory in every context.                                                            |
| Service worklist | Explicit host/form ownership; inputs and callbacks; `idle`, `pending`, `failed` submission states; preserve-on-cancel; deterministic failure/retry and refresh behavior; automated acceptance, pending human reviews, runnable readiness and limitations. Source: [Recipe](../examples/apps/operations-dashboard/src/workflows/service-worklist/recipe.json), especially `setup`, `adaptation`, `acceptance` and `limitations`.                                                                                                                | The example preserves existing worklist content during failed refresh, but the inspected [Content status guidance](../site/docs/patterns/content-status.mdx) does not establish when that behavior should be a general recommendation. Success/cancellation are outcomes here, not additional declared submission states. | Claims about production data, backend behavior, notifications, persistence, concurrent editing, localization or authorization; the recipe expressly excludes them. |

## Authored gaps and delivery boundaries are different

The generated guides were inspected at
`dist/salt-ds-knowledge/markdown/guides/operations-dashboard.service-worklist.md`
and `dist/salt-ds-knowledge/markdown/guides/guide.button.loading.md`. These ignored
artifacts are inspection evidence, not an additional prose source to maintain.

The following public references preserve the relevant authored evidence:

| Evidence                                                  | Generated reference                                                                                                                                      |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Forms submission/recovery and surface choice              | `record:guide:operations-dashboard.service-worklist#forms.submission-and-recovery`, `#forms.full-page`, `#forms.overlay`                                 |
| Dialog conditions, composition and focus                  | `record:guide:operations-dashboard.service-worklist#dialog.using`, `#dialog.default`, `#dialog.focus`, `#dialog.initial-focus`, `#dialog.focus-sequence` |
| Action placement and stacking                             | `record:guide:operations-dashboard.service-worklist#button-bar.layout`, `#button-bar.dialog-order`, `#button-bar.stacked`                                |
| Loading and its screen-reader announcement                | `record:guide:guide.button.loading#button.loading`, `#button.loading.best-practices`                                                                     |
| Example ownership, states, review requirements and limits | `record:guide:operations-dashboard.service-worklist#prerequisites`, `#adaptation`, `#acceptance`, and the complete guide's Limits section                |

The abbreviated fragments in each row share that row's first complete record
reference. They are listed for inspection, not as new identifiers.

Some authored material is outside the selected workflow projection. Dialog's
accessible-name, scrollable-content and keyboard-interaction sections remain in
its canonical accessibility page; Button bar's use/exclusion and appearance
guidance remain in its canonical pattern page. The selected Button guide covers
Loading, rather than duplicating all Button usage guidance. The selection is
visible in
[`buildSelectedGuidance.ts`](../packages/knowledge/src/build/buildSelectedGuidance.ts).
These are selection boundaries, not missing authored knowledge. This inventory
does not claim that those additional questions were tested through `context`.

For the tested questions, no required default-budget evidence is known to be
missing. At 8 KiB, seven of ten packets explicitly omit some evidence while
retaining resolvable references; three remain complete. Those are delivery
omissions and must not be counted as complete answers or corrected by inventing
new prose. The exact evidence and limits are recorded in the
[pilot handoff](033-knowledge-content-pilot.md#pilot-development-regression-results).

## Human review still needed

The user accepted the six guidance statements presented in the conversation on
2026-09-20. That resolves the requested content review of those statements; it
does not establish approval of every surrounding page.

Workflow-owner, rendered design and manual accessibility acceptance remain
separate. An agent-led browser check or automated accessibility pass can report
observed behavior, but cannot supply those human signoffs. The recipe remains
`runnable` and continues to disclose its pending reviews.

There is no independent maintainer usability observation yet. In particular,
elapsed authoring effort, confusing diagnostics, repeated facts and the ability
to complete an edit using only the author guide have not been established by a
maintainer who did not build the compiler. A rehearsal is useful preparation;
it must not be described as that independent exercise.

## Three candidate content improvements

1. **Explain the action-area composition once.** In Dialog/Forms guidance, connect
   `DialogActions` to the Button bar's placement and responsive layout advice.
   Have Salt maintainers establish the intended distinction before describing
   equivalence or alternatives. Check the question “How do I apply the Button bar
   pattern inside a dialog?” against that approved explanation.
2. **Add decision factors for cancellation policy.** Extend the existing Forms
   paragraph with reviewed conditions for preserving a draft versus asking to
   discard it. Keep the current worklist's preserve-on-cancel behavior in the
   recipe. The desired answer explains a choice rather than turning the example
   into the default for every application.
3. **Decide the scope of refresh/recovery guidance.** Review the worklist's
   preserve-content-on-refresh behavior alongside Content status. If Salt wants
   a general recommendation, author its conditions and exceptions there and link
   the example. Until then, report it only as this example's behavior.

Choose the first follow-up after observing the authoring exercise and workflow
review. None of these candidates requires a new metadata system, mandatory page
structure, knowledge service or test snapshot.
