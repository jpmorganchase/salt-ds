# Salt reviewer requalification

The focused repair and all four frozen Sol reviewer cases completed on 2026-09-09.
The verified test app received REVIEW PASS; the separate navigation and clipping
cases received CHANGES REQUIRED; the missing-evidence case received INCOMPLETE.
All four required outcomes were met with actual source, local Salt and image
inspection and unchanged packet identities. Source closeout review is clean.

The conditional native Luna exercise ran on 2026-09-11 and returned INCOMPLETE.
Its first verification failed to start required subprocesses, and no independent
native reviewer was produced. The proposed implementation is preserved, but its
behavior and appearance are unverified. This continuation does not establish a
successful native creation workflow.

This continues the [frozen decision protocol](REQUALIFICATION_PROTOCOL.md) from
`e7b46121c2b8c335648a5ed5ce6a64d4875af535`. The earlier
[reviewer result](REVIEWER_RESULTS.md), candidate sources, receipts and images
remain unchanged. Unit 033/02a stays in progress; human acceptance and release
boundaries are unchanged.

## Role of the test app

The repaired application is a test fixture and an expected-correct comparison
case for the reviewer. Salt's own components, examples, patterns and design
guidance remain the authority. This small project-launch workflow does not define
Salt's overall visual style or certify arbitrary applications. “Verified test
app” is a clearer description of its role here than “reference app.”

The new copy uses the installed controlled `Collapsible`, `CollapsibleTrigger`
and `CollapsiblePanel` composition for disclosure, retaining the saved snapshot.
Independent task-role inspection also identified the confirmation-dialog initial
focus guidance; the Launch project button now receives initial focus. Primary
navigation continues to use `NavigationItem`. Form, state, routing, provider,
mode and density seams remain intact. These are supervised preparation repairs,
not an autonomous creation result.

## Retrieval correction and installed evidence

The existing search owner now rewards distinct query-term coverage in longer
queries so one incidental word repeated across an icon's identity fields cannot
dominate the whole task. Adjacent meaningful query words matching a multiword
record identity preserve explicit long icon requests. There is no query-specific
answer table, new corpus or model reranker.

The observed query, “application primary navigation current destination overview
team settings browser history,” now returns the service-worklist guide,
Navigation and Vertical navigation patterns, and their documentation pages as its
five results. Two natural longer paraphrases retain Navigation; explicit browser
and history icon queries, including long requests, retain the requested icon at
rank one. The concise “primary navigation browser history” still ranks three
icons first but includes NavigationItem and VerticalNavigation in its top five.
This is a bounded lexical improvement, not general semantic-ranking qualification.

All six installed context responses stayed below 16 KiB (6,545–10,754 bytes,
including the CLI newline). Following the returned NavigationItem owner resolves
`record:component:component.navigation-item#example/navigation-item.horizontalgroup`:
993 bytes of complete extracted source plus `data.tsx` (7,965 bytes) and
`MockHistory.tsx` (207 bytes), with no unresolved direct local imports. The
source and direct supports are available through JSON and Markdown. Their
readiness remains contextual and unvalidated, with no transitive closure claim.
These observed queries are development regressions, not a holdout.

## Verified case inputs

Three independent execution apps share the same final package cohort. The
navigation variant changes only the primary navigation component replacement;
the clipping variant changes only the saved-detail grid and wrapping rules.
The fourth packet uses the verified source and only one desktop image, explicitly
omitting mandatory runtime/project evidence. Each packet includes the original
starter, a relative change diff, observed imports/local documentation references,
and a read-only installed Salt lookup wrapper. Gold labels and prior outcomes
are not supplied to reviewers.

| Prepared case          | Local project and original behavior evidence | Additional evidence                                                            | Scored review    |
| ---------------------- | -------------------------------------------- | ------------------------------------------------------------------------------ | ---------------- |
| Verified test app      | Typecheck/build and original journey passed  | Focus, keyboard containment, ordinary/long-value readability passed; 12 images | REVIEW PASS      |
| Navigation replacement | Typecheck/build and original journey passed  | Same focus/readability checks passed; 12 images                                | CHANGES REQUIRED |
| Clipped saved values   | Typecheck/build and original journey passed  | Actual readability failure at 320 pixels; 11 images                            | CHANGES REQUIRED |
| Missing evidence       | Not supplied to reviewer                     | One desktop image only                                                         | INCOMPLETE       |

The clipping case fails because the full `planner@example.com` Range extends to
x=311.33 while its clipping ancestor ends at x=283. Its screenshot visibly loses
the email ending. This failed result is supplied truthfully alongside the passing
original behavior receipt; its review assessed combined evidence, not
unaided visual defect detection.

The final verified app's 12 screenshots were inspected directly. Their bytes
match the inspected previous preparation capture after the final own-element
clipping assertion was added. They cover desktop/320, light/dark, density,
ordinary values, and long values before/after native vertical scrolling. Browser
runs reported zero runtime errors and zero external requests. Receipts bind the
source, complete build inputs, dependency tree, compiled output, and actual
acceptance definitions. The local freeze also binds copied packet build inputs,
images, profile, prompt and settings; packet layout is explicitly distinguished
from the original execution tree.

## Preparation corrections and negative checks

The original project-launch acceptance definition remains unchanged. The new
supplement was corrected before any scored output, and every prior preparation
stage remains preserved:

- A Tab assertion initially observed Floating UI's external focus guard during
  its wrap operation. Direct browser diagnosis showed settled focus cycling
  through Show review details, Cancel and Launch project. The assertion now
  waits for the settled result and still requires containment.
- The first long-email assertion required simultaneous visibility of the entire
  disclosure. Actual keyboard and wheel inspection established the supported
  DialogContent vertical-scroll behavior. The supplement now checks horizontal
  bounds before scrolling, performs a real wheel gesture when needed, captures
  the revealed value, and checks every horizontal and vertical bound afterward.
- Source review found that an existing artifact directory could be overwritten.
  The checker now creates a fresh stage exclusively. An actual reused-stage
  attempt was rejected with `EEXIST`; its complete evidence digest was identical
  before and after.
- Source review found that clipping applied directly to the saved-value element
  was omitted. The walk now includes that element. A separate unscored desktop
  variant with a 20-pixel, nonwrapping, hidden-overflow `dd` passed the original
  behavior check and was rejected at that `dd` by the new readability check.

Both source-review findings were accepted as small fixes in the same checker
owner. No app source was changed to bypass the timing or scrolling assertions.
These named machine checks complement actual image inspection; they are not a
general CSS/design oracle or a substitute for the outstanding human reviews.

## Identities and checks

| Artifact                           | SHA-256                                                            |
| ---------------------------------- | ------------------------------------------------------------------ |
| Final Knowledge bundle             | `ddad76b443f050119a40f9999f3802206b3e87fcb7e6ce2a5a69cf0d776b8cbf` |
| Final pack report                  | `f068445da7e5f4d99dab64685ed06b03792b366abeb4fc0cc3612e65f6525795` |
| Knowledge tarball                  | `8badaae7089b7191767a62f56ca91d513d21665e1bdb88223bda89635ed64813` |
| CLI tarball                        | `88209228e15a0aa558ca4466b7191d24390945b833cb2f825dae990a2ac78b6e` |
| Complete installed dependency tree | `80734f755b9d8c3590d51d8e824b3e6d4578b52266aee12be322af5bd35da525` |
| Verified app source                | `9959ed20bc0841b1ac1cf416dbce6f70c3b87d1ae2dc0d419084faceb38a2d15` |
| Navigation variant source          | `8ec38256c19df4bfa71bd45c0aafaa4fbe38dcdb5f7a21968737eb697a7bd0a4` |
| Clipping variant source            | `c1404c465ece71a60e38d37013550c6378f9c3aa3c1d9b938117d949a9682439` |
| Original acceptance definition     | `4109ec2178e48e54de603b04197a7a339af111b60cd489ac95bb971717fe6a15` |
| Final supplement definition        | `2aa0b39b5d8bc3062217476fcff3cec1a44a0fdfcc818daf9a7f1d6a6b0060ca` |

Completed checks:

- Knowledge/CLI: 758 tests in 59 files; tooling types and final build passed.
- Final local pack validation passed; seven verified local Salt tarballs were
  installed offline into the new fixture, preserving its manifest and lockfile.
- Public docs/examples: 402 MDX files, 13 package presentations, 24 public pattern
  pages/examples and one extracted workflow recipe passed.
- Current plan, 13-family/13-outcome contracts, and changed-file quality passed.
- Actual installed navigation retrieval and full example resolution passed.
- All three case typechecks and original browser journeys passed; final
  supplement passed the reference/navigation cases and rejected the clipping case.
- The reused-stage and direct-element-clipping negatives were rejected.

The source-review command is the installed autoreview helper with
`--mode local --engine codex --model gpt-5.6-sol --thinking high
--codex-speed fast --no-web-search --prompt-file
 dist/salt-ui-requalification/review-scope.md`, invoked through `python -X utf8`.
Two completed runs found the two accepted issues above. The final confirmation
command was rejected by automatic approval review twice, including after local
inspection confirmed the installed OpenAI Codex executable, isolated read-only
review workspace and intended changed-file scope. The stated remaining reason
was absence of a trusted user message specifically approving export of this
repository-derived payload to that destination. No workaround or alternative
review engine was used. The user then explicitly approved the same material and
destination. The resumed source review found no further code defect and identified
the stale approval status in this report and tracker. That in-scope documentation
finding was corrected. The final helper run, `autoreview-final-3`, exited 0 with
no accepted/actionable findings. No further code change was needed.

## Qualification outcome and limits

All four fresh native Codex Salt reviewer sessions used GPT-5.6 Sol, medium
effort, no inherited conversation and the same frozen neutral request. Each
finished within its five-minute limit. There were no scored retries, coaching
messages or changes to the cases, prompt, role, package cohort or scoring.
All supplied images were actually displayed: 12, 12, 11 and one respectively.
Observed retrieval used the prepared local info/context/docs wrapper, including
relevant component records and compound examples. No cross-case or prior-result
reads, source mutations, builds, installations, network calls or further
reviewer delegation were observed.

The navigation reviewer tied the generic anchors to the missing visible current
destination, established NavigationItem and its active-state coverage, and cited
local guidance against rebuilding navigation from raw elements. It offered a
visible-state correction or NavigationItem. This meets the frozen actionable
navigation-defect criterion; it does not prove rejection of every custom
navigation implementation. The clipping reviewer independently cited the source,
actual truncated-email images and failed supplement, despite the original
behavior receipt passing. The incomplete case explicitly withheld approval for
missing runtime/project proof. The positive review reported no unknown defect.

The post-run identity check matched every packet, original execution source,
build input, dependency tree, compiled output, receipt, screenshot, role, prompt
and frozen definition to its pre-run record. The protocol hash is
`4bd2ede385360452a4d0494ff2d0203cd66fa3d2b31b48340335d9aabf9a3a8b`;
the common prompt hash is
`df3e8406e47fca891cad833ef128075e21b5c9a28150eae2a3eb5943f62a1b6d`.
Initial answers, execution metadata and full identities are retained outside Git
under the ignored requalification artifacts. Per-agent token/credit usage was
not supplied by this interface; no cost comparison is made.

This small diagnostic qualifies Sol only for the planned fresh exercise. It
establishes no general reliability, model superiority, unattended-success claim,
workflow promotion or release authority. Human design/accessibility reviews and
the maintainer exercise remain outstanding.

## Conditional fresh modification

The user explicitly approved this conditional exercise and its model payload
through the existing OpenAI Codex account after the earlier approval-system
pause. The [new task](LAUNCH_SCOPE_TASK.md) adds Pilot/Full rollout draft, saved
and launched scope state to a separate copy of the verified application. The
creator will select the Salt implementation from local guidance, with independent
Sol review and at most two source repair cycles. No lead application source edits
or Salt component choices were supplied during the exercise.

The independent checker composes the unchanged original and requalification
checks. It covers mutually exclusive keyboard selection, navigation persistence,
invalid-save retention, saved review versus unsaved draft, launching the saved
scope while the draft differs, later save/cancel/Escape retention, replacement
without duplicate status, and desktop/320 light/dark/high-density states. Actual
state-labelled images and an independent review remain required alongside the
machine assertions.

Source review accepted four bounded proof gaps before creator output: checking
both radios after selection, checking Overview's launch status after each launch,
launching while saved and draft scopes differ, and checking both choice labels
for readability when Full rollout is selected. Each correction remained within
the same task/checker owner. After two patch cycles the remaining label-readability
finding was reclassified as an unchanged explicit task requirement; two existing
readability calls closed it. No new application or protocol contract was added.

The latest preserved baseline stage, `baseline-visible-selection-checked`,
passed the unchanged requalification journey and actual typecheck. It failed the
new check solely because the unmodified baseline has no Pilot radio, with the
failure image, source snapshot, diff and receipts retained. Baseline source and
dependency identities remain the values listed above. The task SHA-256 is
`eedc00be383e5285e2da21a896f1a3daa3992e6770c61e97136f44490c0e052f`;
the current checker SHA-256 is
`7146f65ee46f8166ab4f390bd26af77e792e744e344ceb4b2cb8e4111a780525`.
Earlier preparation failures and every source-review output remain preserved.
This missing-feature negative does not establish a successful implementation.

The final source-confirmation command used the same helper/model/settings stated
above with `--prompt-file dist/salt-ui-requalification/launch-scope-review-scope.md`
and output `launch-scope-autoreview-final-3`. Automatic approval review rejected
its earlier attempts before execution, including the justification quoting the
prior approval. On 2026-09-11 the user explicitly restated the exact Salt repair
diff, test-case source and screenshots payload and OpenAI existing-account
destination. The same command then executed and exited 0 with no actionable
findings. No alternative engine or indirect execution was used. No versioned
implementation or checker change followed the clean review.

## Fresh native exercise outcome

The task, checker, existing checks, role settings, prompt, wrapper, baseline and
complete package cohort were frozen before the creator started. The native Salt
creator used GPT-5.6 Luna, medium effort and no inherited conversation. Its run
lasted about seven minutes, including the continuation to resolve the unfinished
review step. The intended independent reviewer was Sol, medium effort, no
inherited conversation and at most eight minutes per stage, with two source
repair cycles available.

The creator retrieved local RadioButton and FormField records. Its handoff cited
`record:component:component.radio-button#example/radio-button.withformfield`;
no separate request resolving that full example source was observed. It then
modified only `src/App.tsx` in the temporary application. The
proposal uses RadioButtonGroup/RadioButton with a FormField label and extends the
existing draft, saved snapshot and launched state. Source and a change diff
were preserved; this describes the proposal, not verified application behavior.

The file-editing helper failed with a sandbox-helper error, followed by shell
patch-format failures. The supervisor gave one operational clarification allowing
native PowerShell writes to the already-authorized source files. It supplied no
source code, component choice or application repair. This assistance is part of
the run record; the exercise is not presented as unattended operation.

| Evidence or action                | Actual outcome                                                                                                  |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Initial verification invocation   | Run exactly once with the default sandbox; required subprocesses failed before browser acceptance               |
| Frozen acceptance receipt         | FAILED; prerequisite receipt absent, no viewport observations or screenshots                                    |
| Bound typecheck and stage receipt | Typecheck could not spawn (`EPERM`); final stage-run receipt was not produced                                   |
| Separate typecheck                | Creator reported a pass; visible compiler output had no diagnostic, but no structured exit receipt was exported |
| Independent native review         | INCOMPLETE; creator reported no callable host-native subagent capability and no reviewer was spawned            |
| Source repairs                    | Zero; source edits stopped after the initial verification                                                       |

Preparation baseline verification had used approved escalated subprocess
execution; the creator invoked verification in the default sandbox. Its failed
run reported an unchanged-check assertion and `spawn EPERM`. The source was
not rerun under a different execution mode to turn this attempt into a pass.
The supervisor asked the same creator to finish the pending native-review step
or explicitly report capability unavailability; the creator reported INCOMPLETE
without source changes, another check run or substituted self-review. No lead
reviewer delegation was substituted for the required creator-owned delegation.

The final identity audit matched every frozen file, the dependency tree,
immutable application inputs and baseline. Current proposed source exactly
matches the preserved initial snapshot:
`79f5f9e8e6aea249eb6442126a171b10b75e7ff447e4dbbc56486ec1f1e76476`.
Only App.tsx differs from the baseline. The compiled directory remains the
baseline output `686a32c6463874ebe70893f70e57c8ac3c175b520c2879fd177e0f21cc83f2d8`;
it is not a build or preview of the proposed feature. The audit correctly
withholds a success claim for missing project, browser and independent-review
evidence. Initial answers, the capability report, handoff, failed receipts and
all source identities remain outside Git. Per-agent usage was not supplied, so
there is no cost comparison.

The four-case reviewer qualification remains valid for its recorded diagnostic.
The native creation workflow remains unproved: this attempt encountered execution
and delegation limits before it could establish Salt UI correctness. A future
attempt should first pass an unscored check of the actual creator role's native
reviewer delegation and authorized subprocess path, then use a fresh frozen case.
No additional case, supervised application repair, publication or promotion was
performed. Human design/accessibility reviews and the maintainer exercise remain
outstanding under Unit 033/02a.
