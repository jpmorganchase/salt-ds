# Salt AI platform implementation plans

Generated with the `improve` planning workflow on 2026-08-26. These plans are
implementation handoffs, not production code. Execute them in dependency order,
read each plan completely before starting, honor every STOP condition, and
update the status row when work changes state.

`Planned at` SHAs in plan headers record the audit baseline only. They are never
execution-unit drift checkpoints. After this complete plan set lands on the
default branch, a plan-control-only commit must replace Plan 001 Unit 00a's
placeholder with the latest default-branch SHA containing all three plan files.
Until that concrete SHA is present, Unit 00a must STOP; this prevents the initial
plan additions from appearing as implementation drift.

## Execution order and status

| Plan                                                 | Title                                                                                                           | Priority | Effort         | Depends on   | Status                                                                 |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------- | -------------- | ------------ | ---------------------------------------------------------------------- |
| [001](./001-build-salt-ai-knowledge-platform.md)     | Build the versioned Salt AI knowledge platform, CLI scanner, docs channels, samples, and optional MCP           | P1       | L, multi-phase | —            | IN PROGRESS                                                            |
| [002](./002-add-secure-historical-salt-knowledge.md) | Add secure historical Salt knowledge resolution only after current GA, public discovery, and ownership approval | P2       | L, conditional | Plan 001 09c | DEFERRED — post-09c mandate, candidate vector, and owners not approved |

Status values: `TODO`, `IN PROGRESS`, `IN PROGRESS — <pending gate>`, `DONE`, `BLOCKED — <reason>`,
`DEFERRED`, `DEFERRED — <reason>`, `REJECTED — <reason>`, and
`STALE — <reason>`.

### Machine-readable evidence index

The tables below state required evidence kinds; prose cells are not locators.
On every evidence-bearing plan-control update, atomically replace the row's
single current token (never append a second token) in this closed form:
`evidence-index=plans/evidence/<plan-id>/<unit-id>.json@sha256:<64-lowercase-hex>`.
The referenced tracked JSON validates against
`saltPlanEvidenceIndexV1` and contains `plan_id`, `unit_id`, tracker status,
`completion_sha`, and path-sorted entries with unique `(kind, sha256)` identity,
schema ID/version,
content-addressed immutable locator, SHA-256, source/completion SHA, workflow/
environment class, retention expiry, parent digests, and `active | superseded |
  retired`
state. The index keeps append-only entry history and Git history preserves prior
index revisions; the row token always selects the current index bytes. A
superseded entry names exactly one immediate successor digest, whether that
successor is active or later superseded; chains are acyclic, stay within one
kind, and terminate at exactly one active entry. Multiple historical entries
per kind are valid, but every required kind has exactly one active terminal.
Supersession normally stays within one plan/unit index. The only cross-kind
lifecycle edge is a registered premerge→landed evidence pair. A `retired`
entry must have `evidence_phase: premerge`, be immutable and valid, and name
one exact `retired_by` landed plan/unit/kind/digest whose receipt binds the
premerge digest and proves the normalized payload/bytes required by that pair.
Retired entries are never acquirable or active parents; their paired landed
kind becomes the publisher-facing required kind. `retire:salt-ai:premerge-
  evidence` is the sole index mutation for this edge and atomically validates
both schemas/digests, the registered pair, landed completion SHA, and absence
of dependants before changing state. Cross-kind retirement does not create a
supersession chain and is forbidden for every non-premerge kind. The four reserved
`current-*` authority kinds may cross plan/unit boundaries only when the
successor tuple names the exact plan, unit, kind, and digest. Every authority-
set transition is atomic: changed entries move to their exact successors while
unchanged entries are revalidated byte-for-byte and remain active in the same
four-entry set. No reader may observe a mixed set.
Every active entry
and its transitive active-parent closure must be unexpired. A superseded entry
whose retention elapsed remains audit-only and non-acquirable, or may name a
renewed immutable-archive successor; its expiry does not invalidate unrelated
active evidence. Cycles, multiple active entries of one kind, dangling active
parents, mutable/latest locators, expired active selection/parent closure,
digest reuse with different bytes, and row/index SHA or unit mismatch fail
validation. Acquisition follows and verifies the complete immediate-successor
chain. Historical entries remain append-only. Fixtures cover A→B→C
supersession, the exact
expiry instant, one tick before/after, expired superseded history, renewed
archives, and clock rollback.

Retention renewal is append-only and does not rewrite an evidence entry. The
index may contain `saltEvidenceArchiveRenewalReceiptV1` records keyed by the
exact underlying artifact SHA-256; each names the previous locator/renewal,
new content-addressed no-overwrite locator, byte-for-byte readback digest,
workflow/environment, renewed expiry, and owner. Acquisition treats an entry as
retained only when either its original locator or a complete acyclic renewal
chain is unexpired and resolves to the same bytes/schema. A renewal cannot
change the receipt digest, kind, source/completion SHA, parents, active state, or
four-entry authority membership. Current-authority retention updates validate
all four entries and their active parent closure atomically; partial renewal,
same digest with different bytes, shorter expiry, or post-expiry repair fails.

`completion_sha` is normally the already-known merged implementation/version/
protected-transition ref being evidenced, never the plan-control commit that
writes the index; no field predicts or hashes its own commit. While a row is
`IN PROGRESS`, `completion_sha: null` is allowed only for immutable premerge or
intermediate evidence with a non-null exact `source_sha`. Those entries cannot
complete the unit. A premerge-only entry must be atomically retired through its
registered premerge→landed kind pair (or superseded when the kind is identical);
other intermediate evidence must be superseded by same-kind protected evidence. `DONE`
requires non-null `completion_sha`, no active premerge-only kind, and a complete
active parent closure.

`acquire:salt-ai:evidence` and `acquire:salt-ai-history-evidence` parse only that
token and index—never the human evidence prose. The generic command selects by
the closed `(plan_id, unit_id, kind)` tuple; omitted `--plan` is an exact alias
for Plan 001 only, and every Plan 002 generic lookup passes `--plan 002`. The
generic command may instead consume a reviewed schema-valid named selector only
when it contains that same exact tuple and digest; `latest`/stage-only aliases
are invalid. The
history command is Plan-002-only and requires its closed `--unit`/`--kind`.
Either form must resolve exactly one active entry; retired premerge evidence is
available only as the exact parent embedded in its landed rebind receipt.
`acquire:salt-ai:release-receipt` instead requires either direct exact
plan/unit/kind/stage/state/cohort/digest fields or a schema-valid reviewed
selector containing all of them; stage/state, “current,” or “latest” alone are
invalid. It resolves the same one active index entry and proves selector/index/
receipt equality. Plan 001 Unit 00a introduces the schema, fixture indexes, parser,
and `validate:salt-ai:tracker`; every plan-control update and successor drift
check runs it. The README digest commits the index, while the index commits the
remote evidence; neither may point to a branch-latest artifact.

The one narrow dynamic exception is `acquire:salt-ai:current-authority`, added
in Plan 001 Unit 09c and reused by later maintenance. It reads the tracker
token's exact evidence-index digest, requires exactly one unexpired, internally
consistent set of the four reserved `current-*` kinds, downloads and validates
all four immutable receipts as one transaction, then emits a selector receipt
containing their exact tuples/digests and the index digest. It makes no external
mutation, exposes no partial output, and every publisher must pin this selector
receipt before staging; drift at lock acquisition aborts. No other command may
interpret “current” as a name-only selector.

### Plan 001 execution-unit tracker

After each ordinary-unit merge whose gates are complete, the merge operator or
automation lands a plan-control-only update: mark the unit `DONE`, record its
completion SHA, and set each newly
eligible successor checkpoint to the latest default-branch commit containing
all dependency SHAs. The same update records each schema ID, receipt SHA-256,
predecessor/input digest, immutable run/artifact locator, and pack-report digest
required below; a workflow URL or prose claim is insufficient. An
implementation PR never guesses its own merge SHA and no successor starts
before this update lands.

| Unit | Outcome                                                             | Depends on | Status                                | Drift checkpoint         | Completion SHA | Gate evidence required on completion                                                                                                                                                                                                                                                                                                              |
| ---- | ------------------------------------------------------------------- | ---------- | ------------------------------------- | ------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 00a  | Publication fence, package namespaces, ordinary baseline            | —          | IN PROGRESS                           | 61287edaf8bf6d853f0a52630f0f0849bd651e74 | —              | embargo/workflow-policy receipts, package-namespace control receipt, ordinary-baseline schema/receipt/artifact digests                                                                                                                                                                                                                            |
| 00b  | Contracts, source identities, owners, and evaluation baselines      | 00a        | TODO                                  | set after 00a            | —              | ADR/owner approval, contract/inventory schemas, tracker pair registry, deterministic baseline/report digests                                                                                                                                                                                                                                      |
| 01   | Pure seams and semantic characterization of the prototype           | 00b        | TODO                                  | set after 00b            | —              | normalized characterization receipt digest and immutable locator                                                                                                                                                                                                                                                                                  |
| 02   | Knowledge extraction behind a temporary internal baseline           | 01         | TODO                                  | set after 01             | —              | `extraction-parity@1` pack-report and semantic-comparison receipt digests                                                                                                                                                                                                                                                                         |
| 03   | Clean Knowledge v1 manifest, records, and pre-agent pack report     | 02         | TODO                                  | set after 02             | —              | `pre-agent-support@1` pack-report and smoke receipt digests                                                                                                                                                                                                                                                                                       |
| 04a  | CLI shell, packed aliases, and version-aware `info`                 | 03         | TODO                                  | set after 03             | —              | knowledge/CLI pack plus installed alias/info/offline smoke receipt digests                                                                                                                                                                                                                                                                        |
| 04b  | Bounded config and workspace-aware discovery                        | 04a        | TODO                                  | set after 04a            | —              | discovery/config pack, containment, limits, and per-workspace vector receipt digests                                                                                                                                                                                                                                                              |
| 04c  | Isolated analyzer, scan renderers, and full fixture matrix          | 04b        | TODO                                  | set after 04b            | —              | scan pack/smoke plus isolation, renderer, coverage, platform, and exit-contract receipt digests                                                                                                                                                                                                                                                   |
| 05   | CLI retrieval and non-promotable `R1_PRE_AGENT` receipt             | 04c        | TODO                                  | set after 04c            | —              | cohort schema ID, receipt/pack digests, immutable locator, and source SHA                                                                                                                                                                                                                                                                         |
| 06a  | Example/story contracts, migration baseline, docs verifier          | 05         | TODO                                  | set after 05             | —              | 24-pattern/eight-story inventory, migration schema, receipt/pack digests, predecessor locator                                                                                                                                                                                                                                                     |
| 06b  | Pattern batch A plus package/identity parity receipt                | 06a        | TODO                                  | set after 06a            | —              | migration schema ID, receipt/pack digests, 06a predecessor digest, immutable locator                                                                                                                                                                                                                                                              |
| 06c  | Pattern batch B, cumulative parity, story-input retirement          | 06b        | TODO                                  | set after 06b            | —              | migration schema ID, receipt/pack digests, 06b predecessor digest, immutable locator                                                                                                                                                                                                                                                              |
| 06d  | Web/Markdown/llms/docs/Skill/AGENTS and pack policy                 | 06c        | TODO                                  | set after 06c            | —              | nonpublishable `release-complete@1` pack, `public-docs-preview-receipt`, provisional public-package-doc inventory/seal, web-route, Skill/AGENTS parity, and smoke digests                                                                                                                                                                         |
| 06e  | Vite starter with full Salt candidate cohort                        | 06d        | TODO                                  | set after 06d            | —              | rebuilt full first-party cohort and Vite app receipt digests                                                                                                                                                                                                                                                                                      |
| 06f  | Next App Router starter with full Salt candidate cohort             | 06e        | TODO                                  | set after 06e            | —              | rebuilt full first-party cohort and Next app receipt digests                                                                                                                                                                                                                                                                                      |
| 06g  | Operations dashboard and full G4 integration gate                   | 06f        | TODO                                  | set after 06f            | —              | full three-app/cohort, pack, smoke, site, and web receipt digests                                                                                                                                                                                                                                                                                 |
| 07   | Current-spec MCP candidate and provisional ship/omit recommendation | 06g        | TODO                                  | set after 06g            | —              | candidate/provisional-graph pack, host/security/eval digests, and candidate-disposition receipt                                                                                                                                                                                                                                                   |
| 08a  | Selected graph, release-plan partition, and packed cohort           | 07         | TODO                                  | set after 07             | —              | cumulative package-version-intent, Unit-07-bound planned partition, pack/smoke, and partition-schema test receipt digests                                                                                                                                                                                                                         |
| 08b  | Sole protected publisher, receipt chains, and snapshot drill        | 08a        | TODO                                  | set after 08a            | —              | workflow-policy/fake-provider receipts plus snapshot-applied partition and CI candidate digests                                                                                                                                                                                                                                                   |
| 08c  | Final-version MCP decision, ordinary release, and protected R2      | 08b        | TODO                                  | set after 08b            | —              | active/final version intent and planned/landed-applied partition; optional omit-replan authorization; landed selected-graph rebind, final MCP/public-doc/effective package-doc, package-namespace release, pack/app/web and complete premerge retirement; ordinary dependency request, baseline, final and normalized evidence; R2/drill receipts |
| 09a  | Controlled selected-mode evaluation and GA decision                 | 08c        | TODO                                  | set after 08c            | —              | exact Unit-08c R2/drill selector plus complete eval, report, gate, and immutable cohort digests                                                                                                                                                                                                                                                   |
| 09b  | CAS-only R3 and initial four-entry current authority                | 09a        | TODO                                  | set after 09a            | —              | tracker-acquired evaluation/R2/drill parents, verified R3 final receipt, atomic `current-r3-final-receipt`/MCP/graph/docs authority set, and post-R3 `pre-navigation-negative-crawl-receipt`                                                                                                                                                      |
| 09c  | Post-R3 navigation, normal docs deployment, and live crawl          | 09b        | TODO                                  | set after 09b            | —              | exact-R3-bound navigation projection, immutable site artifact, normal docs deployment, live readback/crawl, and `discovery-deployment-final-receipt` digests                                                                                                                                                                                      |

Ordinary units become `DONE` only after merge plus the evidence-bearing
plan-control update. Unit 08c instead remains `IN PROGRESS — protected R2
pending` after its implementation/version work and becomes `DONE` only after
the immutable Unit-08a intent/partition audit parents, their Unit-08c
release-authority replacements, and any same-kind Unit-08c replacement chain
(plus the distinct omit-replan authorization and terminal graph audit parent
when used), landed selected-graph rebind, final MCP/effective graph/effective
public-doc, package-doc, package-namespace release, complete premerge retirement,
ordinary dependency request/baseline/final/normalized evidence, and
R2 `final`/protected-drill receipts are recorded. Unit 09a becomes `DONE` only
after the controlled evaluation/gate receipts are recorded. Unit 09b remains
`IN PROGRESS — protected R3 pending` until the exact-R2-parented, immediately
reverified R3 `final` receipt and atomic four-entry current authority are
recorded, then remains `IN PROGRESS — negative crawl pending` until the
tracker-bound post-R3 crawl proves launch navigation is absent. Unit 09c
remains `IN PROGRESS — discovery pending` after its bounded
navigation PR until the normal docs deployment and live readback/crawl receipt
are tracker-bound. Therefore 09a cannot start before R2 exists, and Plan 002
cannot start before 09c is `DONE`.

### Plan 002 execution-unit tracker (deferred)

These rows reserve dependencies only; they do not authorize work. After Plan
001/09c is `DONE`, the live authority is proven to descend from Plan 001/09b's
R3 activation, and all Plan 002 Unit 00 entry gates are approved, a plan-control-only
update changes Plan 002/Unit 00 to `TODO` and replaces its placeholder with the
latest default-branch commit containing Plan 001/09c, that live authority, and
those approvals.
After each Plan 002 merge or protected post-merge transition, the plan-control
update records the actual schema-valid receipt/artifact digests in `Gate
evidence`; a prose claim or workflow URL without immutable digests does not
satisfy a successor dependency. Unit 04/05 special completion rules appear
below the table.

| Unit | Outcome                                                            | Depends on                                                                     | Status                        | Drift checkpoint                            | Completion SHA | Gate evidence required on completion                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ---- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ----------------------------- | ------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 00   | Compare packaged/local/remote/reject paths and record decision     | Plan 001 09c + live authority descended from Plan 001 R3 + Unit 00 entry gates | DEFERRED — entry gates absent | set after 09c, live authority, and approval | —              | exact current release/MCP/effective-graph/package-doc selectors, initial-R3 ancestry and decision-baseline authority-rebase receipt, plus ADR/approval and immutable historical-distribution decision receipt                                                                                                                                                                                                                                                                                                                                          |
| 01   | Remote-TUF only: reproducible bundle and capability registry       | 00 records `remote-tuf`                                                        | DEFERRED                      | set after 00                                | —              | atomic live current-authority selector, accepted authority-rebase, source/generation/candidate, selected-graph pack, and version-intent digests                                                                                                                                                                                                                                                                                                                                                                                                        |
| 02   | Remote-TUF only: metadata, trust state, and cache internals        | 01                                                                             | DEFERRED                      | set after 01                                | —              | atomic live selector, accepted authority-rebase, hostile trust/cache, selected-graph pack, and version-intent digests                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 03   | Remote-TUF only: explicit trust/sync/pin and offline resolver      | 02                                                                             | DEFERRED                      | set after 02                                | —              | atomic live selector, accepted authority-rebase, packed offline-command, selected-graph pack, and version-intent digests                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 04   | Freeze descriptor/docs/web and publish one historical R2 beta      | 03 + remote origin/signing approval only when selected                         | DEFERRED                      | set after 03 and applicable approval        | —              | live selector and active-plan rebase; release-authority baseline; activation-tooling-ready; same-kind active freeze lease; package-namespace release; cumulative intent/version plan/planned+landed-applied partition; historical version/effective graph/successor MCP; complete 11-pair retirement; descriptor and mapping rebinds, projection/effective docs, pack/web; ordinary request/baseline/final/evidence; package/target/mapping readbacks and R2/drill receipts                                                                            |
| 05   | Pilot exact R2 bytes, activate one-vector R3, and launch discovery | 04 + every activation gate                                                     | DEFERRED                      | set after 04 and gate ratification          | —              | live selector, release baseline, tooling-ready and active lease; acquired R2/drill/graph/MCP/descriptor/projection/docs/web/target/mapping parents; post-R2 fixture checkpoint, protected pilot/drill/eval/gates and maintenance rehearsals; pending metadata, activation commit, higher active-support attestation, successful R3 final; same-kind consumed lease, coordinator transition, authority-commit and atomic successor current authority; post-R3 negative crawl; navigation premerge/landed retirement, deployment and live-crawl receipts |

Plan 002 Unit 04 stays `IN PROGRESS — version/R2 pending` after its
implementation merge. An interim plan-control update may record the immutable
version-plan receipt without setting a completion SHA or dispatching Unit 05;
`DONE` requires the live selector/active-plan rebase, frozen release-authority
baseline, activation-tooling-ready receipt, active same-kind freeze lease,
package-namespace release, cumulative intent/version-plan/final historical-
version-applied ref, successor effective graph/MCP-or-absence, all eleven landed
rebind/retirement pairs, ordinary dependency/baseline/final/normalized evidence, descriptor/mapping
rebinds and projected docs/web, package/target/mapping readbacks, and protected
historical R2 final/drill receipts. The lease is opened only after all
noncredentialed Unit 05 code readiness passes and the selected ordinary branch's
final receipt is tracker-bound, keeping ordinary publication and queue time
outside the authority fence.

Unit 05 stays `IN PROGRESS — protected activation pending` while its bounded
post-R2 fixture checkpoint is tracker-bound and its protected pilot, drills,
evaluation, activation gate, and both maintenance rehearsals run. A successful transition must record the pending
metadata generation, activation commit, strictly higher active-support
attestation/readback, historical-R3 final receipt, same-kind consumed lease,
coordinator transition, and authority-commit. One plan-control transaction then
mirrors the coordinator by installing the four-entry successor authority and
consumed lease. That is the official-support boundary and moves the unit to `IN
PROGRESS — negative crawl pending`; failed/compensated attempt receipts never
do. The post-R3 pre-navigation crawl then moves it to discovery work.
Only the permanent-R3-bound historical navigation, premerge→landed retirement,
normal docs deployment, and live-crawl final receipt make Unit 05 `DONE` and
permit the broader launch announcement. Later production maintenance may
supersede only the current-release entry while revalidating the other three and
must preserve the active support state, activation ID, and activation-commit
digest (or explicitly forward-revoke support).

## Dependency notes

- Plan 001 is a program plan. Its execution units are ordered inside the file
  and must land as separate, reviewable pull requests. Do not implement the
  whole program as one change.
- Plan 002 is intentionally deferred and is not part of Plan 001's GA path. It
  cannot begin until Plan 001/09c is `DONE`, the live authority is proven to
  descend from Plan 001/09b's R3 activation, and every Plan 002 Unit 00 entry
  gate has named approval. Its activation gates are deliberately produced and
  ratified during Units 00, 01, and 04; all must pass before Unit 05.
- `advisor-plans/` contains historical MCP work and blocked experiments. It is
  evidence, not a dependency queue for Plan 001, and must not be edited while
  executing this plan.

## Findings considered and rejected

- Expand `salt-mcp` into the umbrella CLI: rejected because transport and host
  lifecycle do not belong in the general consumer command boundary. The current
  MCP is unreleased and creates no compatibility reason to preserve its shape.
- Publish separate generated knowledge copies inside CLI and MCP: rejected
  because it creates identity drift and repeats a large-bundle duplication
  failure already visible in repository history.
- Make Storybook a consumer prerequisite: rejected. Storybook remains a
  maintainer authoring, visual-QA, and Chromatic surface only.
- Use embeddings or a vector database as the canonical corpus: rejected. They
  are vendor/model-specific derived caches and cannot provide the immutable
  portable source of truth.
- Publish MCP by default or preserve its prototype contract: rejected. Unit 07
  replaces the unreleased prototype freely and recommends a clean current-spec
  candidate; Unit 08c publishes it only when final-version outcome/security
  evidence confirms `ship`. `omit` needs no migration or deprecation.
- Fold historical download/cache/index work into current GA: rejected. It has a
  separate deferred security plan and cannot delay the offline current bundle.
- Jump directly to TUF for historical data: rejected. Plan 002 first compares a
  package-embedded immutable map, explicit local bundle+digest, remote TUF, and
  no product; the remote trust boundary must prove why simpler paths fail.
- Keep legacy or PR-head publication beside a new protected workflow: rejected.
  Plan 001 requires one provenance-verifying, globally serialized promotion
  authority with guarded npm/web rollback.
- Auto-install a Skill, mutate `AGENTS.md`, or add Shadscan-style browser/URL
  checks in scanner v1: rejected. Distribution is manifest-bound/manual and
  ordinary scan remains source-only, offline, and non-mutating.
- Hand-author `llms.txt` or publish `llms-full.txt`: rejected. Small bounded
  `llms.txt` indexes and deterministic `.md` alternates are worthwhile as cheap
  generated web discovery, but are noncanonical and never duplicate the corpus.
- Preserve Catalog-v2 or prototype MCP resource identities in the public
  Knowledge v1 contract: rejected because neither shipped; normalized semantic
  characterization is the only extraction oracle.
- Add GitHub issue templates, labels, or issue-based support automation:
  rejected because support tracking is moving elsewhere. Plans use
  channel-neutral finding and tracking references; the credentialed
  `issue_comment` publisher is removed solely as a release-security fix.
