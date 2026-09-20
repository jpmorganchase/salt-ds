# Plan 033 pilot knowledge gaps

This is a bounded content inventory for the editable-record pilot, inspected on
2026-09-20. The inventory compares canonical source guidance with the generated
workflow and Button Loading guides before the accepted follow-up below. It is not
a completeness score, a requirement for new headings, or a full audit of Salt
documentation.

The original pilot supplied the evidence for its ten agreed questions at the
default 16 KiB context budget. The user subsequently accepted the three content
decisions below. Independent observation of the authoring process remains
outstanding.

## Confirmed composition decision

On 2026-09-20, the user clarified that dialog actions should always follow the
Button bar guidance, and may use `SplitLayout` and `FlowLayout`. This resolves
the policy question in the first candidate below. Dialog usage and Button bar
now state this rule and link to each other; the inventory below describes the
sources at inspection time. Layout components remain optional composition tools,
not exceptions to the Button bar guidance.

## Confirmed cancellation direction

On 2026-09-20, the user agreed with the proposed distinction between abandoning
edits and pausing work. With no changes, close without confirmation. In a simple
Save/Cancel editor, Cancel abandons unsaved edits; protect meaningful work with
explicit Keep editing and Discard changes choices. For a longer, interruptible
task, retain a resumable draft and use a clear Close or Save draft action with a
separate way to discard it. A failed save retains the draft and offers retry.

Forms now states these decision factors in **Cancellation and drafts**, and
Dialog links to that section. The example labels its preserving action **Close**,
uses the bordered secondary appearance, and explains that reloading clears its
drafts. The recipe and README describe retention across selection changes and
clearing on successful submission or dashboard unmount. This does not add durable
draft storage or a separate discard feature.

## Confirmed refresh and recovery direction

The user accepted Content status when a region has no content, local loading
feedback while existing content refreshes, and a Banner with Retry in the
related container when refresh fails but previous data remains. Whole-page
issues use a page Banner. Severity follows impact and safe continuation.
Content status now owns **Choosing how to communicate loading and recovery**;
Banner usage links back to it.

This guidance preserves valid filters, selection, scroll and focus, protects
unsaved drafts, distinguishes previous results after a scope change, and requires
disabling or revalidating actions when stale data would be unsafe. The added
refresh-feedback question checks those conditions. All eleven follow-up questions
now deliver their required evidence at 16 KiB; at 8 KiB, one is complete and ten
return qualified, resolvable omissions. The final source review, 824-test suite,
42 offline packaged CLI operations and local rendered checks passed. Exact
verification and limits are recorded separately in the pilot handoff; the older
inventory and results below remain historical.

## Evidence by topic at the original inspection

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
status-dialog configuration remains in canonical usage; this editor does not use
a status dialog. Its accessible-name, scrollable-content and keyboard-interaction sections remain in
its canonical accessibility page; Button bar's use/exclusion and appearance
guidance remain in its canonical pattern page. The selected Button guide covers
Loading, rather than duplicating all Button usage guidance. The selection is
visible in
[`buildSelectedGuidance.ts`](../packages/knowledge/src/build/buildSelectedGuidance.ts).
These are selection boundaries, not missing authored knowledge. This inventory
does not claim that those additional questions were tested through `context`.

For the original tested candidate, no required default-budget evidence was
missing. At 8 KiB, seven of ten packets explicitly omitted some evidence while
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

## Three content improvements identified at the original inspection

1. **Explain the action-area composition once.** In Dialog/Forms guidance, connect
   `DialogActions` to the Button bar's placement and responsive layout advice.
   Apply the user's confirmed rule above and describe `SplitLayout` and
   `FlowLayout` as available composition tools. Check the question “How do I
   apply the Button bar pattern inside a dialog?” against that explanation.
2. **Add decision factors for cancellation policy.** Extend the existing Forms
   paragraph using the confirmed cancellation direction above. Reconcile the
   example's preserving-action label and recipe together, keeping its in-memory
   limits explicit. The desired answer explains a choice rather than turning
   the example into the default for every application.
3. **Decide the scope of refresh/recovery guidance.** Review the worklist's
   preserve-content-on-refresh behavior alongside Content status. If Salt wants
   a general recommendation, author its conditions and exceptions there and link
   the example. Until then, report it only as this example's behavior.

The user accepted these three follow-ups, now implemented as described above.
They require no new metadata system, mandatory page structure, knowledge service
or test snapshot. The independent maintainer exercise remains outstanding.
