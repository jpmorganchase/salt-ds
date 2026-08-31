# Salt AI platform implementation plans

Generated with the `improve` planning workflow on 2026-08-26. These plans are
implementation handoffs, not production code. Execute them in dependency order,
read each plan completely before starting, honor every STOP condition, and
update the status row when work changes state.

`Planned at` SHAs in plan headers record the audit baseline only. They are never
execution-unit drift checkpoints. After a tracked plan-control change lands, a
plan-control-only commit must record the concrete checkpoint for the one active
unit. Plan 001's historical tracker keeps its original evidence semantics;
Plan 004 uses the separate active-dispatch block below and must not add rows that
the current tracker parser would misclassify as Plan 001.
The historical Unit 00a checkpoint rule is retained only as Plan 001 evidence;
it does not dispatch or block Plan 004.

## Execution order and status

| Plan                                                 | Title                                                                                                           | Priority | Effort         | Depends on          | Status                                                        |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------- | -------------- | ------------------- | ------------------------------------------------------------- |
| [001](./001-build-salt-ai-knowledge-platform.md)     | Build the original local Salt AI release candidate and record Unit 07 evidence                                  | P1       | L, multi-phase | —                   | DONE — historical local candidate complete through Unit 07    |
| [004](./004-validate-salt-ai-product-wedge.md)       | Validate a truthful, exact-current, task-ready Salt AI product wedge before hardening or release                | P0       | L, multi-phase | Plan 001 Unit 07    | IN PROGRESS — Unit 004/03 offline opportunity protocol        |
| [003](./003-publish-salt-ai-release-candidate.md)    | Materialize versions and publish an approved Salt AI release candidate through separately owned release systems | P2       | L, conditional | Plan 004 final PASS | DEFERRED — Plan 004 PASS and publication authority are absent |
| [002](./002-add-secure-historical-salt-knowledge.md) | Add secure historical Salt knowledge resolution only after current GA, public discovery, and ownership approval | P2       | L, conditional | Plan 003 completion | DEFERRED — post-Plan-003 re-plan and entry gates are absent   |

Plan 001 compatibility addendum: [001a](./001a-reuse-test-snapshot-package-identities.md)
ratifies reuse of the CLI and MCP package names after exact unused pre-stable
snapshot registry evidence; it changes no execution-unit ordering.

The 2026-08-29 scope amendment separates implementation from publication. Plan
001 ends at Unit 07 with unversioned, locally packed and consumer-verified
historical candidate artifacts. The 2026-08-30 successor amendment inserts Plan
004 as the only tracked product-correction, need, competitor, and validation
path. Plan 003 owns every later version, registry, trusted-publisher,
deployment, promotion, rollback, and live activation decision, but is
ineligible until Plan 004 records a final PASS bound to exact candidate bytes.
The historical Plan 001 rows for Units 08a–09c remain visible but must not be
executed there. Publisher fields in immutable Unit 00a evidence remain audit
history only; the active namespace policy is preflight-only and records
publication authority as deferred to Plan 003.

## Active dispatch

- **Active plan/unit:** `004/03`
- **Next eligible unit:** none until `004/03` completes
- **Status:** IN PROGRESS — building the offline opportunity protocol before external authority
- **Ancestry checkpoint:** `2e700a90889c7b83e4fab10a59813459343cf6b4`
- **Plan 004 evidence authority:**
  `plans/evidence/004/index.json@sha256:15dcbc7610c21b1a0c7b3da848915eb27237e91b99db92629fcd384d777dcf3f`
- **Product decision:** none; only an indexed Unit `004/07` PASS can enable Plan
  003
- **External authority:** none; network, installs, model calls, participant
  contact, publication, and deployment remain unauthorized
- **Successor eligibility:** Plan 003 and every hardening successor remain
  ineligible

Only this block dispatches post-Plan-001 work. A TODO row, local branch,
ignored plan, generated artifact, or prose status elsewhere is not authority.
When a unit is dispatched, record exactly one active plan/unit and its concrete
checkpoint here. A reviewed plan-control follow-up records completion before
dispatching a successor.

Status values: `TODO`, `IN PROGRESS`, `IN PROGRESS — <pending gate>`, `DONE`,
`BLOCKED — <reason>`, `DEFERRED`, `DEFERRED — <reason>`,
`REJECTED — <reason>`, and `STALE — <reason>`.

### Machine-readable evidence index

The contract below applies to the legacy seven-column Plan 001/002 trackers.
Plan 004 instead uses the single closed plan-level index defined in Plan 004
Appendix B; its current locator/digest and terminal decision must be recorded in
the Active dispatch block above. A Plan 004 prose PASS has no authority.

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

### Post-rebase ancestry reconciliation

The 2026-08-30 completion audit reconciled Units 00a–06c's tracker and
evidence-index `completion_sha` values, plus Units 00a–06d's drift
checkpoints, to the reachable equivalents created by the approved main rebase.
Original immutable evidence-entry `source_sha` and `completion_sha` values remain
unchanged as provenance for the runs that emitted those artifacts. The post-rebase
integration gates in Units 06d–07, culminating in the clean CRLF/LF selected
graph at `37e8372bf52c297bb056c1018b095897d3d2d5c6`, verify the current tree.

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

| Unit | Outcome                                                             | Depends on | Status                                        | Drift checkpoint                         | Completion SHA                           | Gate evidence required on completion                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---- | ------------------------------------------------------------------- | ---------- | --------------------------------------------- | ---------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 00a  | Publication fence, package namespaces, ordinary baseline            | —          | DONE                                          | c9685003adb39291ee7a1379ae760a268534d1da | 05156dc34f7a52ea49c4e72548fd7ed348b102df | embargo/workflow-policy receipts, snapshot-compatibility policy digest, package-namespace control receipt, ordinary-baseline schema/receipt/artifact digests; evidence-index=plans/evidence/001/00a.json@sha256:abd388792b54f795e34a65f5afa2d1ee14c4e568e134d4d595f3873047ecac26                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 00b  | Contracts, source identities, owners, and evaluation baselines      | 00a        | DONE                                          | 05156dc34f7a52ea49c4e72548fd7ed348b102df | 0ab03be1e6089ad78579654ec2d0361dc0f00f3c | ADR/owner approval, contract/inventory schemas, tracker pair registry, deterministic baseline/report digests; evidence-index=plans/evidence/001/00b.json@sha256:c25b47cee33da559da4b40ad15f57ab21faebccb90b9ad20353447e798afb5d8                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 01   | Pure seams and semantic characterization of the prototype           | 00b        | DONE                                          | 0ab03be1e6089ad78579654ec2d0361dc0f00f3c | ac5e3e59a005c74c21a05b8973809bff6c053401 | normalized characterization receipt digest and immutable locator; evidence-index=plans/evidence/001/01.json@sha256:9745268452559f416a41c988188fcef17497576995ddf0cdd6634b38956a235d                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 02   | Knowledge extraction behind a temporary internal baseline           | 01         | DONE                                          | ac5e3e59a005c74c21a05b8973809bff6c053401 | 090442a539bde8e7a52921ac089382b8b1383c71 | `extraction-parity@1` pack-report and semantic-comparison receipt digests; evidence-index=plans/evidence/001/02.json@sha256:05c49c12111cf47d4798fba4d40e1f30a02c3e1a78bbb254d6a978c0b100cae1                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 03   | Clean Knowledge v1 manifest, records, and pre-agent pack report     | 02         | DONE                                          | 090442a539bde8e7a52921ac089382b8b1383c71 | 301e945c6ceecf273bb2f99a6c7b7c98e269a74b | `pre-agent-support@1` pack-report and smoke receipt digests; evidence-index=plans/evidence/001/03.json@sha256:25906e857245aba9272354d4894f97bf4cc0344ccc0598d89127e9663979bde0                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 04a  | CLI shell, packed aliases, and version-aware `info`                 | 03         | DONE                                          | 301e945c6ceecf273bb2f99a6c7b7c98e269a74b | e5403595ceffa0168bcf308806ef299e90501cfe | knowledge/CLI pack plus installed alias/info/offline smoke receipt digests; evidence-index=plans/evidence/001/04a.json@sha256:83a36a7bc8c832776fff858b4e1f7a725a2225c50740ec5c9326de5f48b27dda                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 04b  | Bounded config and workspace-aware discovery                        | 04a        | DONE                                          | e5403595ceffa0168bcf308806ef299e90501cfe | b2e4f7ff77213743ccf4bac699da80c33b68f54b | discovery/config pack, containment, limits, and per-workspace vector receipt digests; evidence-index=plans/evidence/001/04b.json@sha256:9e0fb25e544ad9f27e1c31111ef229c538e689ed39ae5fdc636ac2f7e1e2eccd                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 04c  | Isolated analyzer, scan renderers, and full fixture matrix          | 04b        | DONE                                          | b2e4f7ff77213743ccf4bac699da80c33b68f54b | bcfa2bae0cc480858ddd98c690c7aca053e041f4 | scan pack/smoke plus isolation, renderer, coverage, platform, and exit-contract receipt digests; evidence-index=plans/evidence/001/04c.json@sha256:1057169aaced3d1f91cd724b93342068ce40a8ae633a3387c017f0d1940731eb                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 05   | CLI retrieval and non-promotable `R1_PRE_AGENT` receipt             | 04c        | DONE                                          | bcfa2bae0cc480858ddd98c690c7aca053e041f4 | bb2b4d8ff292513063f34023659bc2bedf65194e | `salt-ai-candidate-receipt/1`; receipt=sha256:7911494d89df6b23a0a232728367979641aa57187fb77624e4f462babb8135ee; pack=sha256:99e1cc474bae6c8a0ac15bd83a3ea2f6b0e87a0428ab3a18d577a7651fc55fc4; source=37b1a7dcdecd171fd05e52497d9813bfaa7bb88e; evidence-index=plans/evidence/001/05.json@sha256:cd34a64c58126945fafc7d658f853b764d37947809cdeb2fb3fbb14ae8573429                                                                                                                                                                                                                                                                                                                                                                          |
| 06a  | Example/story contracts, migration baseline, docs verifier          | 05         | DONE                                          | bb2b4d8ff292513063f34023659bc2bedf65194e | 6c70cc19b41500447428f43844d27dd0b1b560bf | `salt-pattern-migration-receipt/1`; patterns=24; package-stories=8; inventory=sha256:27785d6505a813186089f92c6ae7a2ff09cc74c900186e668aab562da07d9d4d; receipt=sha256:fda528e2f0b24b7b9a1685a5d6fdbfcf3a65a2f8529e98b39e941335318c860f; pack=sha256:3d71913e8f2d497c9c43ddd6040856dfca03da467cc97fcad323cf59520aac16; predecessor=sha256:7911494d89df6b23a0a232728367979641aa57187fb77624e4f462babb8135ee; source=628057bff26d0aee2d1a74e23c4063a502ddf602; evidence-index=plans/evidence/001/06a.json@sha256:5c26105ef37c25b0404f88a4c82c84024980f92da99217f29564441b08ee3bb3                                                                                                                                                            |
| 06b  | Pattern batch A plus package/identity parity receipt                | 06a        | DONE                                          | 6c70cc19b41500447428f43844d27dd0b1b560bf | 30256d3b14ac48ac31b62b42a909275db5300f44 | `salt-pattern-migration-receipt/1`; patterns=12/24; package-stories=4/8; receipt=sha256:d967cdeca8ed780380321654987acfe3fc368c99e648b9da6a1942bdb370243e; pack=sha256:2dd22d820cb92f93aff69d8a0a014fd6ef171030966ef882d23ffe9f86b905e2; predecessor=sha256:fda528e2f0b24b7b9a1685a5d6fdbfcf3a65a2f8529e98b39e941335318c860f; semantic-change=canonical-public-destination-expansion/1; source=fe107c4583ce8f0780b8001077ff98c968dea4a6; evidence-index=plans/evidence/001/06b.json@sha256:f600ce339ec2bc8222a80a667efc2b547514e8ee384a12f29c8393db492655f2                                                                                                                                                                                |
| 06c  | Pattern batch B, cumulative parity, story-input retirement          | 06b        | DONE                                          | 30256d3b14ac48ac31b62b42a909275db5300f44 | dfec7c265684c52d570369b8dfc70015bba377e9 | `salt-pattern-migration-receipt/1`; patterns=24/24; package-stories=8/8; story-inputs=0; receipt=sha256:115de2af4cd3fc5cffab8c9cc6fac56201d5be453b8facb54bba8578deb5c32a; pack=sha256:48ec6f838f42b3b23178b5fd3f79e297a90b3e1736fb8919764e117403a5a98b; predecessor=sha256:d967cdeca8ed780380321654987acfe3fc368c99e648b9da6a1942bdb370243e; compiler-change=storybook-semantic-input-retirement/1; source=be9bb1d64b7157e3a4cf7c8514653fae99ae5580; evidence-index=plans/evidence/001/06c.json@sha256:9133313b706958f0c7979c8eef5b8fc628daf39a25ba6522220f93e56d7cffcc                                                                                                                                                                   |
| 06d  | Web/Markdown/llms/docs/Skill/AGENTS and pack policy                 | 06c        | DONE                                          | dfec7c265684c52d570369b8dfc70015bba377e9 | c92f4f0308617ea3de80163f4e5736bf1b26fd1a | `release-complete@1`; pack=sha256:f861774de9d09c4a515fd1535a8a487e0e851bbc0becc25296c7177b7c6387f5; smoke=sha256:38da21a9159919876da625d340eb72db6befc26d7e73de71863b7e65874539d0; web=sha256:93f94f6075fadf30b71a667c2645657797c48c1811623f77f4a9096124e7b862; public-docs=sha256:6cb76a92cd05f431e295f876707dab50871cee8f6b5109bc7ce121ba41a63a0e; package-docs=sha256:6d79218721211e89b4f1dc31dcfd333aa35dc87fcf5aaf7f089e1286daaa4b17; routes=1042; production-navigation=false; source=c92f4f0308617ea3de80163f4e5736bf1b26fd1a; evidence-index=plans/evidence/001/06d.json@sha256:08058afecaff8d80cf47a5e144f71877135c117fb32df402cfec836614dd33fb                                                                                  |
| 06e  | Vite starter with full Salt candidate cohort                        | 06d        | DONE                                          | c92f4f0308617ea3de80163f4e5736bf1b26fd1a | 7a288d4e95d4560c91e7ebe974ba01bebfca18e0 | `salt-sample-app-cohort-receipt/1`; app=vite-starter; packages=7; receipt=sha256:326812440a98da4ed171d63bbef4a5585d351ef33f5d01b2b4b491db273a7eff; lockfile=sha256:cf0b155adf32a0850b9e8fcf4334d4c4b321cee84ea9368a8e47e084382ea29a; bundle=sha256:00d3fd9da6946bf8f43e2772d97da1860f5840efb636a2a10f2ebee7d5da33aa; compiler-change=sample-app-cohort-harness-registration/1; source=7a288d4e95d4560c91e7ebe974ba01bebfca18e0; evidence-index=plans/evidence/001/06e.json@sha256:80b0351cb3118f6f14ce625d0b2ff55eb296c18119e663c888903be8bc5670bb                                                                                                                                                                                        |
| 06f  | Next App Router starter with full Salt candidate cohort             | 06e        | DONE                                          | 7a288d4e95d4560c91e7ebe974ba01bebfca18e0 | 0fe7bf5a9c739ab3787a101ba0c6eaf81339fed4 | `salt-sample-app-cohort-receipt/1`; app=next-app-router; packages=7; receipt=sha256:96f1663966dc0343196661250fc10f2b380d3f3a000a1484fa3a487f9e1ffda5; lockfile=sha256:625af6806e6d6232b559ed9fba3ad93d0b7525993b88db69274abdbcf983ada1; bundle=sha256:2418b7e1248f2475d6f7b0ab2143012b416a38e620d6bdfc33a1dfd63a7f3a21; server-render=pass; hydration=pass; source=0fe7bf5a9c739ab3787a101ba0c6eaf81339fed4; evidence-index=plans/evidence/001/06f.json@sha256:020eacda7a1190c7d9dc4a50a31acaf8f0fbaeb2237817a0e7462167599a7239                                                                                                                                                                                                           |
| 06g  | Operations dashboard and full G4 integration gate                   | 06f        | DONE                                          | 0fe7bf5a9c739ab3787a101ba0c6eaf81339fed4 | 377607cdf9df00c0c2229a3daf4a1b379e8ec564 | `salt-sample-app-cohort-receipt/1`; apps=3; packages=8; cohort=sha256:6ed61e0b14537a4dfb27321beabc811150be792c1ca2ed9b201c3c33e0316b51; pack=sha256:d2986912d1fe744d9d3cde0e7f1c4c2ce276e7239732fd48b6b02af6f8d017df; smoke=sha256:438b79bbd866cfa03dd56bd3fcd4868b7f44d1809954363d984b0a9542ad37ee; web=sha256:7fc74b0f6b7ab22548e1d4bb01754b893c6949fc7cfac6289ba3684aaeccd524; site-build=pass; route-map=sha256:6b0a87d5840e2fab450abdde8267e8800729fb3ebdac2283fd8768b2f5db87eb; bundle=sha256:2418b7e1248f2475d6f7b0ab2143012b416a38e620d6bdfc33a1dfd63a7f3a21; source=377607cdf9df00c0c2229a3daf4a1b379e8ec564; evidence-index=plans/evidence/001/06g.json@sha256:b3393af242bb905585444005195d8f38bfbb44923c2142663bec6bc2c22db20f |
| 07   | Current-spec MCP candidate and provisional ship/omit recommendation | 06g        | DONE                                          | 0ace9f0f36549fd36ec50efc1079d8e8b36f0742 | 37e8372bf52c297bb056c1018b095897d3d2d5c6 | `salt-selected-graph-receipt/1`; disposition=omit; selected-graph=sha256:c3a1f771744133756e01c3cc737085bab63b77577564f588b21254b88a899884; pack=sha256:1994bf349cb33e0f359a4a24f7191a1a88ae07a190412813e012862bf9deb63f; smoke=sha256:1b134e1b6adae314f549564d41f8d08de08439b81a57ac2f589fe3124935e6cc; bundle=sha256:64b430b5502d2fe02ddfb016700bf46386035efb0e0675489fb43883eb3b5b9a; clean-crlf-lf=true; source=37e8372bf52c297bb056c1018b095897d3d2d5c6; evidence-index=plans/evidence/001/07.json@sha256:705eba15fb32efcbe363ccffd8a745976ae7007b3340499341ee38753698b141                                                                                                                                                            |
| 08a  | Selected graph, release-plan partition, and packed cohort           | 07         | BLOCKED — publication scope moved to Plan 003 | —                                        | —                                        | Publication/version scope transferred to Plan 003; retained here as design history only.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 08b  | Sole protected publisher, receipt chains, and snapshot drill        | 08a        | BLOCKED — publication scope moved to Plan 003 | —                                        | —                                        | Publication authority scope transferred to Plan 003; no Plan 001 environment or credential is required.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 08c  | Final-version MCP decision, ordinary release, and protected R2      | 08b        | BLOCKED — publication scope moved to Plan 003 | —                                        | —                                        | Version materialization, registry/web publication, protected R2, and drill scope transferred to Plan 003.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 09a  | Controlled selected-mode evaluation and GA decision                 | 08c        | BLOCKED — publication scope moved to Plan 003 | —                                        | —                                        | Post-publication evaluation and GA decision transferred to Plan 003.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 09b  | CAS-only R3 and initial four-entry current authority                | 09a        | BLOCKED — publication scope moved to Plan 003 | —                                        | —                                        | Live activation and current-authority scope transferred to Plan 003.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 09c  | Post-R3 navigation, normal docs deployment, and live crawl          | 09b        | BLOCKED — publication scope moved to Plan 003 | —                                        | —                                        | Live deployment, discovery, and crawl scope transferred to Plan 003.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

Ordinary Plan 001 units become `DONE` only after merge plus the evidence-bearing
plan-control update. Unit 07 is the terminal Plan 001 unit. Its immutable
candidate disposition, selected graph, pack/smoke, web build, documentation,
and sample-app evidence close the local implementation plan without assigning
stable versions or mutating a registry or deployment target. Units 08a–09c are
historical handoff rows and stay `BLOCKED — publication scope moved to Plan
003`; they cannot be
dispatched from Plan 001. Plan 002 cannot start until Plan 003 has completed the
required publication, activation, discovery, and live-authority gates.

### Plan 002 execution-unit tracker (deferred)

These rows reserve dependencies only; they do not authorize work. After Plan
003 is complete, its activation/current-authority and public-discovery receipts
validate, and all Plan 002 Unit 00 entry gates are approved, Plan 002 must first
be re-planned against those actual contracts. Only then may a plan-control-only
update change Plan 002/Unit 00 to `TODO` and replace its placeholder with the
latest default-branch commit containing Plan 003 completion, that live
authority, the approved re-plan, and those approvals.
After each Plan 002 merge or protected post-merge transition, the plan-control
update records the actual schema-valid receipt/artifact digests in `Gate
evidence`; a prose claim or workflow URL without immutable digests does not
satisfy a successor dependency. Unit 04/05 special completion rules appear
below the table.

| Unit | Outcome                                                            | Depends on                                                                       | Status                        | Drift checkpoint                                 | Completion SHA | Gate evidence required on completion                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ---- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 00   | Compare packaged/local/remote/reject paths and record decision     | Plan 003 completion + live authority descended from its R3 + Unit 00 entry gates | DEFERRED — entry gates absent | set after Plan 003, live authority, and approval | —              | exact current release/MCP/effective-graph/package-doc selectors, initial-R3 ancestry and decision-baseline authority-rebase receipt, plus ADR/approval and immutable historical-distribution decision receipt                                                                                                                                                                                                                                                                                                                                          |
| 01   | Remote-TUF only: reproducible bundle and capability registry       | 00 records `remote-tuf`                                                          | DEFERRED                      | set after 00                                     | —              | atomic live current-authority selector, accepted authority-rebase, source/generation/candidate, selected-graph pack, and version-intent digests                                                                                                                                                                                                                                                                                                                                                                                                        |
| 02   | Remote-TUF only: metadata, trust state, and cache internals        | 01                                                                               | DEFERRED                      | set after 01                                     | —              | atomic live selector, accepted authority-rebase, hostile trust/cache, selected-graph pack, and version-intent digests                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 03   | Remote-TUF only: explicit trust/sync/pin and offline resolver      | 02                                                                               | DEFERRED                      | set after 02                                     | —              | atomic live selector, accepted authority-rebase, packed offline-command, selected-graph pack, and version-intent digests                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 04   | Freeze descriptor/docs/web and publish one historical R2 beta      | 03 + remote origin/signing approval only when selected                           | DEFERRED                      | set after 03 and applicable approval             | —              | live selector and active-plan rebase; release-authority baseline; activation-tooling-ready; same-kind active freeze lease; package-namespace release; cumulative intent/version plan/planned+landed-applied partition; historical version/effective graph/successor MCP; complete 11-pair retirement; descriptor and mapping rebinds, projection/effective docs, pack/web; ordinary request/baseline/final/evidence; package/target/mapping readbacks and R2/drill receipts                                                                            |
| 05   | Pilot exact R2 bytes, activate one-vector R3, and launch discovery | 04 + every activation gate                                                       | DEFERRED                      | set after 04 and gate ratification               | —              | live selector, release baseline, tooling-ready and active lease; acquired R2/drill/graph/MCP/descriptor/projection/docs/web/target/mapping parents; post-R2 fixture checkpoint, protected pilot/drill/eval/gates and maintenance rehearsals; pending metadata, activation commit, higher active-support attestation, successful R3 final; same-kind consumed lease, coordinator transition, authority-commit and atomic successor current authority; post-R3 negative crawl; navigation premerge/landed retirement, deployment and live-crawl receipts |

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
- Plan 004 is the sole tracked post-Plan-001 product plan. Unit 004/00
  establishes dispatch/evidence authority without staging inherited product
  work; Unit 004/01 adopts and completes that exact allowlisted work. Every unit
  from 004/02 starts clean. `PASS`, `CUT`, and `DEFER` are evidence outcomes,
  not execution statuses. Only an indexed final Plan 004 PASS makes Plan 003
  eligible. Unit boundaries are evidence checkpoints, not mandatory user-facing
  pauses: an already-authorized local execution continues through the next
  eligible unit and yields only at Plan 004's registered authority, outcome,
  STOP, or unfixable verification boundary.
- Plan 003 consumes the exact Plan 004 PASS candidate and Plan 001 Unit 07 as
  historical ancestry. It never publishes the older Plan 001 bytes after Plan
  004 changes product or content behavior.
- Plan 002 is intentionally deferred and is not part of Plan 001's GA path. Its
  Plan-001/09b/09c selectors are superseded design history. It requires Plan 003
  completion, validated Plan 003 activation/current-authority/public-discovery
  receipts, named Unit 00 approvals, and an explicit post-Plan-003 re-plan before
  any unit can become TODO.
- `advisor-plans/` contains ignored historical audits, MCP work, and blocked
  experiments. It is evidence only, is not a dependency queue for any tracked
  plan, and must not be edited while executing Plans 001–004.

## Findings considered and rejected

- Execute the ignored `advisor-plans/023 → 018 → 022 → 019 → 020 → 021 → 030`
  queue: rejected. It is absent from tracked Git authority and contains known
  impossible drift, lint, scope, declaration, and authorization gates. Plan
  004 inlines the retained requirements in dependency-closed units.
- Build a reusable evaluator/broker/condition platform before user need is
  established: rejected. Plan 004 uses a cheap need/alternative gate first and
  one experiment-specific four-contract harness only after `PASS_NEED`.
- Include scanner hardening in the core candidate: rejected. The independent
  product wedge is scan-free; scanner restoration needs both technical evidence
  and explicit real-user pull in a new tracked successor.

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
