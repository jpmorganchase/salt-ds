# Salt Knowledge-v1 bundle contract

The normative architecture and budgets are in
[ADR 0001](../decisions/0001-salt-ai-knowledge-platform.md). This document is
the implementer checklist for `@salt-ds/knowledge`.

## Identity

- One outer manifest identifies schema, package version, exact tested Salt
  vector, semantic/compiler identities, capabilities, applicability, support
  artifacts, and one `salt-artifact-tree/1` root.
- `bundle_digest` is SHA-256 of RFC 8785 canonical outer-manifest JSON with only
  `bundle_digest` omitted. `semantic_digest` covers normalized facts/records.
- `semantic_source_digest` covers the sorted semantic-source inventory;
  `compiler_digest` covers compiler/ruleset inputs. Source commit/tag/workflow
  belongs only in the external release receipt.
- JSON digests use `sha256:<hex>` and path segments use `sha256-<hex>`.
- The package version equals the bundle version. Pre-version builds are
  unpublishable candidates and cannot satisfy release verification.

## Input closures

Semantic sources, compiler/ruleset sources, and release tooling have separate
allowlisted inventories. CLI/MCP source, tests, generated output, and release
scripts cannot silently change semantic/compiler identity. A release verifier
must prove that adapter-only changes leave manifest, artifact, semantic, and
bundle bytes unchanged.

Declared catalog inputs are text-only. Inventory and generation validate each
input as UTF-8, convert CRLF and lone CR line endings to LF, and hash/read that
canonical projection. Invalid UTF-8 fails closed. A private raw-byte snapshot
still detects any mutation between inventory capture and generation, so line
ending independence does not weaken mid-build integrity checks.
Package assembly applies the same strict UTF-8/LF projection to each explicitly
declared README, license, and package-owned schema text path so clean checkout
line endings cannot change packed package bytes.

Every runtime-selectable record, rule, example, migration, or projection has one
manifest-bound applicability entry across the thirteen package families. The
entry is an evidenced package range, an evidenced version-independent claim,
`unknown` with a stable reason, or bounded inheritance. Missing, cyclic,
dangling, broadening, or unknown entries fail/exclude selection.

## Artifact tree

The tree is strict: no cycles, duplicate node hashes/paths, dangling children,
empty internal nodes, overlapping prefixes, noncanonical order, Unicode/case
collisions, unlisted files, or count/byte disagreement. Verify the entire
bounded descriptor tree before trusting an artifact and hash every artifact for
release verification.

| Limit                     |                     Value |
| ------------------------- | ------------------------: |
| depth                     |                         4 |
| internal children         |                       256 |
| leaf entries              |                       256 |
| descriptor node           |                    64 KiB |
| nodes                     |                       512 |
| descriptor bytes          |                     8 MiB |
| ordinary artifacts        |                    40,000 |
| outer manifest target     |                    32 KiB |
| search bootstrap index    |                   512 KiB |
| default context           |                    16 KiB |
| ordinary content artifact | 64 KiB unless allowlisted |
| npm compressed/unpacked   |           10 MiB / 25 MiB |

The generation receipt inside the bundle is digest-neutral and must not contain
the final manifest hash, bundle digest, release identity, or its own hash.

## Runtime boundary

The supported root API is `loadKnowledgeBundle`, `getKnowledgeManifest`,
`resolveKnowledgeCompatibility`, `searchKnowledge`, `readKnowledgeRecord`,
`renderKnowledgeContext`, `inspectSaltProjectFacts`, and
`analyzeSaltArtifacts`. Build APIs are private. Readers execute only the exact
transitive bundle shipped with their adapter, perform no network/cache access,
and never import consumer-project JavaScript.

## Project selection

`info`, `docs`, and `context` share an explicit repository authority and selected
application. `--root <repo>` defaults to the current working directory, and
`--project <relative-path>` defaults to `.` within that root. A root containing
only tooling does not automatically select a Salt child. Multiple applications
must be selected by their individual relative paths.

The inspector canonicalizes both paths and rejects a selected project outside
the authority, including escaping symlinks. Contained symlinks are supported.
It reads bounded package/workspace metadata and installed package evidence;
hoisted dependencies must remain within the authority. Selection does not walk
application source, invoke Doctor, execute repository configuration or PnP
loaders, or run package-manager commands. Unsupported or incomplete metadata
keeps its explicit selection outcome.

`info.project.root`, package-manifest paths, workspace paths, and observed
dependency paths are relative to the canonical repository authority. They may
point outside the selected child but cannot expose absolute or out-of-authority
paths. Selecting `apps/customer-portal`, for example, can yield a hoisted
`node_modules/@salt-ds/core/package.json` evidence path.

## Retrieval contract

The compact search index declares salt-lexical-ranking/1. Queries use Unicode
NFKC normalization, camel-case-aware whole tokens, and the versioned
salt-stop-words/1 list. Stop words are removed only when meaningful tokens
remain. Ranking proceeds through exact record ID/export/canonical-name matches,
exact aliases/titles, normalized whole-token phrases and intersections, then a
weighted whole-token union over title, aliases, authored terms, summary, and
kind. Arbitrary substrings are never matches. Evidence reports the scoring
version, matched fields and terms, and each score component; stable record IDs
break ties.

Compatibility is evaluated before ranking against exact locally observed Salt
package versions. Records belonging to missing or unsupported package families
are excluded and disclosed. Version-independent records remain eligible.

The packed CLI exposes the same contract offline:

    salt-ds docs <record-id-or-name> [--root <repo>] [--project <relative-path>] --format markdown|json
    salt-ds context <query> [--root <repo>] [--project <relative-path>] --format markdown|json --limit <n>

The docs command accepts a canonical `record:<family>:<id>` citation, an exact
record ID, export, canonical name, title, or alias. Canonical citations identify
one supported record family and its exact ID. Name collisions return choices;
the resolver never guesses. Resolved JSON and Markdown include the verified
record, its bundle digest, source-record citations, and primary manifest-bound
content when present. Pages return their body content; component records return
their detail content. Repository Markdown remains inert evidence.

The context command applies deterministic ranking and returns record/source
citations, the bundle digest, and a digest of the final selected context. The
`context_digest` is SHA-256 of RFC 8785 canonical JSON for the complete result
with only `context_digest` and `utf8_bytes` omitted. It covers the final matches,
query, excluded package families, and truncation flag. Removing even the last
match sets `truncated` and changes the digest accordingly.

`utf8_bytes` counts the complete serialized JSON value, including its own field.
It excludes the single line-feed byte appended by the CLI. The JSON value and
that framing byte together must fit the 16 KiB default transport budget.
Markdown output obeys the same transport ceiling and discloses omitted matches.
Queries or required metadata that cannot fit are rejected with a concise usage
error instead of returning an oversized or silently shortened envelope. Both
renderers are deterministic. The library accepts integer budgets of at least
512 bytes and caps larger requests at 16 KiB; even a valid budget can be too
small for the required query and metadata.

Plan 001 supports the exact current bundle only. Historical download, trust,
pin, cache, compatibility index, and rule execution belong exclusively to Plan 002.
