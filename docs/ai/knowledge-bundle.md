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

    salt-ds docs <record-id-or-name> --format markdown|json
    salt-ds context <query> --format markdown|json --limit <n>

The docs command accepts only an exact record ID, export, canonical name, title,
or alias. It returns choices for collisions and never guesses. Resolved JSON
and Markdown include the verified record, its bundle digest, source-record
citations, and the primary manifest-bound content object when one exists. The
context command applies the deterministic ranking pipeline and returns
record/source citations, the bundle digest, and a digest of the selected
context. Both renderers are deterministic; context output is capped at 16 KiB
by default.

Plan 001 supports the exact current bundle only. Historical download, trust,
pin, cache, compatibility index, and rule execution belong exclusively to Plan 002.
