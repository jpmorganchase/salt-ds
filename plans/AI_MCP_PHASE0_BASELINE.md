# AI/MCP Phase 0 baseline

This is the immutable pre-redesign measurement record for the reviewed Salt MCP
implementation. It deliberately separates a successful protocol exchange from a
successful user task.

## Source state

- Reviewed commit and capture HEAD:
  `f0f6d86db9a5f7b6db434e2b0be4e6d3f57f4f4b`
- Applicable merge base:
  `5b67cd544fcba665e5a5b265277f323eab472f3e`
- Branch: `mcp`
- Capture date: 2026-07-29
- Environment: Windows x64, Node `v24.10.0`, Yarn `4.17.0`, npm `11.6.1`
- Packed production-source diff at capture: empty for
  `packages/mcp/src`, `packages/mcp/package.json`, and `packages/mcp/bin`
- Working-tree changes at capture were limited to the baseline harness,
  its fixtures, the shared consumer-smoke pack return value, and `plans/`.

The complete machine-readable record is
`packages/mcp/eval-fixtures/remediation-baseline/captured/manifest.json`.
Phase 0 replayed all preregistered assertions without modifying the committed
captures. Phase 2 retired that executable SDK-v1/private-workflow harness. A
current static integrity test verifies the immutable artifact and fixture hashes
and byte counts without loading the historical protocol.

## Archived reproduction evidence

The committed scenario matrix, exact tarball, isolated install lockfile,
historical offline guard, manifest, and 15 normalized captures are retained
byte-for-byte. Source/runtime recapture is intentionally unavailable from the
redesigned checkout. It requires a separately isolated archival worktree at the
full reviewed commit and must not restore the retired protocol to current code.

Exact packed artifact:

- package: `@salt-ds/mcp@0.0.0`
- MCP SDK: `1.30.0`
- original npm filename: `salt-ds-mcp-0.0.0.tgz`
- committed fixture:
  `artifacts/salt-ds-mcp-f0f6d86.tgz`
- tarball SHA-256:
  `dd3b3bd1af3ccc55a21afbcd1e844cc1d4ee31b80bce5b2caa900329ddbb8f59`
- npm packed bytes: `1,163,834`
- npm unpacked bytes: `11,126,844`
- packed entries: `20`
- replay lockfile bytes: `50,825`
- replay lockfile SHA-256:
  `b926b4d1bc359b0bd3f439e2187555f76ecd9ef5246b80df60c593775209db77`

## Baseline public surface

The initialized server advertised:

- 5 tools:
  `get_salt_project_context`, `get_salt_reference`, `review_salt_ui`,
  `create_salt_ui`, and `migrate_to_salt`;
- 2 concrete resources:
  `salt://capabilities/manifest` and `salt://catalog/manifest`; and
- 1 resource template: `salt://catalog/entity/{name}`.

Exact discovery measurements:

| Item                                 | UTF-8 bytes |
| ------------------------------------ | ----------: |
| Exact minified `tools/list` response |      44,357 |
| Tool array alone                     |      44,347 |
| Server instructions                  |       4,289 |

Per-tool discovery cost:

| Tool                       | Full tool | Description | Input schema | Output schema |
| -------------------------- | --------: | ----------: | -----------: | ------------: |
| `get_salt_project_context` |     4,836 |         122 |          388 |         4,099 |
| `get_salt_reference`       |     2,609 |         278 |          810 |         1,300 |
| `review_salt_ui`           |    10,987 |         235 |        2,774 |         7,761 |
| `create_salt_ui`           |    13,567 |         168 |        1,126 |        12,056 |
| `migrate_to_salt`          |    12,342 |         189 |        1,384 |        10,551 |

Empty-prefix entity completion returned 25 values, reported `total: 25`
and `hasMore: false`, while the same packed catalog contained 103 unique
component/pattern names.

## Scenario results

`Reproduced` means the reviewed behavior was observed. It does not mean the
behavior was correct. `Calls` counts `tools/call` requests; discovery/resource
protocol requests remain present in the recorded frames.

| Scenario                           | Reproduced | Semantic result | Calls | Latency ms | Response bytes |
| ---------------------------------- | ---------- | --------------- | ----: | ---------: | -------------: |
| `surface_discovery`                | yes        | failure         |     0 |    369.994 |         61,291 |
| `create_toolbar_link`              | yes        | not evaluated   |     1 |    570.134 |          9,075 |
| `migrate_primary_action`           | yes        | not evaluated   |     1 |    331.676 |          9,918 |
| `reference_matrix`                 | yes        | success         |     4 |     60.523 |         58,772 |
| `project_inspection`               | yes        | success         |     1 |     60.231 |         10,872 |
| `review_grounded_findings`         | yes        | success         |     1 |    155.012 |          7,214 |
| `review_generic_react_false_block` | yes        | failure         |     1 |     26.484 |          2,432 |
| `review_false_completion`          | yes        | failure         |     1 |     32.324 |          3,410 |
| `policy_prose_trust_boundary`      | yes        | failure         |     1 |     32.156 |          4,610 |
| `r1_border_button_non_convergence` | yes        | failure         |     3 |    328.014 |         22,728 |
| `token_query_border`               | yes        | failure         |     1 |    173.241 |          4,938 |
| `token_query_text_color`           | yes        | failure         |     1 |    134.023 |          7,841 |
| `token_query_padding`              | yes        | failure         |     1 |    159.956 |          3,122 |
| `token_query_disabled_text`        | yes        | failure         |     1 |    155.071 |          5,498 |
| `offline_esm_guard_bypass`         | yes        | failure         |   n/a |    284.262 |            n/a |

Aggregate directional measurements on this host:

- latency: minimum `26.484 ms`, median `155.071 ms`, maximum `570.134 ms`;
- captured high-level response bytes: `211,721` total, `61,291` maximum;
- semantic outcomes: 3 success, 10 failure, 2 not evaluated;
- agent edits: unavailable for all scenarios;
- user corrections: unavailable for all scenarios; and
- real-host capture: unavailable for all scenarios.

Create and migration are not counted as successful product tasks: the server
returned guidance, but no real agent artifact was compiled, rendered, exercised,
or accessibility-checked.

## Scoring rubric

Each capture reports these dimensions independently:

1. `transport_success`: the protocol exchange completed.
2. `schema_or_envelope_success`: the SDK did not report a tool error.
3. `reproduction_assertion.passed`: the exact reviewed behavior occurred.
4. `semantic_task_result`: `success`, `failure`, or `not_evaluated`.
5. `semantic_task_reason`: the specific outcome limitation or failure.
6. `agent_edits` and `user_corrections`: numeric only when a real host run
   supplies them; otherwise `null`.
7. `host_capture_status`: availability of real host/model evidence.

A transport, schema, or reproduction pass never promotes a semantic failure to
success. Synthetic evidence-sprint scores are excluded.

## Quantitative build baseline

Using the freshly built ignored catalog at the reviewed commit:

- 11 generated artifact files;
- 8,995,027 raw bytes total;
- `tokens.json`: 4,705,659 bytes;
- `components.json`: 1,839,071 bytes;
- `patterns.json`: 900,887 bytes;
- 56,865 physical production TypeScript lines excluding tests/evals; and
- approximately 47,540 runtime-reachable production lines using the
  second-pass review's recorded static-import method.

These values are the before side of the token-size, searchable-index,
package-size, and runtime-reachable line-count gates. Moving bytes to a new
artifact does not satisfy a budget.

## Verification truth at the reviewed commit

| Command                             | Result                                                                                    |
| ----------------------------------- | ----------------------------------------------------------------------------------------- |
| `yarn typecheck:mcp`                | exit 0; 19.2 s                                                                            |
| `yarn workspace @salt-ds/mcp build` | exit 0; 35.5 s                                                                            |
| `yarn test:ai-tooling`              | exit 1; 66 files passed, 1 failed; 770 tests passed, 1 failed; 84.08 s                    |
| focused `registryCoverage.spec.ts`  | exit 1; 4 passed, 1 failed; only `JPM brand colors` lacked a canonical foundation example |

The expected coverage gap was a real red release gate at baseline. It was not
counted as success. Phase 0 converts it to a named, explicitly non-gating audit
with a maximum budget of one exact known gap; any additional or changed gap
remains a failure.

The existing release chain was:

```text
build
→ typecheck:mcp
→ test:ai-tooling
→ eval:evidence-sprint
→ check:ai-tooling:pack
→ smoke:consumer --skip-build
```

The original consumer smoke accepted well-shaped semantic failures. That
behavior is recorded as a defect, not evidence of product success. The Phase 0
exit gate rejects `status: "failed"` structurally and requires the known
positive review case to return a non-failure outcome with grounded findings and
evidence.

## Phase 0 exit delta

After the baseline was committed to fixtures, the two broken headline tools and
the duplicate capability resource were unregistered. Active docs, skills,
configuration, and examples no longer prescribe those workflows; creation and
migration are documented as agent-owned procedures.

The reproducible post-unregistration measurement is:

```text
yarn workspace @salt-ds/mcp build
yarn workspace @salt-ds/mcp measure:surface
```

It uses the freshly built ESM package entry point, UTF-8,
`JSON.stringify(value)` without spacing, and no compression or transport
framing.

| Metric                            | Reviewed baseline | Phase 0 exit |
| --------------------------------- | ----------------: | -----------: |
| registered tools                  |                 5 |            3 |
| concrete resources                |                 2 |            1 |
| resource templates                |                 1 |            1 |
| exact minified `tools/list` bytes |            44,357 |       18,423 |
| tool-array bytes                  |            44,347 |       18,413 |
| instruction bytes                 |             4,289 |          782 |
| packed compressed bytes           |         1,163,834 |    1,158,998 |
| packed unpacked bytes             |        11,126,844 |   11,114,879 |

Phase 0 reduces exact discovery bytes by 58.5% and instruction bytes by 81.8%.
The interim discovery payload remains 3,423 bytes over the final 15,000-byte
gate because the retained review tool still publishes the private workflow
envelope. Phase 2 deletes that protocol; Phase 3 measures the final three-tool
surface.

Post-unregistration tool parts:

| Tool                       | Full bytes | Description | Input schema | Output schema |
| -------------------------- | ---------: | ----------: | -----------: | ------------: |
| `get_salt_project_context` |      4,813 |         134 |          388 |         4,064 |
| `get_salt_reference`       |      2,609 |         278 |          810 |         1,300 |
| `review_salt_ui`           |     10,987 |         235 |        2,774 |         7,761 |

Phase 0 verification:

| Command                                      | Result                                                                                                                                                             |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `yarn typecheck:mcp`                         | exit 0                                                                                                                                                             |
| Phase 0 archival replay (retired in Phase 2) | exit 0; all 15 locked historical scenarios replayed; committed capture tree unchanged                                                                              |
| `yarn test:ai-tooling`                       | exit 0; 66 files and 746 tests passed                                                                                                                              |
| `yarn workspace @salt-ds/mcp build`          | exit 0                                                                                                                                                             |
| `yarn check:ai-tooling:pack`                 | exit 0; 20 files; 1,158,998 compressed bytes                                                                                                                       |
| `yarn smoke:consumer --skip-build`           | exit 0; exact tarball installed; ESM, CommonJS, declarations, skills, retained tools/resources, withdrawn-tool negatives, and a non-failure grounded review passed |

The known JPM foundation example gap is keyed by stable page ID
`page.salt-foundations-color-index`, has a maximum non-gating audit budget of
one, and reports current usage `1/1`. Zero gaps pass without rebaselining; any
different or additional gap fails.

The pinned SDK v2 codemod dry-run and manual migration inventory are recorded in
[`AI_MCP_PHASE0_SDK_V2_INVENTORY.md`](./AI_MCP_PHASE0_SDK_V2_INVENTORY.md).

## Limitations

- Latency is directional on one warm Windows host, not a universal cold-start
  benchmark.
- The existing offline guard was used to reproduce the packaged runtime but is
  itself known to permit ESM network built-ins. The baseline uses a committed
  historical snapshot so the negative reproduction remains stable when the
  current security control is fixed.
- No model, primary advertised host, editing session, compile, render,
  interaction, or accessibility run is represented.
- The exact tarball and its full npm dependency lock are committed. Replaying
  from an empty npm cache still requires registry access during installation;
  package versions and integrity values do not float.
- The retained review result still uses the private workflow envelope. It is an
  unreleasable Phase 0 intermediate scheduled for deletion in Phase 2, not a
  final public contract.
