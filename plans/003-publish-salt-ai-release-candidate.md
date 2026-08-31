# Plan 003: Publish an approved Salt AI release candidate

## Status

- **Status:** DEFERRED — Plan 004 final PASS, publication authority, and an
  immutable web provider are not approved
- **Depends on:** Plan 004 final PASS; Plan 001 Unit 07 is historical ancestry
- **Scope:** version materialization, registry and deployment authority,
  publication, readback, promotion, rollback, and post-publication activation
- **Preserved implementation checkpoint:** local branch
  `codex/ai-publishing` at `ab61a3c70fc7e10d8e15cbdf07418399d7d53ca8`

The preserved branch is development history, not release evidence or permission
to publish. This plan must receive a normal reviewed dispatch checkpoint before
any executor uses that implementation.

## Boundary from Plans 001 and 004

Plan 001 produced unversioned historical candidate artifacts and immutable local
evidence. Its completion proved that Knowledge and CLI package bytes could be
packed, installed into clean consumer projects, used offline, and projected to
the deterministic web artifact. It does not assign stable versions, reserve or
mutate npm identities, authenticate a publisher, deploy web bytes, change a
dist-tag or pointer, or claim a public release.

Plan 004 is the only tracked product successor. It may correct and revalidate
the unreleased Knowledge/CLI product, and its final independently reviewed PASS
must bind the exact source commit, package tarball hashes, bundle/semantic/Skill/
corpus identities, deterministic web projection/route-map/artifact digests,
selected graph, and scan-free product boundary. Plan 001 Unit 07 remains
required ancestry and preserves the MCP `omit` disposition, but its older
package or web bytes are not the release input after Plan 004 changes them.

Plan 003 consumes the exact final Plan 004 PASS candidate and owns all external
distribution work. It may never add MCP, scanner, policy, historical knowledge,
or another unevaluated surface while materializing a release.

Plan 001's local pack/smoke/web evidence is historical ancestry only. Plan 004
owns local verification of its unversioned final candidate. Plan 003 Units 00
and 01 must reacquire that indexed candidate and rerun local pack, clean-room
tarball installation, lockfile replay, offline consumer smoke, package metadata,
and deterministic web verification against the exact materialized final-version
bytes before any external mutation. `npm publish`, staged registry publication,
trusted-publisher configuration, registry reads used as release authority,
provenance acceptance, dist-tag mutation, and any deployment-provider mutation
belong only to this plan.

Unit `003/00` must receive the external retained-candidate locator file and
expected digest selected by Plan 004, revalidate its containment and retention,
and read back/hash every sealed package, smoke, public-doc, route-map, web, and
artifact-tree object before rebuilding. The locator path remains external; the
tracked Unit `003/00` receipt binds only its digest, custody/expiry, object IDs,
and readback results. Missing, expired, or inaccessible retained bytes are a
STOP, not permission to reconstruct an unevaluated substitute.

## Entry gates

Keep every unit deferred until owners have recorded all of the following in a
reviewed plan-control update:

1. `plans/evidence/004/07.json` validates as
   `salt-ai-product-wedge-decision/1` with result `PASS`, its digest/identity is
   selected by `plans/evidence/004/index.json` and `plans/README.md`, and
   `yarn validate:salt-ai:plan-004 --phase final --expect PASS` succeeds. The
   receipt and independent review bind the exact clean candidate commit and
   package/content identities, including the Unit `004/05` sealed web
   projection and its inherited Unit `004/07` digest chain.
2. An approved retained-candidate locator file whose SHA-256 equals the digest
   in the Plan 004 PASS, plus a successful package/web readback, custody owner,
   and retention through publication and the rollback window. Its path and
   storage credentials remain external.
3. An explicit decision to publish those exact candidate packages and web
   cohort.
4. Final package names, versions, release channel, and selected graph.
5. The existing Salt release owner's decision on whether AI packages use the
   ordinary release process or an isolated publisher.
6. The exact npm trusted-publisher identity or another approved short-lived
   authentication mechanism. A GitHub Environment is optional unless the owner
   selects it as a required approval boundary.
7. An immutable web storage identity, upload identity and command, live readback
   endpoint, pointer compare-and-swap primitive, and guarded rollback command.
8. Named owners for registry, web, incident rollback, and retained evidence.

No executor may infer these values from repository text, create external
environments, configure npm, publish, deploy, or enable network access before
the applicable entry gate is approved.

## Execution units

| Unit | Outcome                                                                        | Status   | Required evidence                                                                                                                                                      |
| ---- | ------------------------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 00   | Reacquire Plan 001 ancestry and the exact final Plan 004 PASS candidate        | DEFERRED | Plan 001/07 ancestry, Plan 004 decision/review, clean commit, retained locator/readback/retention, selected graph, package/bundle/Skill/corpus, web, and smoke digests |
| 01   | Materialize reviewed versions and seal a release candidate without credentials | DEFERRED | version intent, applied partition, exact tarball/content digests, final local consumer verification, and no-publish proof                                              |
| 02   | Configure and rehearse the separately owned publisher                          | DEFERRED | approved registry/web identities, workflow policy, fake-provider rehearsal, hostile cases, and rollback/CAS drill                                                      |
| 03   | Publish and verify one beta cohort                                             | DEFERRED | registry provenance/readback, immutable web readback, published consumer smoke, protected drill, and digest-chained final receipt                                      |
| 04   | Evaluate, activate, and expose public discovery                                | DEFERRED | exact beta parent, outcome gates, activation receipt, current-authority set, navigation deployment, and live crawl                                                     |

Implement one unit at a time. Units 00 and 01 are noncredentialed. Units 02–04
remain blocked until their exact external entry gates exist.

## Invariants

- The final Plan 004 PASS candidate bytes are immutable inputs. A content,
  ranking, Skill, CLI, workflow, or package change returns to a new Plan 004
  validation decision rather than being patched during publication.
- Publication cannot modify ordinary Salt packages unless the release owner
  explicitly adopts and reviews that separate dependency cohort.
- A public package and its matching web projection must derive from the same
  selected graph and bundle digest. Materialization may rebind reviewed version
  metadata, but its deterministic web projection must reproduce the exact
  Plan 004 route/content mapping; any unique guidance, ranking, search, or
  navigation behavior returns to Plan 004 instead of being published here.
- PR, issue-comment, snapshot, and local workflows have no publication
  authority.
- Released immutable bytes are never overwritten. Mutable tags and pointers use
  recorded compare-and-swap preconditions and stale-safe rollback.
- A successful workflow URL, local file, mutable artifact name, or branch head
  is never sufficient release evidence.

## STOP conditions

STOP without weakening the indexed Plan 004 candidate contracts or fabricating
evidence if:

- publication has not been explicitly approved;
- Plan 004 lacks a final independently reviewed PASS bound to the exact
  candidate, or its candidate differs from the bytes presented for release;
- package identity, version, release channel, authentication, or owner is
  unresolved;
- the web provider cannot supply immutable upload, byte readback, pointer CAS,
  and guarded rollback;
- registry or web mutation would require a long-lived credential that has not
  been separately approved;
- Plan 001 Unit 07 ancestry or the MCP `omit` disposition cannot be verified;
- ordinary Salt publication must change but its release owner has not approved
  that independent work; or
- any action would publish, deploy, create external infrastructure, or change a
  public pointer outside the active unit's explicit authority.
