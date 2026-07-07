# SaltBench 2.0 — A Measurement-Valid Benchmark for the Salt AI Tooling

**Status:** Supersedes `evaluation_plan.md` where they conflict. Reuses its assets (fixture repos, host-trace rule engine, C0/C1/C2 ablation concept, failure-attribution tree); discards its framing.
**Scope:** `@salt-ds/mcp` + `@salt-ds/semantic-core` registry + `salt-ds` skill + `salt_workflow_v1` contract, evaluated as one joint system.

---

## 0. What was wrong with the v1 plan, precisely

Three defects, in increasing order of severity:

1. **Process outweighed measurement.** Annotation cadences, governance tables, and dashboards are downstream concerns. None of them make a weak measurement strong. This document inverts the ratio: it is almost entirely measurement methodology; operations get one table at the end.
2. **Context-free oracles.** The `href="#"` rule is the representative failure: a static check that fires identically on a work-in-progress prototype (where placeholder hrefs and empty handlers are *correct* for the user's intent) and on production code (where they are defects). A benchmark built from such rules mismeasures by construction. This is not a cosmetic bug — it is an **outcome-validity failure** in the formal sense of the Agentic Benchmark Checklist (Zhu et al., NeurIPS 2025, arXiv:2507.02825), whose audit of ten popular agentic benchmarks found that exactly this class of flaw (reward checks that don't track true task completion — SWE-bench-Verified's insufficient tests, τ-bench scoring empty responses as passes, WebArena's brittle string matching) misestimates agent performance by up to 100% in relative terms. §2 replaces rule-firing with intent-conditioned oracles whose own error rates are measured before they are allowed to score anything.
3. **No contamination model — which for this product is fatal, not incidental.** Salt is a public design system: its docs, source, and Storybook examples are on GitHub and npm, and are in every frontier model's pretraining corpus — *including obsolete API versions*. The SWE-bench contamination literature shows what this does to benchmarks on public repos: models identify buggy file paths at up to 76% accuracy from issue text alone, with performance collapsing on out-of-benchmark repos (SWE-Bench Illusion, arXiv:2506.12286; arXiv:2512.10218; SWE-rebench, NeurIPS 2025). For SaltBench the implication is sharper than "scores may be inflated": **a trial where the agent produces correct Salt code proves nothing about the MCP**, because the model may have produced it from memory. Worse, the product's core failure mode (findings.md: the agent implemented `VerticalNavigation` "from types/memory", wrongly) *is* memorization of stale priors. Measuring whether the tooling **causally overrides the model's prior** is therefore not a nice-to-have robustness check — it is the primary scientific question, and v1 never asked it. §1/Q1 and §5.3 make it the headline endpoint.

What v1 got right and this plan keeps: real-agent-in-the-loop execution against the real MCP server; execution-based verification over judge-based scoring wherever possible; pass^k reliability reporting; the C0/C1/C2 context ablation; the fixture repos and the 9-code host-trace rule engine as a trajectory-checker seed; failure attribution to tooling vs content backlogs.

---

## 1. The five questions the benchmark exists to answer

Each question is a primary endpoint with a method, a metric, and a falsification condition. If an activity does not serve one of these five, it is out of scope.

| # | Question | Primary metric | Method (§) | The result that would force an overhaul |
|---|---|---|---|---|
| **Q1** | Does the tooling **causally** change agent behavior, versus the model's memorized prior? | Counterfactual Tracking Rate (CTR) | §5.3 | CTR statistically indistinguishable from the closed-book base rate — i.e. agents reproduce their prior whether or not registry evidence contradicts it → the contract/evidence design is decorative |
| **Q2** | Does the joint system deliver **working, intent-appropriate** Salt UI? | Severity-weighted Functional Delivery (FD), avg@k + pass^k with clustered SEs | §3, §4, §6 | FD under the full system ≤ FD under the naive docs-dump baseline → the six-tool workflow adds no value over context stuffing |
| **Q3** | Is the implement gate a **good selective classifier**? | Risk–coverage curve; AURC | §6.2 | Gate risk–coverage dominated by a trivial "always allow" or "always block" policy → gate logic is not information-bearing |
| **Q4** | Is emitted guidance **faithful to its cited sources**? | Citation precision / recall (claim-level, NLI/judge-checked, human-validated) | §5.4 | Citation precision below a human-calibrated bar (provisionally 0.8, to be reset from the first expert-adjudicated sample) → evidence fields are theater; hosts cannot trust `source_urls` |
| **Q5** | Is behavior **robust to meaning-preserving variation** and **sensitive to meaning-changing variation**? | Metamorphic violation rate (INV/DIR suites) | §4.3 | High INV violations (paraphrase flips component choice) or missed DIR shifts (prototype→production doesn't raise strictness) → outputs are prompt-artifact, not systematic |

Q2 is the delivery headline; Q1 is the scientific one. Everything in v1's metric zoo either folds into these five or is demoted to a guard metric (cost, latency, payload size).

---

## 2. Measurement validity before measurement (the ABC discipline)

Adopt the Agentic Benchmark Checklist (arXiv:2507.02825) as a standing audit, not a citation. Its three pillars map to concrete SaltBench mechanisms:

### 2.1 Outcome validity: oracles that are themselves measured

**Every scoring rule is a typed object with an applicability predicate, a severity function, and calibration cases:**

```jsonc
{
  "rule_id": "nav-trigger-real-href",
  "checks": "VerticalNavigationItemTrigger[href] resolves to a route or handler",
  "applicability": { "fidelity": ["production"], "declared_navigation": true },
  "severity_by_frame": { "production": "defect", "prototype": "advisory" },
  "calibration": {
    "must_fire": ["fixtures/rules/nav-href/prod-dead-link.tsx"],
    "must_not_fire": ["fixtures/rules/nav-href/proto-wip-placeholder.tsx"]
  }
}
```

- **The `href="#"` fix, generalized:** every task carries a **fidelity frame** (§3.1). Rules evaluate *conditional on the frame*. A prototype task asserts only what a prototype must satisfy (renders without runtime error, canonical composition, real component APIs); wiring completeness is asserted only when the task declares it. Incompleteness that matches declared intent is not a defect.
- **`must_not_fire` cases are mandatory.** A rule without negative calibration cases is a lint opinion, not an oracle. The prototype-WIP case ships as the canonical `must_not_fire` for every completeness-flavored rule.
- **Meta-evaluation gate:** before a rule contributes to FD, estimate its precision/recall on a stratified, expert-adjudicated sample of real trial artifacts (~30 firings + 30 non-firings per rule class). Rules below precision 0.9 score as *advisory* (logged, not counted). Re-audit when the rule or its extraction data changes. This is the ABC prescription ("benchmark your evaluator reproducibly") operationalized; it is also what converts `review_salt_ui` findings from narrative into a measured instrument, since review shares the same rule objects.
- **Continuous oracle QC via item statistics (§3.3):** tasks whose scores correlate negatively with overall system performance across the response matrix (negative point-biserial discrimination; IRT residuals once the matrix is deep) are flagged as suspected broken verifiers — the cheap, automatic detector for the next `href="#"`-class mistake.

### 2.2 Task validity: solvable, and solvable only via the target capability

- **Reference solutions are required.** No task enters the corpus without a checked-in artifact that passes all its oracles (proves solvability) — the MCPEval pattern (`verify-tasks` / `revalidate-tasks`, Salesforce, github.com/SalesforceAIResearch/MCPEval).
- **Shortcut audits.** For each task, run the *floor* model closed-book (no MCP): if it passes at high rate, the task does not measure tooling-dependent capability — either harden it (counterfactual variant, §5.3) or label it `prior-solvable` and exclude it from Q1/Q2 primary aggregates. This is the task-validity analogue of the SWE-bench file-path probe (arXiv:2506.12286).
- **Ambiguity control:** each task's `expected_behavior` is written as a *compliance checklist* of precise, factual, individually checkable requirements (DevAI-style hierarchical requirements — Agent-as-a-Judge, ICML 2025, arXiv:2410.10934; EACL 2026 process-evaluation findings: imprecise compliance questions are the main source of judge variance).

### 2.3 Reporting validity

Every published number carries: n tasks, k trials, clustered standard error (§6.1), the exact `{mcp, registry, skill, contract, harness, model}` version tuple, and the oracle-suite version. Aggregates never mix frames or contamination strata (§5.3) silently.

**External validity:** once field telemetry exists, benchmark scores must be validated against field outcomes (do FD/CTR movements predict lower critical-failure rates in real sessions?). A benchmark that does not predict field behavior gets revised, whatever its internal elegance — predictive validity is the final arbiter.

---

## 3. Task corpus engineering

### 3.1 Task schema (delta from v1)

The v1 golden-task schema survives with three additions that do the real work:

```jsonc
{
  "id": "create-dashboard-vnav-001",
  "frame": {
    "fidelity": "prototype" | "production",     // conditions all oracles (§2.1)
    "declared_scope": ["navigation", "kpi-cards", "table"],
    "user_persona": "engineer prototyping for a design review"
  },
  "prompt_cluster": ["...", "...", "..."],        // ≥3 paraphrases; a CLUSTER for stats (§6.1)
  "compliance_checklist": [                        // DevAI-style requirements, individually oracle-checked
    { "id": "R1", "text": "Vertical navigation uses canonical ItemContent composition", "oracle": "ast:composition" },
    { "id": "R2", "text": "Artifact renders without runtime error", "oracle": "runtime:render" }
  ],
  "reference_solution": "solutions/create-dashboard-vnav-001/",
  "contamination": { "stratum": "public-stable" | "post-cutoff" | "counterfactual" },
  "provenance": "field" | "generated" | "adversarial"
}
```

### 3.2 Sourcing: generate → verify → revalidate, plus a fresh-task stream

- **Generated tasks:** LLM-assisted task generation over the registry's own coverage map (components × patterns × frames), then machine-verified (reference solution must pass; shortcut audit must fail closed-book) and revalidated against actual execution traces — the MCPEval pipeline, adopted rather than reinvented.
- **Field tasks:** the v1 failure-to-fixture flywheel stands, with SWE-rebench's key addition (NeurIPS 2025): tasks are timestamped and models' training cutoffs recorded, so every task lands in a **contamination stratum**. New Salt components released after a model's cutoff are a naturally decontaminated stream — report them separately; they are the closest thing to ground truth on generalization.
- **Adversarial tasks:** gate-bypass temptations, hostile source-outline instructions, truncated-input reviews (all from findings.md), plus frame-ambiguity cases (production task phrased casually; prototype task phrased formally). Note the production-side implication: real users do not declare fidelity frames — the workflow must *infer intent or ask*. These tasks measure whether it does, rather than assuming a default strictness.
- **Volume discipline:** corpus quality per §2 beats corpus size. 60 valid tasks × 3-paraphrase clusters × k=4 outperforms 300 unaudited tasks — the ABC audit found most large benchmarks are noise-inflated anyway.
- **Benchmark self-contamination control:** this repository is public (`jpmorganchase/salt-ds`); anything committed here enters future pretraining corpora, so a benchmark stored in-repo eventually contaminates the models it evaluates. Golden tasks, reference solutions, and perturbation specs live in a **private assets repository**; the public repo carries only schemas, harness code, and calibration fixtures. All eval assets embed a BIG-bench-style canary GUID so accidental leakage is detectable in future models.

### 3.3 Psychometric QC and the CI subset (IRT)

Accumulate the binary response matrix (task × system-config × trial) that every run already produces, and stage the psychometrics honestly by sample size:

- **From day one — classical test theory (CTT), which is valid at small n:** per-task difficulty (pass rate) and discrimination (point-biserial item–total correlation). Near-zero or negative point-biserial flags a task as non-informative or a **suspected broken oracle** — the cheap, automatic detector for the next `href="#"`-class mistake. This requires only the handful of configurations we have immediately.
- **Later — 2PL IRT, only when the matrix is deep enough:** published IRT-based compressions fitted on hundreds to thousands of respondent models (tinyBenchmarks: 395, ICML 2024, arXiv:2402.14992; metabench: >5000, arXiv:2407.12844). Internal response matrices reach adequate depth only after months of accumulated configs (models × tooling versions × baselines); before that, IRT estimates would be noise dressed as rigor. Fluid Benchmarking's adaptive item selection (Allen AI, github.com/allenai/fluid-benchmarking) becomes applicable at the same maturity point.
- **Benchmark compression for CI:** until IRT is warranted, the nightly smoke subset is stratified-random by frame × workflow with reconstruction error reported empirically (subset score vs full score over past runs); IRT-optimal selection replaces it when available.

---

## 4. Oracle hierarchy (what replaces lint-rule verification)

Ordered by evidentiary strength; a task's checklist items bind to the strongest applicable level.

### 4.1 Execution oracles (primary)

1. **Compile/type oracle** — `tsc --noEmit` against pinned real `@salt-ds/*` packages.
2. **Render oracle** — Playwright mounts the artifact; zero uncaught exceptions; axe-core critical violations = 0 (frame-conditioned for the rest).
3. **Interaction oracle (production frame)** — scripted probes derived from the compliance checklist: tab-order reaches declared actions, declared navigation navigates, declared states (loading/empty) are reachable. Prototype frame runs render-only. This is MCPMark's "programmatic verification script" standard (ICLR 2026; github.com/eval-sys/mcpmark) applied to UI.

### 4.2 Structural/semantic oracles (secondary)

- **Import census** (every `@salt-ds/*` symbol exists in the installed package's export surface — the mechanical "no invention" check) and **prop census** against docgen metadata.
- **Composition oracles** from per-component required-subtree contracts (the findings.md `VerticalNavigationItemContent` class).
- **Systemic rules** (nested-Card class) — but now as §2.1 rule objects with frames, calibration cases, and measured precision; never free-floating lint.

### 4.3 Metamorphic oracles (the robustness layer)

Metamorphic testing sidesteps the oracle problem by asserting *relations between runs* instead of absolute correctness (AgentAssay, arXiv:2603.02601; semantic-invariance testing for agents, arXiv:2603.13173; CheckList's MFT/INV/DIR taxonomy, Ribeiro et al., ACL 2020):

| Relation | Instantiation for Salt | Violation means |
|---|---|---|
| **INV-paraphrase** | Prompts within a cluster → same resolved entity, same gate outcome | Routing is phrasing-artifact |
| **INV-alias** | `VerticalNavigation` / "vertical navigation" / "side nav" → identical reference resolution | Entity linking is brittle (the findings.md `not_found` class) |
| **DIR-fidelity** | Same artifact, frame flipped prototype→production → review severity monotonically increases; `href="#"` flips advisory→defect | Context-insensitive oracles/review (the exact critique this plan answers) |
| **DIR-evidence** | Remove one entity's evidence from a passing create context → gate must not remain `implement` | Gate ignores evidence (findings.md `resolved_entities` bug, as a standing relation) |
| **INV-order** | Reordering `resolved_entities` / outline regions → same contract decision | Spurious order sensitivity |

Metamorphic suites run **cheap** (they reuse trials or perturb single tool calls via replay) and produce Q5's violation rates. DIR-fidelity is the regression test that makes the `href="#"` mistake structurally unrepeatable.

### 4.4 Judge oracles (last resort, and only as calibrated instruments)

Reserved for genuinely non-mechanical dimensions (visual craftsmanship, guidance clarity). Requirements, from the judge-bias literature (systematic bias-mitigation evaluation, arXiv:2604.23178; PoLL, arXiv:2404.18796; length-controlled win rates, Dubois et al. 2024):

- **Panel, not a single judge:** 3 judges from different model families; aggregate. PoLL showed a diverse small-judge panel beats a single GPT-4 judge on human agreement at ~7× lower cost, and single-family judges exhibit measurable self-preference.
- **Pairwise, not absolute:** compare candidate vs baseline artifacts (or vs reference solutions); aggregate with a Bradley–Terry model (Chatbot Arena's migration from online Elo to BT fitting is the precedent). Position-swap every comparison; regress out length (length-controlled preference) before reporting.
- **Admission gate:** a judge dimension is used only after demonstrating agreement with expert majority labels (weighted κ ≥ 0.6, target 0.8, on ≥100 items); re-audit on any judge-model or prompt change. Judges never contribute to Q1–Q3 endpoints and never gate a release alone.

---

## 5. The NLP/IR measurement core

### 5.1 Entity linking (the `not_found` class, measured properly)

`get_salt_reference` is an entity-linking system; evaluate it as one. Build a gold link set: every public `@salt-ds/*` export + doc-title + common paraphrase/alias surface forms → canonical registry entity (the alias table findings.md showed is broken). Metrics: **accuracy@1**, **candidate recall@k**, and alias-class breakdowns (export-name, doc-name, colloquial). This is a deterministic, high-n, tight-CI metric — the right instrument for the "renaming/alias fix" class of change, where end-to-end FD would be statistically underpowered.

### 5.2 Retrieval quality (create-routing as ranking)

The create retrieval index is a ranker; score it with graded qrels: for a query set (from prompt clusters + field queries), experts grade candidate entities (primary / acceptable / wrong). Report **nDCG@5** and **recall@10**. Routing changes get evaluated here first — cheap, paired, powerful — before spending agent-loop budget.

The qrels also exist to settle **retrieval architecture** empirically rather than by fashion: the current index is lexical; candidate replacements (dense bi-encoder embeddings, hybrid lexical+dense fusion, cross-encoder reranking) are compared offline on nDCG/recall under the MCP's deployment constraints (offline catalog, no network at query time). The IR literature's prior — strong lexical baselines are hard to beat at small corpus scale, hybrid + rerank usually wins where dense helps (BEIR, Thakur et al. 2021) — is a hypothesis here, not a decision. See the enterprise plan for the build-side bake-off.

### 5.3 Counterfactual grounding (Q1 — the decisive experiment)

Method (adapting code-rewriting memorization probes, arXiv:2503.02296, and the SWE-bench Illusion design, arXiv:2506.12286):

1. Build **perturbed registries**: mechanically edited variants where selected facts diverge from the public docs the model memorized — a renamed prop, an inverted default, a changed required-composition wrapper, a plausible fictional component with full evidence, a deprecation the real docs don't have. Perturbations are generated from the registry build (they're data transforms, not doc edits) and are invisible in the task prompt.
2. Run matched trials: same task, same model, production registry vs perturbed registry.
3. **Score three-way, not binary.** Each perturbation-touching decision is classified: *follows-registry*, *silently-follows-prior*, or *surfaces-conflict* (the agent flags the discrepancy or asks). Follows-registry and surfaces-conflict are both grounded behavior — an agent that notices its prior disagrees with the evidence and says so is doing exactly what the contract wants; only silently following the prior is the failure mode. **CTR = grounded outcomes / perturbation-touching decisions**, reported with the three-way breakdown, at both the contract layer (does `create_salt_ui` evidence reflect the perturbed fact?) and the artifact layer (does emitted code use the perturbed API?).
4. **Plausibility audit on perturbations:** perturbed facts must pass an indistinguishability check — a held-out expert (or model) shown mixed real and perturbed registry entries cannot separate them above chance. Otherwise low CTR could mean "the agent detected an eval artifact", not "the agent is ungrounded".

CTR is the causal answer to "is this system grounded" — memorization cannot fake it, because the correct behavior is defined *against* the memorized corpus. It directly quantifies the product's central promise ("do not invent Salt APIs from memory"), and its null is sharp: the closed-book base rate of emitting the perturbed fact is ≈0, so any CTR lift is attributable to the tooling. Report CTR per perturbation class; the composition-wrapper class replays findings.md as a controlled experiment. Secondary use: the closed-book (C0) condition from v1 stays, now interpreted through contamination strata — C1−C0 on `post-cutoff` tasks estimates true tooling lift free of memorization confounds.

### 5.4 Evidence faithfulness (Q4)

Workflow outputs assert evidence: `evidence.items[].source_urls`, summaries, rule rationales. Score them with the attribution methodology from citation-evaluation research (ALCE, EMNLP 2023; citation precision/recall via NLI-style support checks; claim decomposition per ALiiCE/CiteEval, NAACL/ACL 2025):

- Decompose each workflow summary/guidance payload into atomic claims; check each claim against its cited registry/doc source with an NLI-style checker (judge-panel-backed, human-validated per §4.4).
- **Citation precision** (cited source actually supports the claim) and **citation recall** (claims that carry a source at all — the contract's `source_url_required_for_source_backed_evidence` policy, now measured instead of asserted).
- Note the correctness/faithfulness distinction (arXiv:2412.18004): a citation can "support" post-hoc without having driven the output. CTR (§5.3) is the causal complement; together they bracket true groundedness.

---

## 6. Statistical inference (how a number becomes a claim)

### 6.1 Inference protocol

Directly per *Adding Error Bars to Evals* (Miller, arXiv:2411.00640) and the agentic-randomness findings (arXiv:2602.07150: single-run pass@1 varies 2.2–6.0 points even at temperature 0):

1. **The unit of randomization is the task; paraphrases are clusters.** Prompt-cluster members are correlated draws — compute **clustered standard errors** with cluster = task (Miller's reading-passage case, exactly). Naive SEs here can understate uncertainty ~3×.
2. **Always paired.** Candidate vs baseline on identical tasks, paraphrase draws, seeds, model versions; infer on per-task score differences. Frontier-model score correlations of 0.3–0.7 make pairing a free variance reduction — it is the difference between detecting a 4-point effect and needing a 10-point one at this corpus size.
3. **Power before running.** Miller's sample-size formula decides, per pre-registered hypothesis, whether the full corpus, a slice, or a component-level metric (§5.1/5.2, where n is large and variance tiny) is the right instrument. Changes with expected end-to-end effects below the MDE are *required* to target a component metric — this is how we avoid claiming noise as progress.
4. **Report the envelope:** avg@k (central tendency) and pass^k (reliability floor; unbiased estimator; k=4 per the MCPMark convention) — pass@k alone systematically flatters inconsistent agents (τ-bench).
5. **Budget allocation by variance decomposition:** estimate between-task vs within-task (run-to-run) variance from the baseline; allocate spend to more tasks vs more trials to minimize SE per dollar (with observed within-task variance high in agentic settings, k=4 on more tasks generally beats k=8 on fewer).
6. **Pre-registration and guards:** one primary endpoint per experiment, declared in the PR; everything else exploratory. Non-inferiority guards on the other four Q-endpoints (delta lower bound > −2 points) so improving Q2 can't silently degrade Q3.

### 6.2 The gate as selective prediction (Q3)

The implement gate is formally a **selective classifier**: it chooses coverage (fraction of situations where it permits implementation) and incurs risk (defect rate among permitted). Evaluate it with the selective-prediction toolkit rather than a bare confusion matrix:

- Sweep the gate's operating points (evidence-completeness thresholds, follow-through strictness) → **risk–coverage curve**; summarize with AURC.
- A gate whose curve is dominated by trivial policies is not adding information (Q3 falsification). A gate improvement claim = a curve shift, not a single-cell delta — this prevents the Goodhart failure of "fixing" false-allows by blocking everything, which v1's paired false-allow/false-block metrics gestured at but did not formalize.

---

## 7. Harness deltas (build vs reuse)

- **Reuse the ecosystem, build the oracles.** Trajectory capture, OTel-trace assertions, path/latency/cost metrics, and multi-turn user simulation already exist in mcp-eval (LastMile, OTel-native assertions over real MCP calls) and MCPEval (task generation/verification pipeline, bootstrap CIs, paired tests). Evaluate adopting one as the runner substrate in Milestone 1 before extending the bespoke `workflowEvalHarness`. **The differentiated IP is exclusively:** the task corpus, the frame-conditioned oracle library, the perturbed-registry builder, and the entity-linking/retrieval gold sets. Spend there.
- **Simulated user for `ask_user` flows** (τ-bench pattern): when the contract returns questions, an LLM user-simulator answers from the task's frame/persona; scripted answers for deterministic replays. Without this, every blocking-question path is unmeasurable — and blocking questions are half the gate's design.
- **Counterfactual replay for failure localization:** re-run a failed trajectory prefix with one substituted tool response (e.g., the corrected reference payload) and observe whether the outcome flips — cheap causal attribution of failures to specific tool outputs vs agent behavior, feeding the v1 attribution tree with evidence instead of judgment.
- Keep: sandboxed fixture repos, stdio spawning, seed/version stamping, JSONL artifacts, `evaluateHostTrace` promoted to an in-harness trajectory oracle (its 9 critical-failure codes become compliance-checklist items with calibration cases like every other rule).

---

## 8. Baselines and falsification (what makes this a real project)

A benchmark that cannot embarrass the product is marketing. Standing conditions, run on every full evaluation:

| Condition | System | The question it answers |
|---|---|---|
| **B0** | Closed book (skill only, MCP off) | Memorization floor; stratified by contamination (§5.3) |
| **B1** | Naive context stuffing: relevant docs MDX retrieved by embedding search, dumped in context; no workflow tools, no gate | Does the *structured contract* beat cheap RAG? |
| **B2** | Retrieval-only MCP: `get_salt_reference` exposed, workflow tools and gate disabled | Does the *gate/workflow machinery* add value over raw reference lookup? |
| **B3** | Full system (skill + five tools + gate) | The product |

Decision rules, pre-committed: if B3 ≤ B1 on FD with the paired CI excluding 0 in B1's favor, the workflow contract is not earning its complexity — redesign the contract, not the benchmark. If B3 ≈ B2, the gate is overhead — simplify. If CTR (Q1) is low under B3 but high under B2, the *contract layer* is diluting grounding. Component ablations (rule packs on/off, per-component evidence scoping on/off, composition contracts on/off) localize any B-level difference. These are the experiments that tell us whether to **improve or overhaul** — the plan treats both as live hypotheses.

---

## 9. Milestones (each ends in a falsifiable claim, not a deliverable list)

**M1 — Validity foundation + the decisive experiment (≈4 weeks).**
Frame-conditioned rule-object format with calibration cases; meta-evaluation protocol; 25-task pilot corpus (frames, prompt clusters, reference solutions, shortcut audits); perturbed-registry builder; CTR pilot on one model.
*Claim to test:* "CTR under the current system is materially above the closed-book base rate, with a CI" (provisional bar: ≥0.8 grounded-behavior rate at the contract layer). Also expected to *formally reproduce* findings.md: DIR-evidence relation fails, composition-class CTR low. If CTR is statistically indistinguishable from the base rate, escalate to product redesign before building more eval machinery — nothing else in this plan matters until grounding is real.

**M2 — Execution oracles + statistics + baselines (≈4 weeks).**
Compile/render/interaction oracles; corpus to ~60 audited tasks; clustered-SE + paired analysis + power tooling (adapt Miller's formulas; `evalci`-style library); B0–B3 baseline runs; risk–coverage instrumentation for the gate.
*Claim to test:* "B3 > B1 on FD with 95% CI excluding 0" — the product-value hypothesis, stated before the data is seen.

**M3 — NLP core + robustness + judges (≈4 weeks).**
Entity-linking gold set + retrieval qrels (nDCG/recall dashboards); claim-decomposition citation P/R pipeline; INV/DIR metamorphic suites wired to CI; judge panel (3 families, pairwise BT, swap+length controls) admitted per κ gate; simulated-user flows.
*Claim to test:* "Alias-resolution fixes move accuracy@1 by a large, tight-CI margin AND propagate to end-to-end FD on the navigation slice" — the first full component→system causal chain.

**M4 — Continuous validity (≈4 weeks, then steady state).**
Response-matrix accumulation; CTT item statistics running from M2 onward, first IRT fit only if matrix depth permits (§3.3); stratified CI smoke subset with empirical reconstruction error; post-cutoff fresh-task stream (SWE-rebench pattern) with contamination-stratified reporting; release gating: a `@salt-ds/mcp` publish requires a paired, pre-registered, guard-clean full run.
*Claim to test:* "The compressed CI subset predicts full-benchmark FD within a stated error bound."

Operations (one line each, the entire process budget): weekly failure review doubles as expert adjudication for §2.1 samples; Langfuse (or repo JSONL alone) stores traces/scores — storage is replaceable, decisions read repo scorecards; oracle/rule changes require a reviewer independent of the change author.

---

## 10. Endpoint scoreboard (what gets reported, nothing else)

| Endpoint | Metric | Statistical form | Cadence |
|---|---|---|---|
| Q1 Grounding | CTR, per perturbation class | Proportion + Wilson CI, paired across registry conditions | Full runs |
| Q2 Delivery | FD (severity-weighted checklist pass), by frame | avg@4 + pass^4, clustered SEs, paired deltas | Nightly (CI subset) / weekly (full) |
| Q3 Gate | Risk–coverage / AURC; false-allow & false-block at the shipped operating point | Curve + bootstrap band | Full runs |
| Q4 Faithfulness | Citation precision / recall (claim-level) | Mean + clustered SE | Weekly |
| Q5 Robustness | INV / DIR violation rates per relation | Proportion + CI | Nightly (replay-cheap) |
| Components | Entity-linking acc@1, recall@k; retrieval nDCG@5; rule precision/recall | High-n, tight CIs | Every PR (deterministic) |
| Guards | Cost/task, tokens/task, latency, payload budgets | Non-inferiority bounds | Every run |

An improvement claim = a pre-registered endpoint, a paired run, a CI excluding zero, guards clean. Anything else is an anecdote.
