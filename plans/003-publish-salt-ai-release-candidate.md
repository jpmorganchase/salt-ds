# Plan 003: Publish an approved Salt AI release candidate

## Status

- **Status:** DEFERRED — publication authority and immutable web provider are
  not approved
- **Depends on:** Plan 001 Unit 07
- **Scope:** version materialization, registry and deployment authority,
  publication, readback, promotion, rollback, and post-publication activation
- **Preserved implementation checkpoint:** local branch
  `codex/ai-publishing` at `ab61a3c70fc7e10d8e15cbdf07418399d7d53ca8`

The preserved branch is development history, not release evidence or permission
to publish. This plan must receive a normal reviewed dispatch checkpoint before
any executor uses that implementation.

## Boundary from Plan 001

Plan 001 produces unversioned release-candidate artifacts and immutable local
evidence. Its completion proves that Knowledge and CLI package bytes can be
packed, installed into clean consumer projects, used offline, and projected to
the deterministic web artifact. It does not assign stable versions, reserve or
mutate npm identities, authenticate a publisher, deploy web bytes, change a
dist-tag or pointer, or claim a public release.

Plan 003 consumes the exact active Plan 001 Unit 07 evidence index and owns all
external distribution work. It must preserve the selected graph and the Unit 07
MCP disposition unless a newly approved prepublication evaluation is explicitly
authorized to demote `ship` to `omit`; it may never promote an omitted candidate
without a separate product decision.

Local `npm pack`, clean-room tarball installation, lockfile replay, offline
consumer smoke, package metadata inspection, and deterministic web builds are
verification and remain in Plan 001. `npm publish`, staged registry publication,
trusted-publisher configuration, registry reads used as release authority,
provenance acceptance, dist-tag mutation, and any deployment-provider mutation
belong only to this plan.

## Entry gates

Keep every unit deferred until owners have recorded all of the following in a
reviewed plan-control update:

1. An explicit decision to publish the candidate packages and web cohort.
2. Final package names, versions, release channel, and selected graph.
3. The existing Salt release owner's decision on whether AI packages use the
   ordinary release process or an isolated publisher.
4. The exact npm trusted-publisher identity or another approved short-lived
   authentication mechanism. A GitHub Environment is optional unless the owner
   selects it as a required approval boundary.
5. An immutable web storage identity, upload identity and command, live readback
   endpoint, pointer compare-and-swap primitive, and guarded rollback command.
6. Named owners for registry, web, incident rollback, and retained evidence.

No executor may infer these values from repository text, create external
environments, configure npm, publish, deploy, or enable network access before
the applicable entry gate is approved.

## Execution units

| Unit | Outcome                                                                        | Status   | Required evidence                                                                                                                 |
| ---- | ------------------------------------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 00   | Reacquire and revalidate the exact Plan 001 Unit 07 candidate                  | DEFERRED | Plan 001 evidence-index digest, selected graph, MCP disposition, pack/smoke, apps, docs, and web artifact digests                 |
| 01   | Materialize reviewed versions and seal a release candidate without credentials | DEFERRED | version intent, applied partition, exact tarball/content digests, final local consumer verification, and no-publish proof         |
| 02   | Configure and rehearse the separately owned publisher                          | DEFERRED | approved registry/web identities, workflow policy, fake-provider rehearsal, hostile cases, and rollback/CAS drill                 |
| 03   | Publish and verify one beta cohort                                             | DEFERRED | registry provenance/readback, immutable web readback, published consumer smoke, protected drill, and digest-chained final receipt |
| 04   | Evaluate, activate, and expose public discovery                                | DEFERRED | exact beta parent, outcome gates, activation receipt, current-authority set, navigation deployment, and live crawl                |

Implement one unit at a time. Units 00 and 01 are noncredentialed. Units 02–04
remain blocked until their exact external entry gates exist.

## Invariants

- Plan 001 candidate bytes are immutable inputs. A content change returns to a
  new Plan 001 successor candidate rather than being patched during publication.
- Publication cannot modify ordinary Salt packages unless the release owner
  explicitly adopts and reviews that separate dependency cohort.
- A public package and its matching web projection must derive from the same
  selected graph and bundle digest.
- PR, issue-comment, snapshot, and local workflows have no publication
  authority.
- Released immutable bytes are never overwritten. Mutable tags and pointers use
  recorded compare-and-swap preconditions and stale-safe rollback.
- A successful workflow URL, local file, mutable artifact name, or branch head
  is never sufficient release evidence.

## STOP conditions

STOP without weakening Plan 001 or fabricating evidence if:

- publication has not been explicitly approved;
- package identity, version, release channel, authentication, or owner is
  unresolved;
- the web provider cannot supply immutable upload, byte readback, pointer CAS,
  and guarded rollback;
- registry or web mutation would require a long-lived credential that has not
  been separately approved;
- the candidate differs from the tracker-selected Plan 001 bytes;
- ordinary Salt publication must change but its release owner has not approved
  that independent work; or
- any action would publish, deploy, create external infrastructure, or change a
  public pointer outside the active unit's explicit authority.
