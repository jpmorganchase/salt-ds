# Plan 033 supporting handoff: Capture decisions in task context

## Status and intent

- Status: IN PROGRESS — activated within Unit 033/02a on 2026-09-19.
- Planned at: `53ab0863e`, 2026-09-19.
- Pilot implementation: committed at `b67c32832` on 2026-09-20 after clean source review, verification and the user's guidance acceptance.
- Category: direction/content; priority P1; effort M–L (several days, re-estimate after the content pass); risk MED.
- Parent: `plans/033-deliver-verified-salt-workflows.md`, current Unit `033/02a`.
- User direction: improve canonical Salt knowledge and deterministic task context; keep infrastructure proportionate to the content problem.
- Content review: the user accepted the six guidance statements presented in the conversation on 2026-09-20: "The guidance looks correct."

Start with **edit one existing record, submit, fail and retry**. Make its design decisions, composition, state ownership, accessibility and limitations available as source-backed evidence. Use the existing service-worklist, Forms, Dialog, Button and Button bar material. This is a test of a better knowledge representation, not another application or workflow family.

The first deliverable is corrected canonical guidance and ten question-to-evidence cases. Extend the compiler only to express and deliver that content. A broad ontology, new retrieval service, new documentation site and model-generated knowledge are outside the proposal.

The parent plan now records this selected pilot scope within the current unit; its existing plan digest/control are updated together. Preserve the original checkpoint and historical evidence. Do not invent another control file or validator. This handoff does not complete Unit 033/02a, promote the runnable workflow, or grant consumer contact, installation, model-trial, publishing or deployment authority. Existing human acceptance work remains separate.

The user's content acceptance covers retaining values with field feedback, a concise announced error summary and first-invalid-field focus; progress and prevention of duplicate submission or closure while saving; draft retention and retry after failure; an explicit cancellation policy with draft preservation in this example; application ownership of the draft and editor visibility; and choosing a dialog or page according to the task and interruption involved. This records review of the guidance presented in the conversation. Workflow-owner, rendered design, manual accessibility and independent maintainer reviews remain pending.

## What the branch already provides

| Evidence at the planning commit                                                                                                                          | Meaning for this work                                                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/knowledge/src/records/knowledgeRecordSchema.ts:497` defines provenance-backed relationship records; `:1668` makes their family non-searchable. | Extend an existing representation and follow its references; do not build a graph subsystem. Keeping relations out of ordinary lexical results is not itself a bug. |
| `packages/knowledge/src/build/buildSelectedGuidance.ts:40` selects Forms headings, including use/exclusion and submission/recovery guidance.             | Reuse selected MDX extraction; headings and canonical section IDs already exist.                                                                                    |
| `packages/knowledge/src/documents/documentSchema.ts:79` retains `heading_path`, blocks and source information.                                           | Preserve meaning during assembly instead of creating duplicate frontmatter prose.                                                                                   |
| `packages/knowledge/src/documents/assembleCanonicalDocument.ts:261` currently emits `purpose: "guidance"` for every selected MDX section.                | This is the narrow loss of semantic role to address.                                                                                                                |
| `packages/knowledge/src/documents/workflowRecipeSchema.ts:109` already defines draft ownership, callbacks, submission state, acceptance and limitations. | Reuse structured workflow facts. Do not duplicate them in another state model.                                                                                      |
| `packages/knowledge/src/search/searchSalt.ts:1050` attaches canonical documents to ranked records; `:1103` prioritizes their sections.                   | Keep lexical discovery and extend bounded selection, rather than replacing retrieval.                                                                               |
| `packages/knowledge/src/search/retrievalGold.spec.ts:68` measures record hits; `canonicalRetrieval.spec.ts:92` already tests actual context.             | Add an evidence-delivery suite alongside current tests, separate from the frozen 40-query corpus.                                                                   |

Current assembly excerpt, to check before editing:

```ts
reference: `${base}#${section.id}`,
source_path: source.source_path,
source_url: sourceUrl,
purpose: "guidance",
```

The document model, logical Zod codecs, verified store, source inventories and common assembler are the conventions to follow. Match the generated-store setup in `canonicalRetrieval.spec.ts`, and focused synthetic document/budget cases in `packages/knowledge/src/__tests__/documents/canonicalContext.spec.ts`. The platform is unreleased: update current schemas, callers and documentation together, with no compatibility shim.

## Content boundaries and editorial corrections

Humans own intent, rationale, conditions, composition meaning and constraints. Code remains authoritative for exports, props, defaults, types, versions and deprecations. The recipe remains authoritative for this example's host seams, simulation, readiness and limitations. A behavior in the demonstration is not automatically a general Salt recommendation.

Primary content sources:

- `site/docs/patterns/forms.mdx`: use/exclusion, submission/recovery, anatomy, full-page versus overlay criteria.
- `site/docs/components/dialog/usage.mdx`, `examples.mdx`, `accessibility.mdx`: interruption tradeoff, composition, responsive sizing, focus and confirmation distinctions.
- `site/docs/patterns/button-bar.mdx`: action composition, appearance, ordering and narrow-screen behavior.
- `site/docs/components/button/examples.mdx#loading`: pending-action feedback and `loadingAnnouncement`.
- `examples/apps/operations-dashboard/src/workflows/service-worklist/recipe.json`: existing example identity, ownership, actual states and limitations.

Correct the Button bar contradiction before using it as expected evidence: the paragraph at line 94 calls Example 1 Cancel solid, while the following example and image description at lines 99–103 call it bordered. Check the actual referenced example/diagram and reconcile the prose; do not invent a general Cancel appearance rule.

The user's illustrations are design questions, not approved Salt policy:

- `SegmentedButtonGroup` is documented as grouped actionable buttons (`segmented-button-group/usage.mdx:17`). `ToggleButtonGroup` has the "Segmented control" alias and single-selection semantics (`toggle-button/index.mdx:4–9`). A list/card presentation preference needs canonical authoring before becoming a rule.
- Tabs already has use/exclusion guidance and Stepper/NavigationItem alternatives (`tabs/usage.mdx:13–22`). It does not establish the proposed same-data view-switching preference.
- Dialog explicitly supports confirmations (`dialog/examples.mdx:27`); do not author a blanket prohibition.
- This recipe's submission values are `idle`, `pending`, `failed`. Validation, retry, success and cancellation also describe outcomes/transitions; do not fabricate a universal eight-state enum.
- At the planning baseline, background-refresh retention was example behavior. The accepted follow-up below authors its general conditions in Content status.

## Ten development evidence cases

Keep these separate from historical evaluation fixtures. These are development regressions, not a holdout, a maintainer-approval claim or proof of agent performance. The expected evidence must be written from canonical content before tuning selection.

| Question                                                                    | Evidence required; overclaim to avoid                                                                            |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Should this short record editor use a dialog or a page?                     | Forms full-page/overlay criteria plus Dialog interruption tradeoff; no universal dialog preference.              |
| Who owns the draft and whether the editor is open?                          | Forms host ownership plus this recipe's host/wrapper split; identify example-specific details.                   |
| What happens when submitted fields are invalid?                             | Retained values, associated field feedback, concise summary and first-invalid focus.                             |
| How should Save behave while pending?                                       | Prevent duplicate submission/closure, show progress, preserve Button loading announcement guidance.              |
| Should a failed save clear or close the form?                               | Retain draft and offer retry; do not assume backend semantics.                                                   |
| Does Cancel discard the edits?                                              | Explicit preservation/discard policy; distinguish the example's preserve-on-cancel choice from general guidance. |
| What goes in the dialog and where do Save and Cancel go?                    | Dialog anatomy, actual host/form ownership, relevant Button bar layout; no invented ButtonGroup equivalence.     |
| Where does focus go when the editor opens and closes?                       | Initial-focus options and trigger restoration; retain confirmation/destructive-action distinctions.              |
| What changes on a narrow screen?                                            | Dialog sizing, applicable stacked actions and form reading order.                                                |
| Does the example establish concurrent editing or production-scale behavior? | Runnable readiness, pending manual reviews and explicit exclusions; never certify these missing capabilities.    |

Each case declares an exact package scope, question, expected canonical section/record references, independent source-backed fact anchors and required qualifications. Use the generated bundle's tested version for each declared package, as `retrievalGold.spec.ts` already does. Do not copy the historical version numbers from the user's illustrative packet.

## Pilot development regression results

The first implemented slice passes all 26 checks in `packages/knowledge/src/search/taskKnowledgePilot.spec.ts` and the Knowledge test typecheck. The ten questions and their independent source-backed fact anchors live in `packages/knowledge/src/__fixtures__/taskEvidenceQuestions.json`. These are development regressions, not held-out evaluation, maintainer approval, or evidence of improved agent implementations.

At the 16 KiB default, all ten questions deliver their required evidence. At 8 KiB, three remain complete and seven disclose relevant omissions whose references resolve to the missing evidence and its qualifications. Omission outcomes are not counted as complete evidence. The checks cover independent source-backed fact anchors within their cited sections, conditional evidence groups, JSON and Markdown delivery, byte bounds, determinism, references, unsupported versions, and three mutation negatives.

The anchors retain decisive conditions and negation without requiring complete sentences. Rendering checks normalize formatting and verify references separately. The tests still depend on the selected public section references and a small amount of authored terminology; they do not infer semantic equivalence across arbitrary rewrites.

| Case               | 16 KiB outcome | JSON / Markdown bytes | 8 KiB outcome      | JSON / Markdown bytes |
| ------------------ | -------------- | --------------------- | ------------------ | --------------------- |
| editor-surface     | Complete       | 15,563 / 10,094       | Qualified omission | 7,058 / 4,336         |
| editor-ownership   | Complete       | 11,066 / 7,194        | Qualified omission | 7,536 / 4,405         |
| invalid-fields     | Complete       | 10,148 / 6,544        | Qualified omission | 7,256 / 4,130         |
| pending-save       | Complete       | 15,971 / 9,625        | Qualified omission | 7,537 / 4,386         |
| failed-save        | Complete       | 11,608 / 7,788        | Qualified omission | 7,545 / 4,394         |
| cancel-policy      | Complete       | 13,566 / 8,828        | Qualified omission | 7,530 / 4,379         |
| dialog-composition | Complete       | 16,259 / 11,411       | Qualified omission | 7,304 / 4,457         |
| dialog-focus       | Complete       | 14,848 / 8,854        | Complete           | 7,683 / 4,419         |
| narrow-screen      | Complete       | 15,204 / 9,229        | Complete           | 8,169 / 4,983         |
| example-limits     | Complete       | 10,176 / 6,572        | Complete           | 7,284 / 4,158         |

JSON measurements include the framing newline. Measurements use the exact four-package example scope and the generated documentation candidate's tested versions, after rebuilding the current context implementation and canonical content. They are development measurements rather than packed-artifact verification; no temporary compiler or bundle identity is treated as the final candidate. A preliminary read-only probe used fewer representative facts, so its earlier evidence-presence counts are not a baseline score for this stronger suite. Full repository, packed-consumer and author-preview verification remain separately reported. Workflow readiness stays `runnable`; workflow-owner, design, accessibility and independent maintainer acceptance remain pending.

## Original pilot local verification

All 818 Knowledge/CLI tests across 61 files pass, along with tooling build and type checks, current plan and contract validation, evaluation-fixture validation, public documentation checks, release embargo, changed-file quality and whitespace checks. The full suite ran through the installed Vitest entry with one worker because this checkout lacks the command shim. Earlier verification exposed a five-second timeout and two CLI reference regressions; the final suite passes without competing build work. No assertion or timeout threshold was relaxed.

The initial package check exposed repeated complete-guide Markdown in attached page, pattern and component projections. The existing writer now keeps one complete guide and emits ordinary relative links from those projections; direct document resolution remains complete. Final Knowledge size is 25,831,796 unpacked bytes against the unchanged 26,214,400-byte limit. Three integration cases verify that the links reach the complete manifest-bound guide. Package evidence is in the ignored `dist/salt-ai-pack/task-knowledge-pilot.json` report.

The exact final packed CLI and Knowledge artifacts passed 37 offline operations across standalone and hoisted layouts, including all ten default-budget pilot questions, the additional mixed focus/invalid-fields review case, version selection, qualified document resolution, Skill artifact integrity and read-only fixture checks. These checks reuse local runtime dependencies without installation and do not establish a newly installed or rendered workflow application. The ignored reports are `dist/task-knowledge-pilot/result.json` and `final-evidence-metrics.json` in that same directory.

The offline author preview rendered the edited Forms, Dialog usage and Button bar pages. Their added links, corrected bordered Cancel description and heading/list structure were checked visually and through the rendered document. This is canonical-content preview evidence, not requalification of the separate workflow resource panels or consumer UI cohort. A pre-existing generated Core declaration directory that interfered with source extraction was preserved at `dist/task-knowledge-pilot/preserved-core-dist-types`; no Core source was changed.

The user explicitly approved external source review. The final UTF-8-mode `autoreview --mode local` run exits 0 with no accepted/actionable findings. Accepted findings and behavior regressions were repaired within the existing context boundary: preserve constraint and mixed-role evidence, retain directly matching authored guidance and screen-reader semantics, keep ownership priority consistent, retain component/example references, and disclose every omitted guide in terminal packets. Request-local score reuse avoids repeated computation. A suggestion to retain every lexical match in role-focused compact packets was declined: requested roles intentionally take priority under a finite budget, while complete-guide references preserve access to secondary evidence and qualification groups remain atomic. The ignored review reports and scope decisions are in `dist/task-knowledge-pilot/autoreview.json` and `review-attempts.json`.

All ten development questions deliver complete required evidence at 16 KiB. At 8 KiB, three are complete and seven have explicit resolvable omissions. The additional real-content focus/validation case retains all seven required Forms facts at 16 KiB and discloses a qualified omission at 8 KiB. Its regression and the multi-guide terminal-disclosure regression both failed before their respective repairs. The user's guidance acceptance is recorded above; the remaining workflow and maintainer reviews, readiness promotion, publication and deployment remain separate. The verified pilot implementation is committed at `b67c32832`.

## Follow-through on 2026-09-20

The user requested the proposed commit, workflow check, authoring exercise and
small knowledge-gap report. The original pilot commit is `b67c32832`; the
following work stays within Unit 033/02a and does not expand the workflow family.

### Running workflow

A fresh local source preview used the current workspace packages (Core 1.71.0,
Lab 1.0.0-alpha.104 and Theme 1.46.0) and existing local dependencies. All 17
exported workflow files matched current application sources after CRLF
normalization. The older packed preview uses a different package cohort and was
not treated as current evidence.

The existing sample-app acceptance functions ran unchanged against this source
preview. Validation, pending duplicate prevention, retained drafts after failure,
retry, cancellation, labels/error associations, keyboard/focus, filtering,
worklist recovery, empty states, theme controls, axe and 320 CSS-pixel layout
checks passed. There were no runtime errors or external requests. The separate
interactive browser walkthrough confirmed the edit/invalid/pending/fail/retry
sequence, focus restoration, preservation after Cancel, and keyboard focus wrap.
At 320 by 720 CSS pixels, the dialog and page fit the viewport; its stacked
last action was reachable by keyboard and scrolled into view.

Evidence remains ignored under `dist/task-knowledge-pilot/workflow-review/`:
`provenance.json`, `result.json`, `interactive-walkthrough.json` and seven
screenshots. This is current-source verification, not a fresh installed-package
cohort, independent human design acceptance, actual browser zoom testing or
screen-reader speech verification.

### Authoring rehearsal

An agent-run rehearsal changed only an ignored copy of Forms from “If it fails”
to “If submission fails”. The actual parser, canonical assembler, Markdown
renderer and context builder delivered the changed clause under the same Forms
source reference; canonical document identity changed, and workflow readiness,
limitations and retry qualifications remained present. The changed context was
11,616 JSON bytes and 7,796 Markdown bytes within the 16 KiB budget.

An unsupported component in the copied selected section produced
`MDX_UNSUPPORTED_COMPONENT`, the correct section ID and a source-body location;
removing it cleared the diagnostic. Evidence is in
`dist/task-knowledge-pilot/authoring-rehearsal/result.json`, with the source diff,
diagnostic, rendered Markdown and both context outputs beside it.

This rehearsed an existing discoverable section through a temporary content
overlay on a verified baseline. It did not generate a new sealed bundle, update
the lexical index, render the copied edit on the website or measure independent
maintainer effort. Canonical source prose was unchanged. The rehearsal exposed
a needless pronoun dependency in the failed-save evidence anchor; it now keeps
“fails, retain the draft” and “offer a retry”, allowing this clarification while
retaining the decisive failure/recovery clauses. All 27 existing pilot evidence
checks pass after this focused fixture adjustment; no new permanent tests or
runtime changes were added.

### Prepared independent maintainer exercise

Have a maintainer who did not build the compiler use the existing
[author guide](../docs/ai/contributing.md#current-workflow-authoring) to change
the example's minimum trimmed incident-title length from five to eight
characters, with matching example-specific explanatory guidance. This is an
exercise proposal, not an adopted global Forms rule or a change already made.

The relevant source boundaries are the record-form validator and error message
in `types.ts`, the input's `minLength` in `RecordForm.tsx`, and an explanatory
acceptance clause in the service-worklist recipe. Update the existing affected
sample-app assertions for seven-character rejection and eight-character
acceptance; preserve the meaningful validation/pending/failure/retry checks.
Record the repeated threshold/message facts rather than disguising their
maintenance cost. Do not manually update generated output or add a second
AI-only explanation.

Follow the author guide's ordinary generation, packed reconstruction and offline
preview path, inspecting website guidance, source view/downloads, Markdown and
CLI evidence. Exercise one unsupported MDX block in a selected copied or
reversible source change, record the diagnostic and its correction, then restore
valid content. Record active editing time separately from build/wait time, actual
source files edited, repeated facts, diagnostic clarity and help required from
the compiler author. The agent rehearsal above does not substitute for this
independent human exercise. No maintainer has been contacted or recorded as
having completed it.

The [knowledge-gap report](./033-knowledge-gap-report.md) identified three
editorial decisions: DialogActions/Button bar composition, preservation versus
discard criteria, and refresh/recovery feedback. The user accepted all three,
with Banner feedback scoped to the affected container when useful previous
content remains. The follow-up below implements that direction; the original
inventory and verification results remain historical.

## Accepted content decisions on 2026-09-20

The follow-up begins at `bca9cad834d29f5126851034c953c863b16179c6` and stays in
Unit 033/02a. DialogActions always follows Button bar guidance; SplitLayout and
FlowLayout are optional composition tools, and wrapping does not replace
explicit narrow-screen stacking. Forms now distinguishes abandoning unsaved
edits from pausing draft work, including meaningful-loss protection and avoiding
nested confirmation dialogs. The example's retaining action is Close, with a
bordered secondary appearance and a visible reload-lifetime note. Its recipe
and README explain actual in-memory ownership and clearing behavior. No durable
persistence or separate discard feature is added.

Content status connects initial loading/empty/failure, local refresh progress,
and a Banner with Retry when previous content remains after refresh failure.
Banner usage links to this guidance. It preserves valid selection and focus,
protects drafts, distinguishes previous results after a scope change, and
qualifies continued use when stale data would be unsafe.

The new sections enter Knowledge through existing selectors. The expanded
combined workflow initially exceeded the unchanged 65,536-byte document resource
cap, so Content status becomes its own contextual guide using the same existing
shape as Button Loading. Its pattern/page attachments transfer; the recipe still
declares the canonical source, and unsupported selected MDX remains an error.
A canonical Analytical dashboard link keeps the separate guidance discoverable
in the workflow panel. Forms explicitly links its overlay choice to Dialog use
and interruption conditions; those sections are one qualified evidence group
within this editor workflow. Button bar layout and dialog order likewise remain
together. Dialog form behavior and action composition have their own roles instead of
inheriting the general use-condition group. Status-dialog configuration remains
in canonical Dialog usage, outside this record-editor projection; the example
does not use a status dialog. Lexical ranking is unchanged. The larger guidance
exposed two existing CLI journey regressions: context dropped named-component
and example references too early. Budget fallback now tries shorter ranked
match prefixes and smaller qualified guidance before dropping example references;
canonical guidance still precedes an example-only fallback. Existing reference,
qualification and byte-budget checks remain in force.
The development corpus updates cancellation and action-composition evidence
and adds one natural refresh-feedback question. There is no new schema,
query-specific ranking rule or fixed corpus-size assertion. Existing behavioral
checks retain their assertions with Close as the expected label.

### Follow-up verification (2026-09-20)

The final built bundle is `sha256:d87b47ff4d81a16a530f3c42306e174152505c997ecea106a5bd3a2c4dcfb8c4`. All eleven development questions deliver
required evidence at 16 KiB. At 8 KiB, one remains complete and ten disclose
qualified, resolvable omissions. These omissions are not complete answers.
JSON measurements include the framing newline; Markdown is measured separately.
The scope remains Core 1.71.0, Icons 1.18.2, Lab 1.0.0-alpha.104 and Theme 1.46.0.

| Case               | 16 KiB JSON / Markdown | 8 KiB evidence     | 8 KiB JSON / Markdown |
| ------------------ | ---------------------- | ------------------ | --------------------- |
| editor-surface     | 16,293 / 10,558        | Qualified omission | 7,045 / 4,450         |
| editor-ownership   | 15,723 / 10,610        | Qualified omission | 7,861 / 4,735         |
| invalid-fields     | 16,336 / 10,833        | Qualified omission | 7,847 / 4,721         |
| pending-save       | 16,201 / 11,226        | Qualified omission | 7,394 / 4,278         |
| failed-save        | 16,368 / 11,204        | Qualified omission | 7,149 / 4,609         |
| cancel-policy      | 15,895 / 10,405        | Qualified omission | 7,295 / 4,124         |
| dialog-composition | 16,239 / 11,388        | Qualified omission | 7,861 / 4,944         |
| dialog-focus       | 12,918 / 7,177         | Complete           | 8,050 / 4,428         |
| narrow-screen      | 15,059 / 9,152         | Qualified omission | 7,772 / 4,824         |
| example-limits     | 15,570 / 10,271        | Qualified omission | 7,441 / 4,243         |
| refresh-feedback   | 16,301 / 10,994        | Qualified omission | 6,797 / 4,172         |

The complete Knowledge/CLI suite passed: 824 tests in 61 files. Final typechecking,
public-document/example checks, contract/evaluation validation, Plan 033,
release-embargo and changed-file quality checks passed. Existing regressions
verify named-component discovery, contextual example resolution, canonical
qualification groups and both byte budgets. Tests no longer require an exact
corpus size, exactly one returned guide or an empty match list in a tiny packet.
No timeout or package/context limit was raised.

The final package check passed with 630 Knowledge files and 25,853,055 unpacked
bytes against the existing 26,214,400-byte limit. The Knowledge tarball SHA-256 is
`a5a6dce5e2da7b37d4708ea6c9a4aa268dc91a0f75b8b73e2a32bda17be00055`;
the CLI tarball SHA-256 is
`ce10b80a7c460b90d69be57e1e7dd3c475b43e69b644f6cf299f72145102eed1`.
The offline packaged CLI passed 42 operations across standalone and hoisted
layouts, including all eleven evidence questions, mixed invalid-field/focus
wording and the two Dialog component/example reference regressions. Both
fixtures remained unchanged. Existing dependencies were copied locally; no
package installation or live consumer cohort is implied.

Six canonical pages passed fresh-snapshot/rendered author checks and visual
inspection. The source workflow preview passed the existing validation,
pending/duplicate-prevention, failure/retry, draft retention, focus/keyboard,
refresh/empty, theme, narrow-screen and automated accessibility checks. All 17
workflow files and recipe facts were rebound to the final generated artifact;
no app source changed after the browser pass. This is local source-preview
proof, not a new installed UI cohort or manual accessibility acceptance.

Final structured source review is clean after narrowing the Content status
Banner overview rule to failed refreshes with retained content and qualifying
initial loading by the absence of useful previous content. Prior failed
attempts and review findings remain in ignored local evidence. Final reports are
under `dist/task-knowledge-decisions/` and the exact pack report is
`dist/salt-ai-pack/task-knowledge-decisions.json`; raw output and generated
Knowledge are not committed.

Human workflow-owner, rendered design, manual accessibility and independent
maintainer acceptance remain separate and pending. Workflow readiness remains
`runnable`; no publication, deployment or model trial occurred.

### Laptop UI review follow-up (2026-09-21)

The user's live review identified an inappropriate warning status on the record
editor, visually unclear form-error text and verbose action labels. This scoped
follow-up starts from `42ae61be929d26ff3510f09ecd86678e03cd48c3`.
The editor now uses the ordinary Dialog appearance. A single error Banner shows
the validation summary or save failure, while field-level messages, focus and
recovery behavior remain intact. Worklist refresh/retry use icon buttons with
accessible names and tooltips; service-table actions show Inspect with the
service name retained in the accessible label. Local simulation controls use a
labelled group and short visible text. Incident-list entries keep their visible
record identity.

The existing browser acceptance keeps its behavioral assertions and updates
only action locators and which controls are host-only simulations. No new test
snapshots, public component APIs or general rules about status dialogs are added.
The final bundle is `sha256:ee11d931f889623bd6d54fccc4f5117c903369a2a260b7b0858f9e16c0d0830c`.
All 17 exported workflow files match current source after line-ending
normalization, and the recipe facts match. Package checks passed in
`dist/salt-ai-pack/task-knowledge-ui-feedback.json`; Knowledge is 25,853,734
unpacked bytes against the unchanged 26,214,400-byte limit. Its tarball digest is
`sha256:dae80ff9c860e475ba34a3298d7198cbbc220a3776b1b7d0b75ba307c4dd5595`.

The current-source preview passed the existing workflow browser acceptance and
independent visual checks, including error recovery, focus, icon tooltips,
keyboard use, accessibility checks and a 320px viewport, with no runtime errors
or external requests. Source-preview typechecking passed using the repository's
source aliases and declarations; this is not a newly installed consumer cohort.
All 858 Knowledge, CLI and browser-harness tests passed across 62 files, and
source review returned no findings. The only subsequent source change reordered
named imports; `dist/task-knowledge-ui-feedback/post-review-source-check.json`
records that exact difference before the final rebuild and exported-file check.
Evidence remains under `dist/task-knowledge-ui-feedback/`. Plan consistency,
contracts, public docs, changed-file quality and release embargo checks passed.

The 2026-09-20 candidate above remains historical evidence for that content pass.
Human acceptance remains in progress and workflow readiness stays `runnable`.
No consumer installation, publication, deployment or model trial occurred.

## Implementation sequence

### 1. Establish the content and expected evidence

Read the sources above, correct the scoped contradiction, and improve cross-links and decision wording only where needed. General guidance stays on component/pattern pages; workflow-specific material stays in the recipe. Link alternatives explicitly in the relevant prose/list item rather than duplicating their explanation in metadata.

Add ten cases in `packages/knowledge/src/__fixtures__/taskEvidenceQuestions.json` and a table-driven `packages/knowledge/src/search/taskKnowledgePilot.spec.ts`. Give every expectation a canonical source; leave an unresolved design preference visible instead of manufacturing an answer. First capture which evidence is absent from current context. A missing result is a development failure to fix, not permission to weaken labels.

Verify: the existing focused retrieval tests still pass; the new cases run and report concrete missing evidence on the current implementation. Use `yarn check:public-docs` for edited public content. New normative decisions need ordinary Salt content/design review; lack of an answer blocks that claim, not independent extraction work.

### 2. Carry semantic roles and one useful relationship through the existing model

Extend the current selected-document representation and its canonical assembly. Start with the roles actually used by the pilot: use conditions, exclusions, alternatives/decisions, composition, behavior/state, accessibility and constraints. Retain a generic guidance fallback for other headings. Recognize a small documented set of headings and their hierarchy; never execute MDX or infer rules from arbitrary prose.

Use the existing relationship family for structural links. Introduce at most one new conditioned-alternative shape if existing shapes cannot preserve the distinction. It must identify both subjects and the exact authored evidence section/list item; retain the condition and rationale as authored evidence, not a guessed machine predicate. An arbitrary hyperlink is not a preference, and a conditioned alternative is not unconditional equivalence. Do not promote existing non-normative `related_to`/`composes` relationships into design rules.

Forms' explicitly linked alternatives and Dialog's non-interrupting Banner/Toast alternatives can exercise this shape. Add canonical targets to prose where currently only a component name is present. Keep relative-route resolution, source identity, missing-target diagnostics and applicability at the existing ownership boundaries. Limit relationship expansion to one step from relevant evidence, deduplicate results and apply compatibility checks to every added target.

Reuse recipe prerequisites, adaptation, acceptance and limitations for the task packet. Do not create another workflow registry, duplicate state list or new top-level record family merely to make a conceptual diagram literal.

Verify: focused extraction/codec tests cover heading classification, nested headings, conditioned alternatives, ambiguous/unresolvable targets and inert MDX. Changing the source condition must change emitted evidence/identity; removing it must not leave a usable preference edge.

### 3. Assemble useful bounded context and prove it

Keep the existing `context` command and deterministic lexical discovery. For a design choice, include the condition, reason and relevant alternative evidence together. For the editable-record task, prioritize roles/composition, host ownership, applicable states, accessibility, example readiness and limitations. A narrow loading or focus question should return focused guidance, not a full tutorial.

Recommendation evidence and material exclusions form one selection unit: include them together or return a qualified, resolvable omission. Preserve the recent compact-context repair. API facts stay code-derived; compatibility and source identity stay attached. Missing authored knowledge must remain an explicit gap, not a synthesized answer.

At the 16 KiB default, all ten cases must deliver their required evidence. At a declared compact budget (start at 8 KiB), test either complete qualified evidence or an explicit resolvable omission; count omissions separately from evidence successes. Check final JSON and Markdown byte lengths, stable ordering/digests, all returned references, unsupported versions and no-applicable-evidence behavior. Add a mutation negative that removes a decisive clause while keeping the same record/section discoverable: the evidence assertion must fail. Another negative must catch loss of an exclusion/limitation during compaction.

Verify: rebuild the candidate before generated-store tests; run the commands below. Record per-case evidence presence and omissions. Do not describe keyword/section-presence assertions as semantic answer correctness or infer agent improvement from them.

## Scope and verification

Implementation files are limited to the primary content sources above; their selected descriptors/inventory entries; `packages/knowledge/src/build/{buildSelectedGuidance,normalizeKnowledgeRecords,selectedMdxDocument}.ts`; the existing document/relationship codecs, canonical assembler and search context code; directly affected current callers/renderers; and focused tests under Knowledge/CLI. The existing Markdown projection writer in `buildKnowledgeV1.ts` may replace repeated full-guide aliases with ordinary relative links to the single complete canonical guide; runtime document resolution, artifact paths and package limits stay unchanged. This directly addresses the package-size increase from the selected guidance. Add extraction logic to existing modules unless one small cohesive helper is demonstrably clearer. Update `docs/ai/{knowledge-bundle,contributing,evaluation}.md` for the actual contract; correct evaluation.md's stale Plan 032 dispatch wording when editing it.

No UI component API changes, new application behavior, global page conversion, installation, ranking service, embeddings, graph database, LLM runtime, agent-host expansion or new release/control framework. No edits to frozen retrieval JSON, baseline reports, historical plan evidence or model trials. If another ownership boundary is required, narrow the pilot and report the dependency.

Existing verification commands (run as applicable, in this order):

```shell
yarn validate:salt-ai:plan-033
yarn check:public-docs
yarn typecheck:ai-tooling
yarn build:ai-tooling
node node_modules/vitest/vitest.mjs run packages/knowledge/src/search packages/knowledge/src/__tests__/documents --maxWorkers=1
yarn test:ai-tooling
yarn validate:salt-ai:contracts
yarn eval:salt-ai:validate
yarn check:ai-tooling:pack -- --report dist/salt-ai-pack/task-knowledge-pilot.json
yarn verify:salt-ai-release-embargo
yarn check:changed-quality -- --base 53ab0863e0ffcd1e14803b7e0041ce428c6d8b06
git diff --check
```

Expected: every command exits 0, existing retrieval regressions remain green, all ten default-budget evidence cases pass, compact omissions are explicit, and the exact candidate passes package limits. Run new focused parser/codec tests explicitly if their paths are outside the listed directories. Do not change thresholds to pass the pilot.

For edited canonical MDX, verify its rendered author preview through the existing offline-author workflow in `docs/ai/contributing.md:94–147`. That workflow already separates generation, packed sample reconstruction, web artifact verification and offline site preview; reuse it and its existing temporary fixtures/local dependencies. Do not fetch/install dependencies or call model services under this handoff. If a required local dependency is unavailable, report the specific unverified surface instead of claiming a preview passed.

Use ordinary reviewable commits after verification, matching `fix(ai): ...` / `feat(ai): ...` conventions. A new branch, if needed, uses `codex/`. Do not push, publish or promote through this handoff.

## Done criteria and next iteration

- Canonical human docs own every rule; the Button bar contradiction is resolved against its actual example.
- Selected semantic roles and any conditioned alternative are source-backed and remain inspectable through existing references.
- Ten default-budget questions pass independent evidence assertions, including negative conditions, readiness and limitations.
- Compact output preserves decision qualifications or discloses resolvable omissions; all added evidence obeys compatibility.
- Existing API/record retrieval, generated artifact identity, package limits and current verification remain intact.
- The author guide explains the small supported heading/link vocabulary and how to update a question after a reviewed content change.
- No claim of human approval, broader ontology coverage or improved agent outcomes is made from these checks.

Then consider a **non-blocking pilot knowledge-gap report** using the same emitted sections and source references. The existing `scripts/checkSaltDocsAuthoring.mjs` is a strict integrity/preview check, not a completeness report: preserve its default failures. An optional report may show evidence present, missing and not applicable for the selected topics, without requiring a web build or twelve headings on every page. Heading presence cannot establish editorial correctness; known unresolved decisions require human review. Build this only after the pilot has established what maintainers need to see.

After the existing independent maintainer exercise shows the authoring model is affordable, expand to the selection/view-switching cluster and eventually 30–50 maintained questions. Keep proposed new preferences unresolved until canonical Salt guidance establishes them. Agent implementation trials remain a separately authorized later measurement.

## Assessment limits and rejected directions

This assessment covers the Knowledge representation/context path, selected canonical content, retrieval evidence tests and authoring checks. It is not a full repository security, dependency, performance or accessibility audit. No new scored agent trial or live consumer observation was run; the local author preview and packaged CLI checks are reported separately above.

Rejected for this pilot: a new retrieval backend; a separate AI prose corpus; a generic relationship ontology; a universal state machine; literal adoption of the illustrative Tabs/segmented or confirmation rules; mandatory completeness scores across all docs; editing historical evals to improve current scores. These would add cost or encode unsupported policy before the first content-led slice proves useful.
