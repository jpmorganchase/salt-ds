# Salt AI Tooling Evidence Gap Register

Status: active

Created: April 30, 2026

## Purpose

Track places where Salt AI tooling has useful behavior but the source evidence
is not yet structured enough for the world-class evidence standard.

This register is not a substitute for fixing the source docs, registry, rule
packs, or schemas. It exists so gaps stay visible instead of being hidden in
prompts, skills, command handlers, or generated context.

## Gap 1: Validation Rule Catalog Provenance

Area:

- `packages/semantic-core/src/tools/validation/issueCatalog.ts`
- `packages/semantic-core/src/tools/validateSaltUsage.ts`

Current state:

- The Salt usage validator already checks useful review issues.
- Some issue descriptors, messages, suggested fixes, and canonical sources are
  still encoded directly in TypeScript.
- Validation issues expose source URLs.
- Catalog-status issues now carry structured registry `SaltEvidenceRef` values
  for component status claims.
- Icon-only accessible-name review findings now derive their message, severity,
  and evidence refs from source-backed component accessibility rules in the
  registry. If a component has icon-only usage in code but the registry lacks a
  source-backed accessible-name rule, the validator records missing data instead
  of emitting a confident accessibility finding.
- Decorative-icon `aria-hidden` review findings now derive their message,
  severity, and evidence refs from source-backed component accessibility rules
  in the registry. If code has decorative icon usage but the component registry
  record lacks a source-backed `aria-hidden` icon rule, the validator records
  missing data instead of emitting a confident accessibility finding.
- Action-vs-navigation primitive-choice findings now derive their component
  names, guidance text, source URLs, and evidence refs from source-backed
  component usage and semantic guidance records in the registry. The old
  Button/Link descriptor for this rule has been removed from the validation
  catalog. If code uses a navigation target on a component whose registry record
  has action/navigation contrast guidance but the guidance lacks a source
  locator, the validator records missing data instead of emitting a confident
  primitive-choice finding.
- Action-vs-navigation handler findings now use the same source-backed
  component usage and semantic guidance records when a click handler appears to
  trigger navigation. The old Button/Link descriptor for
  `component-choice.navigation-handler` has been removed from the validation
  catalog. If the registry has the contrast guidance but lacks source locators,
  the validator records missing data instead of emitting a confident
  primitive-choice finding.
- Navigation-as-action findings now derive their component names, guidance text,
  source URLs, and evidence refs from source-backed component usage and semantic
  guidance records in the registry. The old Button/Link descriptor for
  `primitive-choice.link-action` has been removed from the validation catalog.
  If the registry has the contrast guidance but lacks source locators, the
  validator records missing data instead of emitting a confident
  primitive-choice finding.
- Native button/link and custom `role="button"`/`role="link"` recreation
  findings now derive their target component, component usage guidance, guide
  policy text, source URLs, and evidence refs from source-backed component and
  guide records in the registry. The old Button/Link descriptors for
  `primitive-choice.native-button`, `primitive-choice.native-link`,
  `primitive-choice.custom-button-role`, and
  `primitive-choice.custom-link-role` have been removed from the validation
  catalog. If the matching component or primitive-choice guide lacks
  source-backed evidence, the validator records missing data instead of
  emitting a confident primitive-choice finding.
- Raw HTML table recreation findings now derive candidate tabular components,
  component usage guidance, primitive-choice guide policy text, source URLs,
  and evidence refs from source-backed component and guide records in the
  registry. The old `primitive-choice.native-table` descriptor has been removed
  from the validation catalog. If tabular component guidance or the
  primitive-choice guide lacks source-backed evidence, the validator records
  missing data instead of emitting a confident primitive-choice finding.
- Nested interactive findings now derive the outer and inner interactive
  component identities, component guidance, composition guide policy text,
  source URLs, and evidence refs from source-backed component and guide records
  in the registry. The old `composition.nested-interactive-primitives`
  descriptor has been removed from the validation catalog. If either component
  guidance or the composition guide lacks source-backed evidence, the validator
  records missing data instead of emitting a confident composition finding.
- Pass-through wrapper findings now derive the wrapped component identity,
  custom-wrapper guide policy text, optional composition-pitfall guide support,
  source URLs, workflow-input match evidence, and evidence refs from
  source-backed registry records. The old
  `composition.pass-through-wrapper` descriptor has been removed from the
  validation catalog. If the wrapped component or custom-wrapper guide lacks
  source-backed evidence, the validator records missing data instead of
  emitting a confident composition finding.
- Active token-policy findings now derive token names, token policy guidance,
  token pairing roles, structural roles, deprecation fields, source URLs, token
  recommendation hints, and evidence refs from registry token records plus the
  workflow input that contained the matched styling. The old token descriptors
  have been removed from the validation catalog. If hardcoded value, direct-use,
  fixed-thickness, container-pairing, separator, or deprecated-token evidence is
  missing from registry token data, the validator records missing data instead
  of emitting a confident token finding. Unknown registry-looking token findings
  are emitted from workflow-input evidence only and do not invent registry refs
  for absent token names.
- The legacy validation issue catalog no longer contains active issue
  descriptors, source URL fallbacks, or catalog issue builders. The remaining
  module exports only guide lookup identifiers used to resolve source-backed
  guide records.
- Token lookup, token recommendation, token search indexing, MCP source
  attribution, and starter validation no longer add the design-token overview
  route as a fallback source. Token docs and source URLs now come from registry
  token policy docs; when token docs are missing, the tools return empty or
  null sources and starter validation records missing data for workflow-input
  token names.
- The token-policy registry builder now discovers policy doc routes from
  source-backed MDX docs and token CSS foundation categories, then emits
  `policy.evidence_refs` for every generated `policy.docs` route. Build tests
  fail when a generated token policy doc lacks a matching source-backed docs
  evidence ref.
- Token-policy tier claims, generated policy prose, and direct-use values are
  now derived from source-backed design-token docs. The builder fails closed
  when the overview evidence needed for palette, characteristic, or foundation
  direct-use claims is absent.
- Token-policy preferred/avoid/note text now comes from cited docs. Build tests
  fail if generated token policy prose cannot be found in the docs cited by
  that token policy.
- Token-policy structural roles are now retained only when token names and
  cited source docs support the role, such as container pairing, separable
  separator roles, fixed border/separator sizing, and border-style variants.
- Token-policy structural roles now flow through an explicit source-backed
  structural-role rule map in the semantic-core token-policy source registry.
  If those role rules are missing, generated token policies omit structural
  roles and pairings instead of inferring validator-facing claims.
- Token-policy structural-role rules are now serialized as a semantic-core
  registry rule-pack artifact with rule matchers, emitted role templates,
  source excerpts, and source-backed `SaltEvidenceRef` values. `buildRegistry`
  writes `token-policy-structural-role-rules.json`, and the shared registry
  loader exposes it so CLI/MCP consumers can inspect rule provenance directly.
- Registry-aware generated-artifact validation can require token structural
  role and pairing claims to resolve to the serialized structural-role
  rule-pack evidence. The validator now resolves that rule pack directly from
  the loaded registry when no explicit validation option is supplied. If the
  rule pack is missing, structural-role claims fail validation instead of
  relying only on generated policy fields.
- Token-policy validator findings for fixed border/separator thickness,
  container pairing, and separator color now require source-backed structural
  role rule-pack evidence. If the rule pack is absent or cannot resolve the
  role, the validator records missing data instead of emitting those confident
  findings.
- A tiny fixture-only rule pack proves that validator findings can be emitted
  from source-backed rule-pack data.
- Rule-pack validation now fails closed when a component JSX attribute match
  names a prop absent from the registry and lacks docs/source/example evidence.
- Some production validation and workflow presentation paths still need broader
  rule-pack provenance and generated-report wiring, but active validator
  findings covered by this gap now either carry structured `SaltEvidenceRef`
  values or record missing data.
- Some foundation token categories, including alpha, animation, and curve, do
  not currently have category-specific foundation docs. The token-policy
  builder falls back to generic foundation overview/index evidence for those
  categories and does not add category-specific preferred/avoid claims beyond
  cited source text.

Why this matters:

- Hardcoded rule descriptions can drift from Salt docs and registry metadata.
- Review reports and generated context need structured evidence refs for every
  Salt-specific claim.
- Accessibility and composition checks should be data-driven rule packs, not
  command-level logic.

Target state:

- Rule definitions move into registry-derived or source-backed rule packs.
- Each rule carries:
  - rule id
  - claim kind
  - applicable registry entities or categories
  - canonical docs/source/example refs
  - validation strategy
  - false-positive guidance when supported by evidence
- `validateSaltUsage` emits structured `SaltEvidenceRef` values alongside or
  instead of loose `canonical_source` and `source_urls` fields.

Do not do:

- Do not add new hardcoded Salt facts to the validator while closing this gap.
- Do not patch missing docs with skill or prompt guidance.
- Do not emit confident accessibility, composition, prop, token, or provider
  claims without a source-backed rule ref.

Suggested next slice:

- Wire CLI/MCP generated context and review-report presentation paths to pass
  semantic-core generated-artifact validation over compact context/report
  outputs before they are returned, now that the validator can read the
  serialized token-policy structural-role rule pack from the loaded registry.
- Add category-specific docs or registry records for foundation token families
  that currently resolve only to generic foundation overview/index evidence.
- Wire review-report serializers into CLI/MCP presentation paths so compact
  review outputs can expose unsupported states as consistently as the
  semantic-core prototype.
- Add structured false-positive guidance only when it is backed by Salt docs,
  source, examples, or explicit project policy.

## Gap 2: Generated Context And Report Coverage

Area:

- `packages/semantic-core/src/contextArtifacts.ts`
- `packages/semantic-core/src/contextChecks.ts`
- `packages/semantic-core/src/contextManifest.ts`
- `packages/semantic-core/src/contextPackSelection.ts`
- `packages/semantic-core/src/build/buildRegistry.ts`
- `packages/semantic-core/src/registry/artifacts.ts`
- `packages/semantic-core/src/registry/fingerprint.ts`
- `packages/semantic-core/src/registry/loadRegistry.ts`
- `packages/semantic-core/src/reviewReportArtifacts.ts`
- `packages/semantic-core/src/reviewReports.ts`
- `packages/semantic-core/src/generatedArtifactSurface.ts`
- `packages/semantic-core/src/generatedArtifactValidation.ts`
- `packages/semantic-core/schemas/salt-context-component.schema.json`
- `packages/semantic-core/schemas/salt-context-component-check.schema.json`
- `packages/semantic-core/schemas/salt-generated-context-health.schema.json`
- `packages/semantic-core/schemas/salt-context-pack-manifest.schema.json`
- `packages/semantic-core/schemas/salt-review-report.schema.json`
- `packages/semantic-core/schemas/salt-pattern-validation-rule-pack.schema.json`
- `packages/cli/src/commands/exportContext.ts`
- `packages/cli/src/commands/doctor.ts`
- `packages/cli/src/lib/generatedContext.ts`
- `packages/cli/src/lib/infoContext.ts`
- `packages/mcp/src/server/registerResources.ts`
- `packages/mcp/src/server/serverMetadata.ts`
- `packages/mcp/src/server/toolDefinitions.ts`
- `packages/skills/salt-ds/references/shared/surfaces.md`

Current state:

- Component context artifact generation is a Release 0 prototype.
- It emits claims for component name, package, status, import export name,
  summary, props, accessibility summary lines, and source-backed examples only
  when those fields exist in the registry.
- Missing component export names, accessibility summaries, and example source
  URLs are recorded as `unsupported_claims` instead of invented guidance.
- Component context now has a schema-validated `salt_context_component_v1`
  serializer in semantic-core. The context payload carries evidence refs next
  to emitted component facts and includes the same `surface_gate`,
  `generated_artifact`, `evidence_refs`, and `unsupported_claims` used by the
  generated-artifact guardrail.
- Review report artifact generation is a prototype over existing validation
  issues. Findings with structured evidence refs become generated claims;
  findings without refs become unsupported report states.
- Registry-aware artifact validation now rejects generated claims that point to
  missing registry entities or missing registry fields for fixture props,
  tokens, imports, examples, statuses, and accessibility fields.
- Semantic-core now exposes a shared generated-artifact surface gate that wraps
  registry evidence validation and unsupported-claim accounting. Component
  context artifacts and review reports use this shared gate instead of owning
  separate release checks.
- CLI durable review reports now use the shared semantic-core review report
  serializer. The report includes source-backed evidence refs when findings
  resolve to registry evidence, and it degrades to an unsupported report state
  when report claims cannot be validated.
- MCP full review output now includes the same shared semantic-core review
  report serializer under its review artifacts. Source-backed findings carry
  evidence refs, and undocumented report claims degrade to unsupported states.
- CLI durable review reports and MCP full-view review report artifacts are now
  validated against the shared `salt_review_report_v1` JSON schema in tests,
  including the nested generated-artifact and evidence-ref schemas.
- Component context payloads are now validated against the shared
  `salt_context_component_v1` JSON schema in tests, including the nested
  generated-artifact and evidence-ref schemas.
- CLI now exposes a narrow `export-context --component <name-or-id>` command
  for explicit component context export. It resolves the component from the
  registry and emits the semantic-core `salt_context_component_v1` payload
  without adding CLI-owned Salt facts.
- CLI `export-context --check` can compare an explicit generated component
  context file against a fresh semantic-core registry rebuild. It reports
  `current`, `stale`, or `unsupported` and treats unsupported source evidence
  as degraded rather than current.
- Semantic-core now exposes a schema-validated
  `salt_context_pack_manifest_v1` context manifest serializer for explicit
  component exports. Manifest entries keep Salt component facts minimal and
  include EvidenceRef ids that resolve the component identity back to the
  generated component context.
- CLI `export-context --manifest` writes or updates the context manifest from
  the shared semantic-core manifest serializer instead of hand-authoring
  component facts in the CLI.
- `info --json` now reports generated context manifest health for the default
  `.salt/context/manifest.json`, including current/stale/unsupported/invalid
  state, missing generated outputs, registry snapshot drift, and a recommended
  follow-up action.
- Component context staleness checks and generated-context manifest health now
  have shared semantic-core serializers and schemas. CLI `export-context
--check`, `info --json`, and `doctor --json` delegate to those contracts
  instead of owning separate status logic.
- CLI `doctor` now includes generated-context health and a diagnostic check for
  missing/current/stale/unsupported/invalid generated context. Stale, invalid,
  or unsupported generated context is reported as degraded support, not as a
  canonical Salt workflow blocker.
- Semantic-core now materializes deterministic registry fingerprints from the
  loaded registry payload. Component context, context manifests,
  generated-context health, CLI checks, doctor, and MCP context resources carry
  the same registry `hash` alongside version and generated-at metadata.
- Shared review report serializers now materialize deterministic registry
  fingerprints by default, so CLI durable reports, CLI full review output, MCP
  full review artifacts, and compact review release gates validate against the
  same source registry snapshot without caller-owned hash wiring.
- CLI `doctor --bundle` now writes generated-context health,
  generated-context manifest when present, and a compact generated-context
  check summary into the support bundle. These artifacts are status and
  provenance surfaces only; they do not add Salt API facts.
- Semantic-core now owns default context-pack component selection. CLI
  `export-context --manifest` can export the default selected component pack
  into `.salt/context/components` or an explicit `--output-dir`; selected
  component entries still degrade to unsupported when registry evidence is
  missing.
- MCP now exposes generated context through shared semantic-core resource
  payloads: `salt://context/manifest`, `salt://context/health`,
  `salt://context/component/{name}`, and
  `salt://context/component/{name}.context.md`. The capability manifest
  advertises those resources.
- Default generated context manifests record unsupported coverage gaps for
  missing or unsupported generated artifacts instead of generating those
  surfaces from prompt guidance. The default pack now includes selected
  component, pattern, foundation, prompt, and host-instruction artifacts when
  semantic-core can back them with registry/source EvidenceRefs; remaining gaps
  are product coverage states only and do not introduce Salt component, prop,
  token, accessibility, import, or example facts.
- Component markdown bridge files are now generated from the shared
  `salt_context_component_v1` serializer rather than from prompt text. The
  bridge preserves `EvidenceRef` markers for component names, packages,
  statuses, imports, summaries, props, accessibility summaries, examples, and
  example source lines.
- Default context-pack manifests now include component JSON entries, component
  markdown bridge entries, selected pattern and foundation entries, and
  source-backed prompt/host-instruction entries. The previous default prompt and
  host-instruction unsupported gaps are omitted only when those semantic-core
  artifacts validate with EvidenceRefs.
- Generated-context health now reads generated outputs in addition to the
  manifest. CLI checks mark missing, stale, invalid, or unsupported JSON and
  Markdown outputs as degraded instead of trusting manifest entries alone. MCP
  virtual resources mark their semantic-core resource outputs current because
  they are generated in-memory from the same registry snapshot.
- Generated-context health now exposes stored/current registry hashes plus
  unsupported coverage-gap counts so `info`, `doctor`, and MCP health resources
  can distinguish stale evidence from unsupported context-pack surface coverage.
- CLI full review JSON now includes the same schema-validated
  `salt_review_report_v1` artifact that `--report` writes durably, preserving
  parity between compact gating, durable report files, and full transport
  output.
- Durable review reports now expose the shared generated-artifact release check
  as `surface_gate`; the older `evidence_validation` field is retained as a
  compatibility mirror derived from that same gate.
- Compact CLI review output now receives the registry-aware public-contract
  evidence gate. Existing review findings that still lack enough source-backed
  evidence are reported as partial or unsupported instead of canonical complete.
- CLI `review --validate <report.json>` now recomputes the shared
  semantic-core review-report evidence gate against the current registry
  snapshot and reports current, stale, unsupported, or invalid without trusting
  the report's embedded mirrors.
- Generated context export currently covers explicit component JSON, default
  selected release-ready component-pack JSON, component markdown bridges,
  selected release-ready pattern JSON, selected source-backed foundation token
  JSON, prompt/host-instruction surfaces, and manifest files in CLI. MCP exposes
  the same shared semantic-core generated context surfaces through component
  JSON, component markdown, pattern JSON, foundation token JSON, manifest,
  health, release-gate, and context-pack bundle resources.
- Pattern context generation now uses semantic-core registry pattern records
  for pattern names, statuses, summaries, usage arrays, composition entries,
  optional build/how-it-works arrays, resources, optional accessibility
  summaries, and source-backed examples. Missing required summaries,
  primary-usage arrays, composition, or example source URLs remain unsupported
  claims; missing optional build/how-it-works, when-not-to-use, or accessibility
  sections are omitted from generated claims and recorded as coverage-audit
  docs/registry gaps instead of prompt guidance.
- Foundation context generation now uses semantic-core token registry and
  token-policy records for token names, categories, types, values, semantic
  intent, deprecation state, guidance, policy tier, direct-use policy,
  preferred/avoid/notes text, policy docs, structural roles, and pairings.
  Structural-role and pairing claims still require the serialized
  token-policy structural-role rule pack; missing rule evidence degrades the
  foundation context.
- MCP now exposes a `salt_context_pack_bundle_v1` resource. It is a portable
  resource payload with exact file text and manifest entries; actual durable
  file persistence remains host-action-required because the MCP resource
  transport does not write project files.
- Prompt and host instruction defaults now have schema-validated
  `salt_context_prompt_instruction_surface_v1` semantic-core artifacts. Their
  workflow-boundary claims resolve to source EvidenceRefs from the salt-ds skill
  prompt contracts and bootstrap instruction templates; they do not embed
  prompt-owned component, prop, token, import, example, status, or accessibility
  facts.
- Semantic-core now exposes a `salt_context_coverage_audit_v1` audit for
  selected component, pattern, and foundation context coverage. The audit runs
  the same serializers used by CLI and MCP context packs, then records docs or
  registry gaps instead of filling missing evidence with generated guidance.
- MCP now advertises and serves the context coverage audit resource, and the
  context-pack bundle includes source-backed prompt and host-instruction
  surfaces next to the other generated files. Default prompt/host instruction
  surfaces no longer appear in `unsupported_surfaces` when their EvidenceRefs
  validate.
- Review-report guardrail tests now cover undocumented fixture props, tokens,
  imports, examples, statuses, and accessibility claims at the durable report
  layer. Compact MCP review output also degrades when the shared review-report
  evidence gate finds unsupported evidence.
- CLI `export-context --coverage` now emits the shared
  `salt_context_coverage_audit_v1` payload so production component, pattern, and
  foundation docs/registry gaps can be inventoried without adding generated Salt
  facts.
- Default context-pack selection now admits only release-ready component and
  pattern records whose generated claims can pass the shared evidence surface
  gate. Records with missing optional component accessibility or pattern
  build/how-it-works/when-not/accessibility sections are tracked by
  `salt_context_coverage_audit_v1` instead of being emitted as unsupported
  default-pack artifacts.
- Component accessibility summaries now prefer the documented best-practices
  section when present, then fall back to source-backed component
  accessibility docs after removing keyboard-interaction reference sections.
  This closes source-backed accessibility summary gaps without adding prompt,
  CLI, MCP, skill, or test-owned Salt product facts.
- Pattern docs extraction now keeps source-backed statements from nested
  subsections under the requested section. This closes pattern context
  `how_to_build` gaps when the canonical docs place the actual guidance under
  nested headings such as anatomy or layout sections.
- Semantic-core now defines a `salt_context_pack_persistence_check_v1` contract
  for host-side context-pack persistence. It checks exact manifest and bundle
  file text from caller-supplied file snapshots, records missing or stale
  outputs, and keeps MCP bundle persistence host-action-required.
- First-load skill, prompt, CLI help, MCP instruction, and generated host
  instruction surfaces now avoid hardcoded provider/theme defaults, sample
  entity names, and hardcoded MCP tool counts. Provider/theme bootstrap remains
  pending or unsupported unless workflow evidence, registry-backed generated
  context with evidence refs, `.salt` project policy, or explicit user input
  supplies the facts.
- Common-surface skill guidance now avoids naming production Salt patterns or
  components as generic prompt advice. Surface guidance tells agents to retrieve
  source-backed workflow/context evidence before naming Salt targets.
- A production context coverage audit test now builds the real registry, writes
  a durable `salt_context_coverage_audit_v1` JSON report, validates it against
  schema, verifies that any missing component, pattern, or foundation evidence
  appears as docs/registry gaps rather than generated Salt guidance, and checks
  that default selected component/pattern/foundation artifacts have zero
  unsupported generated claims.
- A component registry extraction guardrail uses tiny fixture docs to prove
  that accessibility summaries can be extracted from source-backed component
  accessibility docs without a best-practices heading, that keyboard reference
  tables are not promoted into guidance claims, and that generated context
  accessibility claims resolve through registry EvidenceRefs.
- A keyboard-only component accessibility fixture proves that source docs with
  no extractable non-keyboard accessibility guidance remain explicit
  docs/registry gaps, with no generated accessibility claims.
- Markdown extraction guardrails use tiny fixture sections to prove nested
  subsection guidance stays inside the requested source-backed section and that
  prose before an example lead-in can become a claim without promoting the
  example code itself.
- Pattern registry extraction now fills missing `how_it_works` context only
  from source-backed non-generic pattern documentation sections, while keeping
  explicit `How it works` sections authoritative. Fixture tests prove those
  generated pattern behavior claims resolve through registry EvidenceRefs.
- A fresh production coverage audit after the parser closure records 49
  explicit unsupported docs/registry gaps: 11 component non-keyboard
  accessibility guidance gaps, 28 pattern optional or unsupported context gaps,
  and 10 foundation token policy or structural-rule gaps. Stable component
  source/docs locator gaps are currently clear.
- A fresh production coverage audit after the pattern behavior extraction
  closure still records 49 explicit unsupported docs/registry gap records, but
  no pattern gap now reports missing `how_it_works` guidance. Remaining pattern
  gaps are 24 missing accessibility summaries, 10 missing `when_not_to_use`
  guidance entries, 2 missing `how_to_build` guidance entries, and 3 selected
  non-default pattern contexts with unsupported missing-evidence claims.
- Foundation token structural-role rule packs now serialize multiple
  source-backed separable sections when the docs contain distinct static and
  feedback separator evidence. The separable foundation context now validates
  through rule-pack EvidenceRefs instead of carrying unsupported structural-role
  evidence.
- Foundation token policy source indexing now associates foundation docs with
  exact token families cited in those docs, even when the page route uses a
  broader foundation name. `layout` policy now resolves through the responsive
  layout-grid docs, and `shadow` policy now resolves through the elevation docs;
  generated policy prose is still checked against cited docs.
- A fresh production coverage audit after token-family docs indexing records
  47 explicit unsupported docs/registry gaps. Foundation gaps are down to 8
  token families that still lack token policy docs or source-backed policy
  evidence: delay, differential, draggable, icon, measured, opacity, taggable,
  and track.
- Deprecated token policy extraction now reads inline source-backed token
  replacement comments of the form `Use --salt-*` and only generates replacement
  policy metadata when the replacement token resolves to cited docs. Deprecated
  icon-size tokens now resolve through the size foundation docs, design-token
  overview docs, and token CSS source EvidenceRefs instead of leaving the
  `icon` token family as an unsupported policy gap.
- A fresh production coverage audit after deprecated replacement policy
  extraction records 46 explicit unsupported docs/registry gaps: 11 component
  gaps, 28 pattern gaps, and 7 foundation gaps. Remaining foundation token
  policy gaps are delay, differential, draggable, measured, opacity, taggable,
  and track.
- Deprecated token replacement extraction now also supports source-backed
  section-scoped category replacement comments. The deprecated delay tokens
  resolve to current duration tokens only when the derived replacement token
  exists in the registry and its docs can be cited. `delay` now resolves through
  the duration foundation docs, design-token overview docs, and deprecated
  token CSS source EvidenceRefs.
- A fresh production coverage audit after section-scoped replacement extraction
  records 45 explicit unsupported docs/registry gaps: 11 component gaps, 28
  pattern gaps, and 6 foundation gaps. Remaining foundation token policy gaps
  are differential, draggable, measured, opacity, taggable, and track.
- Deprecated token replacement indexing now also reads source-backed package
  changelog replacement tables, direct replacement diff blocks, and deprecated
  token CSS `Use --salt-*` comments into the semantic-core policy source
  registry. Replacement chains only resolve when the final token has cited
  docs. This closes the `differential` and `draggable` token families, and
  partially closes source-backed `measured`, `taggable`, and `track` tokens.
  `opacity` remains unsupported because the replacement evidence does not
  resolve to current token policy docs.
- A fresh production coverage audit after changelog-backed replacement
  indexing records 43 explicit unsupported docs/registry gaps: 11 component
  gaps, 28 pattern gaps, and 4 foundation gaps. Remaining foundation token
  policy gaps are measured, opacity, taggable, and track.
- Theme-owned deprecated token replacement metadata now lives in
  `packages/theme/css/deprecated/token-replacements.json` and is read by
  semantic-core before legacy changelog/CSS parsing. The metadata entries are
  backed by existing changelog or token CSS sources, and generated policy
  EvidenceRefs cite the metadata file as token source evidence. Legacy
  changelog/CSS extraction remains as a transition fallback for replacements
  not yet represented in metadata.
- Review public-contract evidence degradation is now checked for both CLI and
  MCP compact output using the same semantic-core serializer path, so unresolved
  EvidenceRefs cannot appear complete in one transport and partial in the other.
- Expected-pattern review validation now uses a semantic-core pattern
  validation rule pack built from source-backed registry pattern starter
  scaffold records. Supported starter-template import rules emit
  workflow-input, pattern-rule, and component EvidenceRefs. Source-backed
  starter region and build-around rules are validated as text-presence checks
  with rule-pack EvidenceRefs. Preserve constraints and pattern accessibility
  summaries are recorded as unsupported rule-pack gaps until semantic-core has
  validators for those behaviors.
- `buildRegistry` now writes the rule pack as
  `pattern-validation-rules.json`, `loadRegistry` exposes it as
  `pattern_validation_rule_pack`, and review validation prefers that persisted
  semantic-core artifact before falling back to runtime construction for older
  registries.
- CLI create-report comparison now carries expected-pattern unsupported
  rule-pack gaps through the shared semantic-core review contract instead of
  dropping them when no explicit drift issue is emitted.
- Expected-target parity is now tested across semantic-core review, CLI compact
  and full review output, MCP compact and full review output, CLI durable
  review reports, and MCP full-view review-report artifacts.
- Generated-artifact release gates now use shared semantic-core evidence
  validation for any generated artifact kind, including component context,
  review reports, validation reports, prompts, instructions, pattern context,
  and foundation context. CLI `export-context --release-gate` can validate a
  single generated artifact wrapper, a context-pack manifest, or a directory of
  generated JSON files. Manifest and directory gates aggregate unsupported
  generated artifacts, validation issues, and explicit coverage gaps instead of
  passing context packs with undocumented prompt, instruction, or unsupported
  surface claims.
- The final release-gate sweep tightened stale and generated-doc handling:
  generated artifacts with real `sha256:` registry fingerprints now block when
  the current registry fingerprint differs; manifest gates rebuild component
  Markdown bridges from their source component context and block tampered or
  stale Markdown; directory gates block stray JSON files that do not contain a
  `salt_generated_artifact_v1` payload instead of silently ignoring them.
  These checks add no Salt product facts; they only enforce provenance,
  current registry state, and unsupported coverage gaps.
- `salt-ds init --ai` and `salt-ds doctor --ai` now expose a
  schema-validated `salt_ai_setup_v1` summary from semantic-core. The setup
  summary reports repo policy, managed repo instructions, requested host
  adapters, `ui:verify`, generated context health, release-gate readiness, and
  doctor readiness as setup state and commands. It does not add Salt component,
  prop, token, import, example, status, or accessibility facts.
- MCP now advertises and serves shared semantic-core resources for AI setup and
  context release-gate state. The default context release gate validates the
  `salt_context_pack_bundle_v1` generated artifacts and now passes when the
  selected pack contains only release-ready source-backed generated artifacts.
  Explicit manifest coverage gaps are still carried forward as blocked
  release-gate gaps rather than being treated as complete.
- `salt_ai_setup_v1` now includes a compatibility matrix derived from the same
  setup steps used by CLI, doctor, and MCP. Compatibility is setup/runtime
  state only; it does not add Salt product facts and keeps missing policy,
  context, host-adapter, `ui:verify`, and release-gate prerequisites explicit.
- Durable `salt_review_report_v1` payloads now embed the shared generated
  artifact release gate for the report artifact. `review --validate` recomputes
  surface evidence, evidence-validation mirrors, and release-gate state against
  the current registry before reporting a saved report as current.
- `review --validate` now returns a nested `salt_review_resume_v1` contract.
  Resume state reuses only EvidenceRef ids from current, source-backed reports;
  stale, unsupported, or invalid saved reports expose missing data instead of
  allowing their Salt claims to be reused.
- CLI `review --resume` and MCP `resume_salt_review` now expose that same
  shared semantic-core resume contract. MCP `validate_salt_review_report` and
  CLI `review --validate` use the same report validator rather than
  transport-owned status logic.
- Runtime EvidenceRefs now fail validation when they lack an explicit runtime
  locator such as source URL, repo path, or captured runtime section. Runtime
  observations remain workflow evidence; they do not become Salt component,
  prop, token, import, example, status, or accessibility facts without
  registry/source-backed support.
- Stable components missing generated-context source or docs locators are now
  recorded as component docs/registry gaps. Selected component contexts that
  fail the shared surface gate remain unsupported instead of being patched with
  generated guidance.
- Pattern validation rule packs now record source-backed starter region-order
  records as unsupported gaps until semantic-core has rendered order/layout
  validators. Region names still come from registry starter-scaffold records and
  carry pattern-rule EvidenceRefs.
- CLI migration and upgrade `--report` now write a shared
  `salt_workflow_followup_report_v1` from semantic-core. Migration reports carry
  workflow-input, verification-contract, and runtime EvidenceRefs when present;
  upgrade reports carry workflow-input or package EvidenceRefs for the requested
  target. CLI `migrate` and `upgrade` can attach a `salt_review_report_v1`
  through `--review-report`; the shared review-report validator decides whether
  that evidence is current, stale, unsupported, or invalid. Reports remain
  degraded when review evidence is missing, become ready when attached review
  evidence is current and supported, and become unsupported when attached review
  evidence is stale, invalid, or unsupported.
- Semantic-core now emits a `salt_ai_evidence_closure_report_v1` final-pass
  closure report with the evidence-closure slices, zero generated Salt claims,
  explicit docs/registry gaps, and a generated-artifact release gate.
  CLI `doctor --ai` can include the report, and MCP serves it as
  `salt://setup/ai/evidence-closure`.
- MCP artifact persistence now has explicit release-gated write tools.
  `persist_salt_context_pack` writes the selected generated context pack to
  project-local durable files only after the shared semantic-core context-pack
  release gate passes, then returns the shared exact-text
  `salt_context_pack_persistence_check_v1`. `persist_salt_generated_artifact`
  writes review, validation, setup, closure, or other generated artifact
  payloads only after `salt_generated_artifact_release_gate_v1` validates their
  EvidenceRefs. Blocked or invalid generated artifacts are returned as blocked
  persistence states and are not written.
- Broader non-selected context surfaces, production pattern optional
  docs/registry gaps that are intentionally omitted from default-pack claims,
  component accessibility docs with no extractable non-keyboard guidance,
  foundation token families without policy docs or source-backed policy
  evidence, migration or upgrade follow-up reports without current review
  evidence, and host-specific attachment stores beyond project-local MCP writes
  are still unsupported or degraded states.
- Final verification on May 4, 2026 reran the Salt AI guardrail suite and a
  fresh production context coverage audit. Supported generated context,
  reports, validators, CLI/MCP serializers, and skill surfaces remained
  evidence-gated. That audit reported 45 explicit unsupported
  docs/registry gaps: 11 component gaps, 28 pattern gaps, and 6 foundation
  gaps. The remaining selected pattern contexts with unsupported claims are
  `Header block`, `Indication`, and `List filtering`; the remaining foundation
  token-policy gaps are `differential`, `draggable`, `measured`, `opacity`,
  `taggable`, and `track`.
- Final token-gap verification on May 4, 2026 reran the semantic-core
  token-policy fixtures, rebuilt the production registry, and reran the
  production context coverage audit. The audit now reports 43 explicit
  unsupported docs/registry gaps: 11 component gaps, 28 pattern gaps, and 4
  foundation gaps. The remaining foundation token-policy gaps are `measured`,
  `opacity`, `taggable`, and `track`.
- Theme metadata verification on May 4, 2026 confirmed source-backed generated
  policies cite `packages/theme/css/deprecated/token-replacements.json`
  EvidenceRefs, while unresolved replacements such as opacity remain
  unsupported rather than becoming generated token policy claims.
- Deprecated token replacement metadata validation on May 5, 2026 added a
  shared semantic-core schema for `token-replacements.json` and explicit
  `manual` or `unsupported` metadata states for remaining raw-value,
  non-exact, or missing-doc token replacement cases. Manual and unsupported
  metadata records are gap evidence only; they do not emit generated token
  policy replacement facts. The fresh production audit still reports 43
  explicit unsupported docs/registry gaps: 11 component gaps, 28 pattern gaps,
  and 4 foundation gaps. The remaining foundation gaps are `measured`,
  `opacity`, `taggable`, and `track`.
- CSS token declaration evidence validation on May 5, 2026 added a generic
  semantic-core index of current theme CSS token declarations for final
  deprecated replacement targets. The index can support replacement policy only
  when the final token has a current CSS declaration plus policy docs; deprecated
  final declarations, raw literal replacements, and manual or unsupported
  metadata states remain unsupported. A fresh production audit still reports 43
  explicit unsupported docs/registry gaps: 11 component gaps, 28 pattern gaps,
  and 4 foundation gaps. `track` and `measured` each gained source-backed
  typography replacement evidence for their `fontWeight` tokens, and one
  `taggable` palette replacement now resolves through current CSS token
  declarations. Raw-value, deprecated-only, and non-exact replacement cases
  remain unsupported.
- Foundation gap granularity on May 5, 2026 extended the shared
  `salt_context_coverage_audit_v1` schema with token-level unsupported records
  under each docs/registry gap. A fresh production audit still reports 43
  explicit unsupported docs/registry gaps: 11 component gaps, 28 pattern gaps,
  and 4 foundation gaps. The 4 remaining foundation gaps now carry registry
  token records and machine-readable reasons instead of only category names:
  `measured` has 12 unsupported token records, `opacity` has 11, `taggable` has
  7, and `track` has 4. The unresolved reasons are deprecated token references
  without source-backed policy records and deprecated raw token values without
  source-backed policy records. The exact token records remain in the generated
  audit output rather than being converted into prompt guidance or replacement
  claims.
- Deprecated CSS value-reference closure on May 5, 2026 added source-backed
  token evidence for deprecated declarations whose value is a single
  `var(--salt-...)` reference and which do not already have explicit replacement
  evidence from metadata, changelog, or inline comments. Explicit replacement
  sources still take precedence over fallback declaration values. A fresh
  production audit now reports 42 explicit unsupported docs/registry gaps: 11
  component gaps, 28 pattern gaps, and 3 foundation gaps. The remaining
  foundation gap records are 3 measured token records, 11 opacity token records,
  and 1 track token record. Taggable token-reference records now resolve through
  source-backed deprecated CSS declarations, current token declarations, and
  token policy docs. Raw-value tokens and references whose final replacement
  target lacks source-backed policy evidence remain unsupported.
- Remaining foundation gap classification on May 5, 2026 inspected the 15
  token records in the fresh production audit against registry token records,
  deprecated token metadata, theme CSS declarations, and changelog evidence.
  There are no further source-closeable records in this pass. `measured`
  retains `--salt-measured-fill-disabled` and
  `--salt-measured-foreground-activeDisabled` because their referenced palette
  targets are deprecated-only and the metadata records no exact source-backed
  replacement token; `--salt-measured-textAlign` remains a literal-value chain
  through `--salt-track-textAlign`. `track` retains `--salt-track-textAlign`
  because the source-backed metadata gives literal `center` guidance rather than
  an exact replacement token. `opacity` retains `--salt-opacity-0`,
  `--salt-opacity-1`, `--salt-opacity-2`, `--salt-opacity-3`,
  `--salt-opacity-4`, `--salt-opacity-8`, `--salt-opacity-15`,
  `--salt-opacity-25`, `--salt-opacity-40`, `--salt-opacity-45`, and
  `--salt-opacity-70` because the tokens are deprecated raw values or scale
  replacements whose final records still lack source-backed generated policy
  docs. These remain docs/registry gaps, not prompt guidance or replacement
  claims.
- Foundation token gap cause ledger on May 7, 2026 now records source-backed
  unsupported policy causes on registry token records as `policy_gap` metadata.
  The fresh production audit remains at 20 explicit unsupported docs/registry
  gaps: 17 pattern gaps and 3 foundation gaps. The 15 foundation token records
  now carry EvidenceRef IDs resolving to token replacement metadata and, where
  applicable, source-backed replacement-chain evidence. `measured` and `track`
  distinguish literal/manual or missing exact replacement-token causes;
  `opacity` distinguishes missing source-backed policy docs for deprecated
  opacity scale tokens. Generated token `policy` remains `null` for these
  records, so CLI, MCP, skill, reports, and validators keep the token policy
  state unsupported instead of emitting replacement guidance.
- Pattern docs example extraction on May 5, 2026 now derives pattern example
  records from source-backed pattern MDX `Diagram`, `ImageSwitcher`, and
  `LivePreview` tags when frontmatter resources have not already populated the
  pattern record. A fresh production audit now reports 40 explicit unsupported
  docs/registry gaps: 11 component gaps, 26 pattern gaps, and 3 foundation
  gaps. The selected pattern context surface-gate gaps for `Header block` and
  `List filtering` are closed through docs-derived example EvidenceRefs
  resolving to their pattern overview docs. `Indication` remains the only
  selected unsupported pattern context because the source-backed docs, Storybook
  examples, and resources do not provide explicit `when_to_use` guidance; this
  remains a docs/registry gap, not generated pattern guidance.
- Selected pattern surface-gate classification on May 5, 2026 now carries
  unsupported pattern-claim records under selected pattern context gaps. The
  production audit remains at 40 explicit unsupported docs/registry gaps: 11
  component gaps, 26 pattern gaps, and 3 foundation gaps. The `Indication`
  selected context gap now records `pattern.indication.when_to_use.unsupported`
  with reason code `evidence_surface_gate_failed`, missing `when_to_use`, and
  reason `Registry pattern when_to_use guidance is empty.` Generic pattern topic
  sections such as status, sentiment, progression, and urgency remain
  `how_it_works` behavior evidence and are not promoted into generated
  `when_to_use` guidance.
- Pattern accessibility summary extraction on May 5, 2026 now prefers explicit
  `Accessibility` sections, then only source-backed pattern MDX statements with
  explicit accessibility markers such as ADA/WCAG, screen reader, keyboard
  users, browser zoom, visually impaired user, or explicit accessibility
  language. A fresh production audit now reports 35 total explicit unsupported
  docs/registry gaps: 11 component gaps, 21 pattern gaps, and 3 foundation gaps.
  Pattern accessibility summary gaps closed for `App header`, `Button bar`,
  `Forms`, `List builder`, `Selectable card`, and `Wizard` through registry
  EvidenceRefs resolving to their source-backed pattern docs. Generic
  availability statements such as "accessible from any page" or visual
  focus/layout prose are not promoted into accessibility summaries. Analytical
  dashboard, Search, and the remaining undocumented pattern accessibility
  surfaces stay as docs/registry gaps.
- Remaining context coverage triage on May 5, 2026 added
  `ai-tooling-context-gap-catalog.md`, a semantic-core audit-derived catalog of
  the 35 current docs/registry gaps and their cause codes. No additional
  production Salt facts were added. The pass found no source-closeable extractor
  cluster: the remaining component gaps reduce to keyboard-only accessibility
  docs, the remaining pattern gaps lack explicit docs/registry fields for the
  missing guidance, and the foundation gaps are deprecated token policy evidence
  gaps.
- Component source accessibility extraction on May 5, 2026 closed the 11
  component coverage gaps through generic component source ARIA/role extraction.
  The extractor only emits source-derived implementation summaries for explicit
  ARIA attributes, ARIA roles, or ARIA announcer usage and does not promote
  `tabIndex` or focus callbacks. These source-derived summaries do not become
  validator accessibility rules. A fresh production audit now reports 24 total
  explicit unsupported docs/registry gaps: 0 component gaps, 21 pattern gaps,
  and 3 foundation gaps.
- Pattern story-source accessibility extraction on May 5, 2026 now derives
  pattern accessibility summaries from source-backed Storybook examples only
  when pattern docs accessibility summaries are empty and the example code
  contains explicit ARIA attributes, ARIA roles, or ARIA announcer usage. The
  generated EvidenceRefs resolve to the story source file for those summaries.
  The extractor does not promote `tabIndex`, focus callbacks, generic visual
  focus prose, or generic "accessible from any page" language. A fresh
  production audit now reports 20 total explicit unsupported docs/registry gaps:
  0 component gaps, 17 pattern gaps, and 3 foundation gaps. Story-source ARIA
  evidence closed the accessibility-only gaps for `Announcement dialog`,
  `Preferences dialog`, `Search`, and `Vertical navigation`, and removed the
  accessibility portion of multi-field gaps for `Breadcrumbs`, `Contact
details`, `File upload`, `Menu button`, and `Split button`. Remaining pattern
  gaps stay unsupported because the docs and Storybook sources scanned in this
  pass did not provide exact `when_not_to_use`, `how_to_build`, or accessibility
  source evidence.
- Pattern optional-field gap classification on May 6, 2026 now records
  per-field unsupported records for selected pattern context optional gaps. A
  fresh production audit remains at 20 total explicit unsupported docs/registry
  gaps: 0 component gaps, 17 pattern gaps, and 3 foundation gaps, but pattern
  optional gaps now list the missing field record and
  `missing_optional_evidence` cause directly. No production Salt facts were
  added; the remaining `when_not_to_use`, `how_to_build`, accessibility, and
  `Indication.when_to_use` surfaces remain unsupported until source-backed
  docs, examples, source, or registry records exist.
- Foundation token gap recertification on May 15, 2026 rechecked the remaining
  non-pattern catalog entries after the selected-pattern behavior slice. The
  current catalog records 15 total gaps: 12 pattern gaps and 3 foundation token
  gaps. The 15 foundation token records still reduce to source-backed
  unsupported states, not extractor misses. `measured` retains two records whose
  replacement metadata has no exact source-backed replacement token and one
  record whose replacement chain ends at manual literal guidance; `track`
  retains the manual literal `textAlign` policy gap; `opacity` retains raw and
  scale replacement records whose final token records still lack source-backed
  generated policy docs. These causes come from semantic-core registry
  `policy_gap` records backed by
  `packages/theme/css/deprecated/token-replacements.json`, deprecated token CSS,
  and theme changelog evidence. No production Salt facts were added; generated
  policy remains `null` and the CLI, MCP, skill, reports, and validators must
  continue exposing unsupported states until source docs or registry policy
  records close the gaps.
- Pattern replacement-style avoidance extraction on May 15, 2026 now treats
  source-backed docs callout statements shaped as `Use ... instead if/when/to/for`
  as pattern `when_not_to_use` guidance. The parser deliberately does not
  promote broader `instead of ...` prose. This closes the `Selectable card`
  pattern gap through its pattern docs callout while keeping component-owned
  behavior and local substructure advice out of generated pattern guidance. A
  regenerated context gap catalog records 14 total gaps: 11 pattern gaps and 3
  foundation gaps. The remaining pattern gaps stay unsupported: Comments,
  Experience customization, File upload, Formatted input, International address
  form, International phone number, Keyboard shortcuts, and Menu button still
  lack explicit pattern-level `when_not_to_use` evidence; List filtering still
  lacks explicit `how_to_build` evidence; and Indication remains a topic-style
  reference page without source-backed `when_to_use`, `when_not_to_use`, or
  `how_to_build` guidance for generated pattern context. No production Salt
  facts were added outside source-backed extraction.

Why this matters:

- Default generated context packs are now release-ready slices, not full product
  surfaces.
- The prototype proves the evidence contract, but broader serializers and
  non-selected records still need production registry coverage.
- MCP can now persist release-gated context packs and generated report/artifact
  payloads to project-local files. Attachment-like host stores remain outside
  the current MCP transport contract.
- Broader non-selected context surfaces and host-managed attachment persistence
  still need explicit unsupported states until source-backed serializers and
  attachment-store contracts exist. Prompt and host instruction
  defaults now use source-backed serializers, but product Salt facts still must
  come from registry records, source-backed docs/examples/component source/token
  data, `.salt` project policy, or explicit workflow input.
- Expected-pattern validation is currently limited to source-backed
  starter-template import presence plus starter region and build-around text
  presence. Starter region order, layout semantics, interaction details,
  preserve constraints, and pattern accessibility behavior are explicit
  unsupported rule-pack gaps until semantic-core has validators for those
  source-backed records.

Target state:

- Context pack serializers cover selected production components, patterns,
  foundations, prompts, and instructions from the same registry evidence graph.
- Review reports use shared semantic-core report serializers and schemas across
  CLI and MCP.
- Generated context and report release gates validate against registry evidence
  and fail when facts point to undocumented props, tokens, imports, examples,
  statuses, or accessibility claims.

Do not do:

- Do not fill missing generated context with skill or prompt text.
- Do not hand-author production context facts outside registry-derived
  serializers.
- Do not treat a review finding without structured provenance as a confirmed
  source-backed Salt claim.
