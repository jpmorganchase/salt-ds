# Salt AI Tooling — Master Plan

**Single-file consolidation for stakeholder distribution.**
**Status:** Authoritative master plan. Supersedes prior internal planning drafts on field evidence, evaluation design, measurement methodology, and delivery sequencing.
**Audience:** technical teams execute from Parts II–IV; Part 0 and the linked [glossary](#appendix-a--glossary-of-technical-terms) are the translation layer for non-technical management.
**Convention:** specialist data-science / ML / AI terms are linked to Appendix A at first use, like this: [confidence interval](#def-ci). Appendix A gives plain-English definitions and document-context examples for each term.

---



## Part 0 — Executive summary (plain language)

**What we are building.** Salt is J.P. Morgan's open-source design system. We are building AI tooling — a server that AI coding assistants connect to (via the [Model Context Protocol](#def-mcp)) — so that when an engineer or an [AI agent](#def-agent) builds Salt UI, the result is correct, accessible, and canonical, instead of plausible-looking and wrong.

**Why it is needed.** [Large language models](#def-llm) already "know" Salt, because Salt's documentation is public and was absorbed during model training — including obsolete versions. That knowledge is stale and unreliable: in a real recorded session, an assistant using our current tooling invented component structures from memory, shipped them, and our safeguards did not catch it. The tooling's entire purpose is to replace that memory with live, verified facts — and to refuse to proceed when facts are missing.

**Why this plan is different from "build features and hope".** Every change we make is treated as a testable hypothesis. We are building a benchmark — a controlled, repeatable exam for the whole system — with the statistical discipline of a clinical trial: pre-declared success criteria, paired before/after comparisons, and [confidence intervals](#def-ci) so we never mistake noise for progress. The benchmark is also designed to be able to *embarrass* the product: we run cheaper alternatives alongside it, and if the product doesn't beat them, the pre-agreed answer is redesign, not denial.

**The three headline questions, in plain terms:**

1. *Does the tooling actually change what the AI does* — or does the AI just repeat its memory? (Measured by [counterfactual perturbation](#def-counterfactual-perturbation) and [CTR](#def-ctr) — deliberately planting facts that differ from the public docs and checking which one the AI follows.)
2. *Does the whole system deliver working UI* that matches what the user asked for — judged by running the code, not by opinion? (Measured by [Functional Delivery (FD)](#def-fd).)
3. *Is the safety gate trustworthy* — does it block risky work and permit good work, better than a gate that just says yes (or no) to everything? (Measured by the [implement gate](#def-implement-gate) [risk–coverage curve](#def-risk-coverage).)

**What management gets.** Day 30: the known bugs from the field session fixed, with measured proof. Day 60: a written verdict on question 1 — the go/no-go on the core architecture. Day 90: a written verdict on whether the product beats the cheap alternative, and a re-ranked backlog either way. After that: a quarterly scorecard where every number carries its uncertainty, and a standing rule that no claim of improvement is accepted without a pre-registered, statistically-read comparison.

**What it MIGHT take.** A small four-workstream team (product engineering, evaluation science, content/registry, platform/governance), heavy use of coding agents under human review gates, self-hosted infrastructure only (no data leaves the bank), and one hour per week of design-system expert time for adjudication.

---



## Part I — Evidence and current state



### 1.1 The product under evaluation

The first public release of Salt AI tooling is a read-only [MCP](#def-mcp) server (`@salt-ds/mcp`) exposing five tools (`get_salt_project_context`, `get_salt_reference`, `create_salt_ui`, `review_salt_ui`, `migrate_to_salt`), an offline [registry](#def-registry) generated from Salt's docs and source, a compact [decision contract](#def-decision-contract) (`salt_workflow_v1`) whose central promise is an [implement gate](#def-implement-gate) — agents may only write Salt UI when the contract returns `status: success`, `action.kind: implement`, `safety.exact_request_safe: true`, and `evidence.status: complete` — and an [agent skill](#def-agent-skill) that instructs AI assistants to follow that contract.

### 1.2 The field failure that motivates everything

A real session (Cursor + the skill + the MCP, building a financial dashboard) produced this chain without tripping any existing safeguard:

1. The create workflow required follow-up evidence for some components but **not** for `VerticalNavigation`, which the agent also planned to use (evidence was scoped at pattern level, not per component).
2. Reference lookup returned `not_found` for `VerticalNavigation`, `BorderLayout`, `StackLayout`, `GridLayout`, `H1` — all real, stable exports. The catalog's [alias resolution](#def-alias-resolution) does not match export names.
3. The agent echoed the unresolved names back as `resolved_entities`; the gate flipped to success — the contract verifies only names it *asked* for, so unverified extras pass through (confirmed in `publicContract.ts`).
4. The agent implemented `VerticalNavigation` from [memorized training data](#def-memorization), omitting the required `VerticalNavigationItemContent` wrapper — a composition bug neither create nor review can currently detect.
5. The post-create review ran on truncated code, returned `blocked`, and the agent declared the work complete anyway.

Every step is a *joint-system* failure: contract semantics, registry data quality, skill adherence, and review capability interacting. This chain is the seed of the benchmark's task set and the standing regression suite.

### 1.3 The current evaluation stack and its blind spot

The repository already contains four evaluation layers — deterministic contract tests, a scripted server harness, a replay judge, and a rule engine for exported IDE chat traces — all useful, all retained. **None of them involves an actual LLM**, so none executes the [joint system](#def-joint-system) that failed above, and none inspects the code agents actually write. The stack is strong below the agent boundary and blind above it.

---



## Part II — Measurement methodology



### 2.1 Five questions with falsification conditions

Every activity in the program serves one of five pre-registered endpoint questions. Each has a metric, a method, and — critically — a stated [falsification condition](#def-falsification) that would force an overhaul rather than an iteration.


| #      | Question                                                                                        | Primary metric                                                                                                                                                                       | Overhaul trigger                                                                                                                                      |
| ------ | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Q1** | Does the tooling **causally** change agent behavior versus the model's memorized prior?         | [Counterfactual Tracking Rate (CTR)](#def-ctr)                                                                                                                                       | CTR statistically indistinguishable from the [closed-book](#def-closed-book) [base rate](#def-base-rate) → the evidence/contract design is decorative |
| **Q2** | Does the joint system deliver **working, intent-appropriate** Salt UI?                          | [Functional Delivery (FD)](#def-fd): [severity-weighted](#def-severity-weighted), execution-verified task completion, reported as [avg@k](#def-avg-at-k) + [pass^k](#def-pass-hat-k) | FD ≤ the naive docs-dump baseline ([B1](#def-baselines), §2.7) → the workflow adds no value over context stuffing                                     |
| **Q3** | Is the implement gate a good [selective classifier](#def-selective-classifier)?                 | [Risk–coverage curve](#def-risk-coverage); [AURC](#def-aurc)                                                                                                                         | Gate dominated by trivial always-allow / always-block policies → gate is not information-bearing                                                      |
| **Q4** | Is emitted guidance **faithful to its cited sources**?                                          | [Citation precision / recall](#def-citation-precision-recall) at claim level                                                                                                         | Precision below the human-calibrated bar → evidence fields are theater                                                                                |
| **Q5** | Is behavior robust to meaning-preserving variation and sensitive to meaning-changing variation? | [Metamorphic](#def-metamorphic) violation rates ([INV](#def-inv)/[DIR](#def-dir) suites)                                                                                             | Paraphrases flip decisions, or intent changes don't → outputs are prompt-artifacts                                                                    |




### 2.2 Validity discipline (the ABC standard)

The program adopts the [Agentic Benchmark Checklist (ABC)](#def-abc-standard) (Zhu et al., NeurIPS 2025) — whose audit found that flawed scoring designs misestimate agent performance by up to 100% relative on major public benchmarks — as a standing audit across three pillars:

**[Outcome validity](#def-outcome-validity) — every scoring rule is a measured instrument.** Scoring rules are typed objects carrying an applicability predicate, frame-conditional severity, and mandatory calibration cases (`must_fire` / `must_not_fire`). The formative example: a rule flagging placeholder `href="#"` links must *not* fire on a work-in-progress prototype — placeholder links are correct there — and must fire on production code. Every task therefore declares a **[fidelity frame](#def-fidelity-frame)** (prototype vs production) that conditions all oracles. Before a rule counts toward FD, its precision/recall is estimated on expert-adjudicated samples; rules below the bar score as advisory only. Continuous quality control comes from [item statistics](#def-ctt): tasks whose scores correlate negatively with overall system performance ([point-biserial discrimination](#def-point-biserial)) are flagged as suspected broken [oracles](#def-test-oracle).

**[Task validity](#def-task-validity) — solvable, and only via the target capability.** Every task ships a [reference solution](#def-reference-solution) proving solvability; every task passes a [shortcut audit](#def-shortcut-audit) (a floor model run closed-book — if it passes without the tooling, the task doesn't measure the tooling); expectations are written as [compliance checklists](#def-compliance-checklist) of individually checkable requirements.

**[Reporting validity](#def-reporting-validity).** Every published number carries n tasks, k trials, [clustered standard errors](#def-clustered-se), the full version tuple `{mcp, registry, skill, contract, harness, model}`, and the oracle-suite version. Once field telemetry exists, benchmark scores are validated against field outcomes — a benchmark that doesn't predict real-world behavior gets revised ([predictive validity](#def-predictive-validity) is the final arbiter).

### 2.3 Task corpus engineering

- **Schema:** each task carries a fidelity frame, a prompt cluster (≥3 paraphrases — robustness to phrasing is measured, not assumed), a compliance checklist bound to oracles, a reference solution, a [contamination](#def-contamination) stratum, and provenance (field / generated / adversarial).
- **Sourcing:** LLM-assisted generation over the registry's coverage map with machine verification and revalidation (the MCPEval pattern); field failures converted to tasks with timestamps and model training cutoffs recorded (the SWE-rebench pattern) — newly released Salt components form a naturally decontaminated task stream; adversarial tasks covering gate-bypass temptations and frame-ambiguity (real users don't declare intent; the system must infer or ask).
- **Self-contamination control:** this repository is public, so committed benchmark items would enter future model training corpora and quietly invalidate the benchmark. [Golden tasks](#def-golden-dataset), reference solutions, and perturbation specs live in a **private assets repository**; all eval assets carry a [canary GUID](#def-canary) so leakage is detectable; aggregate scores are publishable, items are not.
- **Psychometric staging:** [classical test theory item statistics](#def-ctt) (difficulty, discrimination) from day one — valid at small sample sizes; [IRT](#def-irt) fitting (a [2PL model](#def-2pl)) only when the accumulated [response matrix](#def-response-matrix) is deep enough (published [benchmark-compression](#def-benchmark-compression) work fitted hundreds to thousands of respondent models); [adaptive testing](#def-adaptive-testing) and IRT-optimal CI subsets at the same maturity point. Until then, the nightly smoke subset is stratified-random with empirically reported reconstruction error.



### 2.4 Oracle hierarchy (what replaces lint-style checking)

Ordered by evidentiary strength:

1. **[Execution oracles](#def-execution-oracle) (primary):** compile/type-check against pinned real packages; render under Playwright with zero uncaught exceptions and [accessibility scanning](#def-a11y); interaction probes derived from the compliance checklist (tab order, navigation, declared states) in the production frame — prototype frames run render-only.
2. **Structural/semantic oracles:** import census (every `@salt-ds/`* symbol must exist in the installed package — the mechanical "no invention" check) via [AST analysis](#def-ast); prop census against docgen metadata; composition oracles from required-subtree contracts; systemic rules (e.g. the nested-Card class) — always as calibrated rule objects, never free-floating lint.
3. **Metamorphic oracles:** relations between runs rather than absolute correctness — INV-paraphrase (same meaning → same decision), INV-alias (surface-form variants → same entity), DIR-fidelity (prototype→production must raise review strictness — the structural fix for the `href="#"` class of error), DIR-evidence (removing evidence must revoke the implement decision — the `resolved_entities` bug as a standing relation), INV-order.
4. **Judge oracles (last resort, calibrated):** [LLM-as-judge](#def-llm-as-judge) scoring, reserved for genuinely non-mechanical dimensions. Requirements from the judge-bias literature: a [panel of judges](#def-judge-panel) from three model families (mitigating [self-preference](#def-self-preference-bias)); pairwise comparison aggregated with a [Bradley–Terry model](#def-bradley-terry) rather than absolute scores; position-swapping (mitigating [position bias](#def-position-bias)) and [length-controlled scoring](#def-length-controlled) (mitigating [verbosity bias](#def-verbosity-bias)); admission only after agreement with expert labels ([weighted kappa](#def-weighted-kappa) ≥ 0.6 on ≥100 items, [inter-rater reliability](#def-irr) tracked with [Krippendorff's alpha](#def-krippendorff)); judges never gate a release alone and never contribute to Q1–Q3.



### 2.5 The NLP/IR measurement core

- **[Entity linking](#def-entity-linking) (the** `not_found` **bug class, measured properly):** a gold link set mapping every public export, doc title, and curated alias to its canonical registry entity; scored by [accuracy@1](#def-accuracy-at-1) and candidate [recall@k](#def-recall-at-k). Deterministic, high-volume, tight [confidence intervals](#def-ci) — the right instrument for alias fixes, where end-to-end metrics would be underpowered.
- **Retrieval quality:** create-routing scored as a ranking problem against expert-graded [relevance judgments (qrels)](#def-qrels), reported as [nDCG@5](#def-ndcg) and recall@10. The qrels also settle **retrieval architecture** empirically: [lexical retrieval](#def-bm25) vs [dense retrieval](#def-dense-retrieval) vs [hybrid](#def-hybrid-retrieval) vs [cross-encoder reranking](#def-cross-encoder) (see H4, Part IV).
- **Counterfactual grounding (Q1 — the decisive experiment):** build [perturbed registries](#def-perturbed-registry) whose facts deliberately diverge from the public docs models memorized (renamed props, changed composition wrappers, fictional-but-fully-evidenced components — each passing a plausibility audit so agents aren't reacting to obvious artifacts); run matched trials production-vs-perturbed; score [three-way](#def-three-way-grounding) — *follows-registry*, *silently-follows-prior*, *surfaces-conflict* (flagging the discrepancy is grounded behavior, not failure). **CTR = grounded outcomes / perturbation-touching decisions.** [Memorization](#def-memorization) cannot fake this metric because correct behavior is defined *against* the memorized corpus; its null is sharp because the closed-book base rate of emitting a perturbed fact is ≈ 0. This is [counterfactual perturbation](#def-counterfactual-perturbation) methodology adapted from code-memorization research.
- **Evidence faithfulness (Q4):** [claim decomposition](#def-claim-decomposition) of workflow guidance into atomic claims, each checked against its cited source with an [NLI](#def-nli)-style verifier (human-validated); citation precision (cited source supports the claim) and citation recall (claims carry sources at all). Noting the literature's distinction between citation correctness and [faithfulness](#def-faithfulness): CTR is the causal complement — together they bracket true [groundedness](#def-groundedness).



### 2.6 Statistical inference (how a number becomes a claim)

Per *Adding Error Bars to Evals* (Miller, 2024) and the agentic-randomness literature (single-run pass@1 varies 2–6 points even at temperature 0):

1. **The unit of randomization is the task; paraphrases are clusters** → [clustered standard errors](#def-clustered-se) (naive errors can understate uncertainty ~3×).
2. **Always paired:** candidate vs baseline on identical tasks, paraphrase draws, [seeds](#def-temperature-seed), and model versions; inference on per-task [paired differences](#def-paired-difference) — a free variance reduction given high score correlations between systems.
3. **[Power analysis](#def-power) before running:** the [minimum detectable effect](#def-mde) decides whether the full corpus, a slice, or a high-volume component metric is the right instrument; changes with expected [effect sizes](#def-effect-size) below the MDE must target component metrics — this is how noise never gets claimed as progress.
4. **Report the envelope:** avg@k (central tendency) and pass^k (reliability floor) — [pass@k](#def-pass-at-k) alone flatters inconsistent agents.
5. **Budget by [variance decomposition](#def-variance-decomposition):** allocate spend between more tasks vs more repeat trials to minimize error per dollar.
6. **[Pre-registration](#def-pre-registration) and [non-inferiority guards](#def-non-inferiority):** one primary endpoint per experiment declared in the PR; all other endpoints guarded so improving one cannot silently degrade another. Proportions carry [Wilson intervals](#def-wilson-ci); resampling uses the [bootstrap](#def-bootstrap).

**The gate as selective prediction (Q3):** sweep the gate's operating points to trace the risk–coverage curve; a gate improvement claim is a curve shift, not a single-cell delta — preventing the [Goodhart failure](#def-goodhart) of "fixing" false-allows by blocking everything.

### 2.7 Baselines and falsification

Standing conditions on every full run: the [evaluation baselines (B0–B3)](#def-baselines) — **B0** [closed-book](#def-closed-book) (no MCP — the memorization floor), **B1** naive [RAG](#def-rag) (relevant docs retrieved by [embedding](#def-embedding-model) search and stuffed in context — no tools, no gate), **B2** retrieval-only MCP (reference lookup without workflow/gate), **B3** the full product. Pre-committed decision rules: B3 ≤ B1 → redesign the contract; B3 ≈ B2 → simplify the gate; low CTR under B3 but high under B2 → the contract layer is diluting grounding. A benchmark that cannot embarrass the product is marketing.

---



## Part III — Content & systemic guidance (the design-system team's workstream)

The registry only knows what the docs corpus encodes, and Salt correctness is *relational* — five individually-valid Cards nested inside each other is wrong Salt. Two mechanisms make content a measured, first-class system-under-test:

- **[Failure attribution](#def-failure-attribution):** every benchmark failure is routed through a decision tree — guidance present in registry? retrieved? present in raw docs but lost in extraction? absent everywhere? — decomposing failures into four owned rates: adherence gaps (skill/contract), retrieval gaps (tooling), extraction gaps (registry build), and **content gaps (documentation team)**. [Counterfactual replay](#def-counterfactual-replay) (re-running a failed [trajectory](#def-trajectory) with one substituted tool response) supplies causal evidence for ambiguous cases.
- **[Oracle-context ablations (C1 / C2)](#def-oracle-context-ablation):** run matched tasks under production registry (C1) vs hand-authored ideal context packs (C2). The headroom C2 − C1 is the *causal* measure of what better documentation would buy, and it converts the docs backlog from taste into a ranked, evidenced queue. Docs changes bump the registry version and are experiments like any code change.
- **Systemic usage rules:** relational correctness (nesting discipline, layout ownership, heading order, density consistency) encoded once as calibrated [rule objects](#def-rule-object) and consumed three ways — served as workflow evidence *before* code is written, checked by `review_salt_ui`, and used as benchmark oracles (with [seeded-defect](#def-mutation-testing) mutants per rule) — so what we teach, check, and measure cannot drift apart. Judgment-only principles stay retrievable and route to the human/judge rubric.
- **Gap surfacing:** the contract's built-in "we don't know" signals (`questions`, `internal_limitations`, heuristic-fallback evidence) are aggregated into a gap ledger; recurring clusters become docs tasks and new golden tasks under a one-week failure-to-fixture service level.

---



## Part IV — Delivery plan



### 4.1 The one management rule

Every engineering investment is a pre-registered hypothesis with a named endpoint from §2.1 and a paired before/after run. No endpoint, no build. This is the entire governance model.

### 4.2 Four workstreams, one instrument


| Workstream                      | Mandate                                                                                                | First shippable                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| **WS1 — Product Engineering**   | The MCP server, contract, skill, and the retrieval/grounding engine inside them                        | H1 alias layer                                   |
| **WS2 — Evaluation Science**    | [SaltBench](#def-saltbench) per Part II; owns endpoints, statistics, and the veto on unmeasured claims | Stats library + entity-linking gold set          |
| **WS3 — Content & Registry**    | Registry completeness, composition contracts, docs gaps (design-system team owns this backlog)         | Composition trees for top-20 compound components |
| **WS4 — Platform & Governance** | CI, private assets repo, LLM gateway integration, telemetry, cost                                      | Private eval-assets repo + model pinning         |




### 4.3 Product backlog as ranked hypotheses


| #      | Build                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Judged by                                                     | Rationale                                                                             |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **H1** | Entity-linking & alias layer (deterministic export/doc-title/alias resolution + fuzzy fallback)                                                                                                                                                                                                                                                                                                                                                                                                                   | accuracy@1, recall@k on the gold set                          | Known bug (`VerticalNavigation` et al. resolve `not_found` today); day-one measurable |
| **H2** | Evidence honesty in the gate (`resolved_entities` verified against actual retrievals; per-component evidence scoping)                                                                                                                                                                                                                                                                                                                                                                                             | DIR-evidence relation; gate risk–coverage shift               | Closes the mechanically confirmed gate bypass                                         |
| **H3** | Composition contracts (machine-checkable required subtrees), consumed by create/migrate evidence, review, and eval simultaneously                                                                                                                                                                                                                                                                                                                                                                                 | Composition-class CTR; seeded-mutant recall                   | The `VerticalNavigationItemContent` failure class                                     |
| **H4** | Retrieval architecture bake-off: tuned lexical+alias vs dense [bi-encoder](#def-dense-retrieval) vs hybrid vs +reranking — under the offline-catalog constraint (dense requires bundling a [quantized ONNX](#def-onnx) embedding model). Engineering prior stated honestly: at this corpus scale an in-process [vector index](#def-vector-index) (e.g. [HNSW](#def-hnsw)) suffices; **no dedicated [vector database](#def-vector-database) cluster unless the qrels say dense wins by a margin that pays for it** | nDCG@5 / recall@10 on qrels, plus latency and deployment cost | Settles the architecture debate with data, not fashion                                |
| **H5** | Fidelity-frame intent handling: workflows infer prototype/production intent or ask one clarifying question; review severity conditions on it                                                                                                                                                                                                                                                                                                                                                                      | DIR-fidelity relation; frame-ambiguity adversarial tasks      | The product-side half of the `href="#"` fix                                           |
| **H6** | Minimal starter snippets (≤ ~40 lines, replacing full-Storybook payloads)                                                                                                                                                                                                                                                                                                                                                                                                                                         | FD on create tasks; payload guard budgets                     | Oversized starters caused wrapper-dropping trims in the field                         |
| **H7** | Systemic usage rules (Part III) as shared rule objects                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Systemic-class FD; mutant recall                              | Only after H1–H5 — rules without frame machinery recreate the lint trap               |




### 4.4 Instrument build order (compressed)

- **Weeks 1–2:** statistics library (clustered errors, paired inference, power); entity-linking gold set (~~300 surface forms, agent-drafted, expert-verified); qrels v1 (~~100 graded queries); rule-object schema + calibration harness.
- **Weeks 3–6:** perturbed-registry builder + CTR pilot (one model, three perturbation classes, three-way scoring); 25-task pilot corpus with frames, prompt clusters, reference solutions, shortcut audits; runner decision spike (extend the in-repo harness vs adopt an OTel-native MCP eval framework — one week, then commit).
- **Weeks 7–12:** execution oracles; corpus to ~60 audited tasks; B0–B3 baselines; gate risk–coverage instrumentation; [simulated-user](#def-simulated-user) flows for blocking-question paths; judge panel admitted only per the κ gate.



### 4.5 Humans + agents

Coding agents are a first-class workforce under the same rule as the product: every agent task has a spec in the repo, a mechanical oracle for "done", and a named human reviewer. **Agent-executable now:** census and gold-set scaffolding, rule-object harness, perturbed-registry builder, stats library, composition-tree extraction drafts. **Human-required:** qrel grading, oracle adjudication, perturbation plausibility audits, intent-policy decisions, judge-validation labels, kill/pivot calls. One recurring meeting (60 min/week): read scorecard deltas, adjudicate sampled oracle firings, convert new failures to tasks, re-rank the H-backlog.

### 4.6 Platform & compliance

Everything self-hosted; no trace egress; models via the approved internal LLM gateway with versions pinned per quarter; scores and traces persisted as repo/CI artifacts (optional self-hosted Langfuse for browsing/annotation — storage is replaceable, decisions read repo scorecards); [token budgets](#def-token-budget) and cost as guard metrics on every run; [OpenTelemetry](#def-otel) spans for trace capture; the private-assets/canary regime from §2.3 enforced from day one.

### 4.7 30 / 60 / 90 with falsifiable exits

- **Day 30 — "Known bugs are fixed and the fixes are measured."** H1+H2 shipped behind paired component-metric evidence; gold sets, stats library, rule harness, private repo live; CTR pilot running. *Exit test:* the §1.2 failure chain, replayed, now blocks where it previously invented.
- **Day 60 — "We know if grounding is real."** CTR read with three-way breakdown → **go/no-go on the grounding architecture** (pivot to contract redesign if CTR ≈ base rate). Corpus ~60 tasks; execution oracles live; H3 serving. *Exit test:* the pre-registered CTR claim resolved either way, in writing.
- **Day 90 — "We know if the product beats the cheap alternative."** B0–B3 run; the product-value hypothesis ("B3 > B1 on FD, 95% CI excluding 0") resolved; H4 decided from qrels; first quarterly benchmark report. *Exit test:* a written verdict — improve, simplify, or overhaul — with the backlog re-ranked accordingly.

**Pre-committed kill/pivot criteria:** CTR ≈ closed-book base rate → redesign grounding; B3 ≤ B1 → redesign the workflow contract; gate dominated by trivial policies → simplify the gate.

### 4.8 Top risks (decision-changing only)

1. CTR pilot returns "ungrounded" → that is the program *working*; the pivot path is pre-agreed and resourced.
2. Expert time becomes the bottleneck → agents pre-draft, humans verify — never the reverse for gold data.
3. Public-repo self-contamination → private assets repo + canaries from day one; audit before any external publication.
4. Oracle debt under delivery pressure → uncalibrated rules are advisory *by mechanism*; the harness refuses to count them.
5. Metric theater → a metric that never gates a decision for two quarters is deleted.

---



## Part V — Provenance

This document consolidates four prior internal workstreams into one authoritative plan:

| Source material | Role in this plan |
| --- | --- |
| Field evidence | The recorded failure chain (§1.2); seed benchmark tasks; the "invention from memory" motivation |
| v1 evaluation program design | Part III (content & systemic guidance); fixture repos, host-trace rule engine, context ablations, failure attribution |
| v2 measurement methodology | Part II (five questions, validity discipline, oracles, NLP/IR core, statistics, baselines) |
| Delivery sequencing | Part IV (governance rule, workstreams, H-backlog, 30/60/90 milestones, risks) |

Prior drafts are superseded. Maintain archived copies separately for internal audit; circulate this file to stakeholders.


---



## Appendix A — Glossary of technical terms

Plain-English definitions for specialist terms used in this document. Each entry includes a layman example tied to the Salt AI tooling program. Grouped by domain.

### Program metrics, baselines & product architecture

- **SaltBench** — The controlled, repeatable benchmark program (Part II) that scores the full agent + MCP + skill + registry stack against pre-registered questions, baselines, and falsification rules. **In plain terms:** SaltBench is the "clinical trial" for our AI tooling — not a one-off demo, but a standing exam that can say "grounding is real" or "redesign the contract" with evidence.
- **Counterfactual Tracking Rate (CTR)** — The fraction of perturbation-touching decisions where the agent follows the live (perturbed) registry, surfaces the conflict, or otherwise behaves in a grounded way — as opposed to silently emitting memorized public-docs facts. **CTR = grounded outcomes ÷ perturbation-touching decisions.** Primary metric for Q1. **In plain terms:** We secretly change one fact in the catalog (e.g. rename a prop) and watch the agent: if it uses the new name, it is listening to our server; if it uses the old public-docs name from memory, CTR drops. Day 60 is a go/no-go on whether that rate beats the closed-book floor by a clear margin.
- **Functional Delivery (FD)** — A [severity-weighted](#def-severity-weighted) score of whether benchmark tasks produce working, intent-appropriate Salt UI — verified by running the code (compile, render, interaction, [a11y](#def-a11y) in production frame), not by human opinion alone. Reported as [avg@k](#def-avg-at-k) + [pass^k](#def-pass-hat-k). Primary metric for Q2. **In plain terms:** FD answers "did the whole system actually ship UI that works?" — a dashboard that compiles but omits `VerticalNavigationItemContent`, fails keyboard navigation, or ignores the prompt scores lower than one that passes every checklist item.
- **Evaluation baselines (B0–B3)** — Four standing comparison conditions run on identical tasks in every full SaltBench evaluation, from weakest to strongest tooling. **B0 (closed-book):** LLM only, no MCP — the memorization floor. **B1 (naive RAG):** relevant docs stuffed into the prompt via embedding search — no tools, no gate — the "cheap alternative." **B2 (retrieval-only MCP):** reference lookup without workflow or implement gate. **B3 (full product):** complete `@salt-ds/mcp` with contract, gate, and skill. **In plain terms:** B1 is "paste the manual into ChatGPT"; B3 is "use our librarian with safety rules." Day 90 asks whether B3 beats B1 on FD — if not, the workflow adds no value over context stuffing and we redesign.
- **Registry (offline catalog)** — A generated, read-only knowledge base inside `@salt-ds/mcp` built from Salt docs and source — component exports, composition rules, examples, and aliases — that tools query instead of trusting model memory. **In plain terms:** The registry is the live "answer key" the MCP librarian reads from; when it returns `not_found` for real exports like `VerticalNavigation`, the agent falls back to stale training data — the H1 bug class.
- **Decision contract (**`salt_workflow_v1`**)** — A compact, typed JSON response shape returned by workflow tools (`create_salt_ui`, etc.) that tells the agent what it may do next — implement, block, ask questions — and what evidence supports that decision. **In plain terms:** The contract is the traffic light: green only when evidence is complete and safe; the field session showed the light turning green while key lookups had failed — H2 fixes that honesty gap.
- **Implement gate / hard gate** — The contract rule that agents may write Salt UI code only when `status: success`, `action.kind: implement`, `safety.exact_request_safe: true`, and `evidence.status: complete` all hold — evaluated as a [selective classifier](#def-selective-classifier) in Q3. **In plain terms:** The gate is the bouncer: "no evidence, no code." Q3 asks whether it is a good bouncer (blocks risky allows, permits good work) — not one that waves everyone through or rejects everyone.
- **Agent skill** — A packaged instruction file (e.g. in Cursor) that tells the AI assistant to call MCP tools, follow the decision contract, and stop when blocked. **In plain terms:** The skill is the employee handbook for the coding assistant; the field failure was a *joint-system* break — correct handbook plus broken gate plus bad registry data still shipped wrong UI.
- **Joint-system evaluation** — Testing the full loop — LLM + agent host + skill + MCP + registry + contract + generated code — rather than any layer in isolation. **In plain terms:** Contract unit tests all passed while the real Cursor session invented components; SaltBench exists because the product fails at the seams between layers, not inside one file.
- **Perturbed registry** — A private variant of the production registry with deliberately altered facts (renamed props, changed wrappers, fictional components) used in matched trials against the real registry to measure CTR. **In plain terms:** Same exam, two answer keys — public-docs version vs our secretly edited version. Whichever key the agent follows reveals whether it trusts the server or its memory.
- **Three-way grounding score** — The CTR breakdown classifying perturbation-touching decisions as *follows-registry* (uses perturbed fact), *silently-follows-prior* (uses memorized public-docs fact without flagging), or *surfaces-conflict* ( notices mismatch and asks or warns — counted as grounded). **In plain terms:** Not every "wrong" answer is equal — an agent that says "the catalog says X but docs say Y, which should I use?" is doing the right thing; one that silently ships the old docs name is not.
- **Compliance checklist** — The per-task list of individually checkable requirements (imports, composition, a11y, interaction) that [oracles](#def-test-oracle) enforce — the task's definition of "done." **In plain terms:** Instead of "build a good dashboard," the checklist says "uses `BorderLayout`, wraps nav items correctly, tab order works" — each item maps to a mechanical pass/fail rule.
- **Prompt cluster** — A set of ≥3 paraphrases of the same user intent attached to one benchmark task, used to test robustness to wording ([INV](#def-inv)-paraphrase). **In plain terms:** "Build a financial dashboard," "I need a dashboard for finance metrics," and "dashboard UI please" are one task, three phrasings — the system should not flip from implement to block just because the user reworded the ask.
- **Rule object (calibrated oracle rule)** — A typed scoring rule with an applicability predicate, [fidelity-frame](#def-fidelity-frame) conditions, severity, and mandatory calibration cases (`must_fire` / `must_not_fire`) — never free-floating lint. **In plain terms:** The `href="#"` rule is a rule object: must *not* fire on prototype frames, must fire on production frames — and it does not count toward FD until calibration proves it fires when it should.
- **Failure attribution** — A decision tree routing each benchmark failure to an owned gap type: adherence (skill/contract), retrieval (tooling), extraction (registry build), or content (documentation). **In plain terms:** When a task fails, we ask "was the answer in the docs but not in the registry?" (extraction) vs "never documented anywhere?" (content gap) — so the design-system docs backlog is ranked by measured headroom, not taste.
- **Oracle-context ablation (C1 / C2)** — A matched comparison running the same tasks with the production registry (C1) vs hand-authored ideal context packs (C2); **C2 − C1** estimates how much better documentation would improve scores. **In plain terms:** C1 is "what the system knows today"; C2 is "what it would score with perfect docs." The gap tells the content team which doc fixes buy the most FD — not which pages *feel* important.
- **Falsification condition / overhaul trigger** — A pre-declared result that forces redesign rather than incremental tuning — attached to every Q1–Q5 endpoint. **In plain terms:** "CTR ≈ base rate → redesign grounding" is not pessimism — it is the agreed fire alarm. The program is designed to *fail loudly* when the architecture is wrong, not spin forever.
- **Goodhart failure** — When optimizing a metric destroys the underlying goal — e.g. improving gate precision by blocking everything. **In plain terms:** A bouncer who rejects every guest has zero false-allows but kills the venue — Q3 uses the full [risk–coverage curve](#def-risk-coverage), not one cell, to catch "winning" by blocking all work.
- **Reporting validity** — The ABC pillar requiring every published score to carry sample sizes, uncertainty, version pins, and enough context to interpret or reproduce the number. **In plain terms:** The quarterly scorecard shows "FD 71 ± 3, n=60 tasks, k=3 seeds, MCP v0.2.1" — not a bare "71%" that hides whether one lucky run drove the headline.
- **Predictive validity** — Whether benchmark scores correlate with real-world outcomes once field telemetry exists — the final check that SaltBench measures what matters. **In plain terms:** If teams using MCP score high on SaltBench but still ship invented components in production, the benchmark is a vanity exam and gets revised.
- **Agentic Benchmark Checklist (ABC standard)** — A NeurIPS 2025 audit framework (Zhu et al.) for agent benchmarks covering outcome, task, and reporting validity — adopted here as a standing quality bar. **In plain terms:** ABC is the checklist that stops SaltBench from becoming "a quiz with trick questions" — e.g. scoring placeholder links wrong on prototype tasks can inflate or deflate FD by up to 100% relative on public benchmarks.



### Statistics & experimental design

- **Confidence interval (CI)** — A range around a measured result that expresses how uncertain we are about the true underlying value; wider intervals mean less certainty. **In plain terms:** If SaltBench reports "Functional Delivery improved by 8–15 points, 95% CI," we are saying the real improvement is *probably* in that band — not that we know the exact number. Without the interval, a headline "+12 points" could be random noise from a lucky run.
- **Clustered standard errors** — A method for computing uncertainty when repeated measurements are related (clustered) rather than independent — here, when the same task is asked in multiple paraphrases. Naive errors treat paraphrases as separate experiments and can understate uncertainty by ~3×. **In plain terms:** "Build a dashboard," "I need a dashboard UI," and "dashboard please" are three ways of asking the *same* exam question — not three independent coin flips. Clustered errors count them as one family.
- **Paired-difference analysis** — Comparing two systems on identical tasks and analyzing the per-task score difference, rather than comparing separate averages. **In plain terms:** Instead of "full MCP scored 70" vs "docs-dump scored 65," we ask on each of the 60 benchmark tasks: "how much did B3 beat B1 *this time*?" Hard tasks tend to be hard for both, so pairing removes a lot of noise for free.
- **Bootstrap (resampling)** — A simulation technique that repeatedly resamples the observed data to estimate how much results would wobble if the experiment were repeated. **In plain terms:** Like shuffling the same deck of benchmark scores thousands of times to see how often your "we won" conclusion still holds — without paying to re-run 60 tasks with a live LLM each time.
- **Statistical power / power analysis** — The probability that an experiment of a given size will detect a real effect if one exists; power analysis decides sample size *before* running. **In plain terms:** Before spending a quarter's LLM budget on B0–B3, we calculate: "If the product is only 3 points better, would 60 tasks even notice?" If not, we either run more tasks or switch to a sharper component metric like entity-linking accuracy@1.
- **Minimum detectable effect (MDE)** — The smallest improvement an experiment of a given size and design can reliably distinguish from zero. **In plain terms:** With 25 pilot tasks, we might only be able to detect a CTR swing of ±15 points — too blunt to judge a small alias fix. MDE tells us when to use the full corpus vs a high-volume gold-set test instead.
- **Effect size** — How large a measured difference is, separate from whether it is statistically significant. **In plain terms:** "Statistically significant" only means "probably not zero" — effect size answers "but is it *worth shipping*?" A gate change that blocks 0.1% more bad code with 40% fewer good allows might be significant but too small to matter.
- **Pre-registration** — Declaring the primary question, metric, and success threshold in writing *before* results are known, so post-hoc cherry-picking is ruled out. **In plain terms:** The Day-60 CTR go/no-go is decided by a claim written in the PR before the pilot runs — not by whichever number looked best after the fact.
- **Non-inferiority guard** — A secondary check ensuring that improving one endpoint did not silently degrade another beyond an agreed tolerance. **In plain terms:** Fixing the gate to crush false-allows (Q3) must not tank Functional Delivery (Q2) below an acceptable floor — we guard both, not just the metric we optimized.
- **Wilson confidence interval** — A confidence interval method suited to proportions (pass rates, CTR) that behaves well even with small sample sizes. **In plain terms:** When CTR is measured on only 30 perturbation-touching decisions, Wilson intervals give honest uncertainty bands for "62% grounded" — better than naive intervals that can imply false precision.
- **Base rate** — The outcome rate observed under a baseline condition with no intervention — here, closed-book LLM behavior without MCP tooling. **In plain terms:** If an agent asked to build Salt UI *without* our server still emits perturbed prop names ~0% of the time, that near-zero rate is the memorization floor. CTR must clearly beat it, or the evidence layer is decorative.
- **Variance decomposition** — Breaking total score variability into sources (which task, which paraphrase, which random seed, which model) to decide where to spend the next evaluation dollar. **In plain terms:** If most wobble comes from random LLM retries rather than task choice, buying 5 more seeds per task helps more than adding 5 more tasks — decomposition tells us which.



### Psychometrics & benchmark science

- **Classical test theory (CTT) item statistics** — Simple per-task metrics — difficulty (how often systems pass) and discrimination (whether passing this task correlates with passing the benchmark overall) — used to flag broken exam questions. **In plain terms:** If every system fails "VerticalNavigation composition" except the worst one, that task's discrimination goes negative and we suspect the oracle is broken, not the product.
- **Point-biserial discrimination** — A CTT statistic measuring whether high-performing systems pass a given task more often than low-performing ones. **In plain terms:** A good SaltBench task separates strong MCP runs from weak ones; a task with negative point-biserial correlation means "doing well overall predicts *failing* this task" — a red flag for a miscalibrated rule.
- **Item response theory (IRT) / IRT fit** — A statistical model that estimates both task difficulty and system ability on a shared scale, enabling fairer comparisons once enough data exists. **In plain terms:** After hundreds of model×task runs, IRT can say "this composition task is inherently harder than this alias task" and score different MCP versions on the same ruler — but we wait until the response matrix is deep enough.
- **Two-parameter logistic (2PL) model** — An IRT model where each task has two parameters: difficulty and discrimination (how sharply it separates able from less-able systems). **In plain terms:** Some benchmark tasks are hard but uninformative (everyone fails); 2PL distinguishes "hard and diagnostic" (good gate-bypass adversarial) from "hard and noisy" (bad oracle).
- **Response matrix / "matrix depth"** — A table of pass/fail (or score) outcomes with rows = tasks (or systems) and columns = trials/models; "depth" means enough rows and columns to fit richer models like IRT. **In plain terms:** 60 tasks × 4 baselines × 3 seeds is a shallow matrix; 500 tasks × 20 models is deep enough for IRT and adaptive testing — we stage ambition to match depth.
- **Benchmark compression** — Techniques to estimate full-benchmark scores from a smaller subset while quantifying reconstruction error — often powered by IRT. **In plain terms:** Nightly CI cannot run all 60 tasks × B0–B3 every night; compression picks a stratified smoke subset and reports "estimated full FD = 71 ± 2" with documented error.
- **Adaptive testing** — Choosing the next benchmark task based on prior answers to measure ability with fewer items — standard in large-scale testing, applied here once IRT is mature. **In plain terms:** After a system fails easy alias tasks, adaptive testing skips "easy wins" and probes composition and gate-bypass tasks — like a doctor ordering follow-up tests based on symptoms, not a fixed checklist every time.
- **Outcome validity** — Whether the scoring rules actually measure what we intend (working, intent-appropriate Salt UI) rather than a proxy that drifts from the goal. **In plain terms:** A rule that flags `href="#"` on a production-frame task but not a prototype-frame task has outcome validity; a rule that always fires has none — it measures lint noise, not product quality.
- **Task validity** — Whether each benchmark task is solvable, requires the capability under test, and cannot be passed via shortcuts unrelated to MCP grounding. **In plain terms:** Every task ships a reference solution proving it is doable; the shortcut audit confirms a closed-book model *cannot* pass without tooling — otherwise the task is measuring general coding, not Salt MCP value.
- **Golden dataset / golden task** — Privately held, expert-verified benchmark items (tasks, reference solutions, perturbation specs) treated as ground truth and kept out of public repos. **In plain terms:** The `VerticalNavigation` failure chain becomes a golden task in a private repo — if that exact prompt later appears in model training data, a canary GUID detects leakage.
- **Inter-rater reliability (IRR)** — How consistently two or more human (or model) raters assign the same labels to the same items. **In plain terms:** If two design-system experts disagree on whether a generated dashboard meets the compliance checklist half the time, oracle labels are not trustworthy enough to gate releases.
- **Krippendorff's alpha** — A general IRR coefficient that handles missing ratings and multiple raters; α = 1 is perfect agreement, 0 is chance. **In plain terms:** When three experts adjudicate sampled oracle firings each week, Krippendorff's alpha tracks whether their "pass/fail" judgments are converging — low α means the rubric needs work before it drives decisions.
- **Weighted kappa (κ)** — An IRR measure that penalizes larger disagreements more than small ones — used here as the admission bar (κ ≥ 0.6) for LLM judges. **In plain terms:** Before an LLM judge scores "visual hierarchy quality," it must agree with human labels on ≥100 items at κ ≥ 0.6 — otherwise it stays off the release path.



### Machine learning & AI agents

- **Large language model (LLM)** — A neural network trained on vast text to predict likely continuations; it can generate code and explanations but has no live connection to truth unless tooling supplies it. **In plain terms:** The model "remembers" old Salt docs from training and confidently invented `VerticalNavigation` structure from that stale memory — which is exactly what MCP is meant to replace.
- **AI agent / agentic system** — An LLM wrapped in a loop that can call tools, read files, write code, and pursue multi-step goals with limited human steering. **In plain terms:** Cursor plus the Salt skill plus our MCP server is an agent: it planned a dashboard, called `create_salt_ui`, wrote files, and declared victory even when review returned `blocked`.
- **Model Context Protocol (MCP)** — An open standard for AI assistants to call external tools and read structured resources through a server — here, `@salt-ds/mcp`. **In plain terms:** Instead of the assistant guessing Salt APIs from memory, it plugs into our server like a specialist librarian who can look up components, run workflows, and refuse unsafe requests — if the contract is working.
- **LLM-as-judge** — Using an LLM to score outputs on subjective dimensions when mechanical checks cannot. **In plain terms:** "Does this dashboard layout match the user's intent?" may need a judge; "Does `VerticalNavigationItemContent` wrap every item?" does not — that is an execution oracle.
- **Judge panel (panel of LLM judges)** — Multiple judge models from different families whose scores are aggregated, reducing single-model quirks. **In plain terms:** One judge might favor verbose Salt code; a panel of three model families mitigates that before any subjective score influences backlog ranking — and judges never gate releases alone.
- **Position bias** — A systematic tendency for LLM judges to prefer whichever answer appears first (or last) regardless of quality. **In plain terms:** If we ask "is solution A or B better?" and always put the MCP output first, the judge may skew toward A — so we swap order and average.
- **Verbosity (length) bias** — A tendency for judges to rate longer answers higher even when shorter answers are correct. **In plain terms:** An agent that dumps every Salt doc paragraph might beat a concise correct implementation in naive judging — length-controlled scoring strips that advantage.
- **Self-preference bias** — A tendency for a model to rate its own outputs (or stylistically similar ones) more favorably. **In plain terms:** Using the same model family as both coder and judge can inflate scores; the panel requirement exists partly to break that loop.
- **Bradley–Terry aggregation** — A statistical model that estimates relative quality from pairwise "A beats B" comparisons rather than absolute scores. **In plain terms:** Instead of each judge giving "7/10," we ask "which dashboard run better matches the prompt?" many times and aggregate wins — more stable for comparing B1 vs B3.
- **Length-controlled scoring** — Judge prompts or normalization that account for answer length so verbosity does not dominate the score. **In plain terms:** When comparing a 200-line over-explained migration to a 40-line correct one, length control prevents the judge from treating word count as quality.
- **pass@k** — The probability that at least one of *k* independent attempts succeeds — it rewards "lucky once" behavior. **In plain terms:** pass@5 = 80% means "if the agent gets five tries, it usually succeeds once" — even if four of five runs ship broken UI.
- **pass^k** — The probability that *all k* independent attempts succeed — a reliability floor. **In plain terms:** pass^3 = 40% means "three consecutive runs all deliver working Salt UI" only 40% of the time — exposing inconsistency that pass@3 might hide.
- **avg@k** — The average score (or pass rate) across *k* attempts — a central-tendency measure paired with pass^k for reliability. **In plain terms:** avg@3 might be 75% while pass^3 is 40% — the agent is "usually okay" but not dependable; both numbers belong on the quarterly scorecard.
- **Data contamination** — Benchmark tasks or answers leaking into model training data, inflating scores without real capability. **In plain terms:** Because salt-ds is public, committed benchmark prompts could train future models to "know the exam answers"; private golden tasks and canary GUIDs exist to detect and prevent that.
- **Memorization / pretraining prior** — Facts and patterns absorbed during LLM training that the model recalls without live evidence — often stale for evolving libraries like Salt. **In plain terms:** The field session's agent built `VerticalNavigation` from training memory, omitting `VerticalNavigationItemContent` — memorization looked plausible and was wrong.
- **Closed-book evaluation** — Testing the LLM without access to retrieval tools or MCP — isolating what it can do from memory alone (baseline B0). **In plain terms:** B0 is "no librarian allowed" — if closed-book already passes SaltBench tasks, the MCP adds no value and the benchmark task failed the shortcut audit.
- **Counterfactual perturbation** — Deliberately changing registry facts away from public docs to see whether the agent follows live evidence or memorized priors. **In plain terms:** We rename a prop in the private perturbed registry only; if the agent still emits the public-docs name, it is following memory — the core CTR experiment.
- **Canary GUID / canary string** — A unique secret string embedded in private benchmark assets; if it appears in model outputs or training dumps, leakage is proven. **In plain terms:** Like planting an invisible dye in exam papers — if a future model regurgitates the canary, we know the benchmark leaked into training.
- **Temperature and seed (sampling controls)** — Settings that control randomness in LLM outputs; the seed fixes the random stream for reproducibility. **In plain terms:** Even at temperature 0, pass@1 can swing 2–6 points run-to-run — so B3 vs B1 comparisons pin the same seeds on the same tasks, paired.
- **Simulated user** — An automated script or LLM playing the user role in multi-turn flows — e.g. answering the workflow's clarifying question about prototype vs production. **In plain terms:** H5 requires the system to ask "is this a prototype or production build?" — simulated users supply answers so we can test blocking-question paths without a human in the loop every run.
- **Trajectory (agent execution trace)** — The full record of an agent run: prompts, tool calls, tool responses, file writes, and declarations of completion. **In plain terms:** The §1.2 field-session failure chain *is* a trajectory — it shows the gate flipping to success, code being written, review returning `blocked`, and the agent stopping anyway.
- **Counterfactual replay** — Re-running a saved trajectory while swapping one tool response (e.g. correct alias lookup instead of `not_found`) to test causal blame. **In plain terms:** Replay the dashboard session but inject a successful `VerticalNavigation` retrieval — if the composition bug persists, the fault is not alias resolution alone.
- **Shortcut audit** — A floor-model closed-book run proving a task cannot be passed without the capability under test. **In plain terms:** Before a task enters SaltBench, we verify B0 fails it — otherwise we are measuring generic React skill, not MCP grounding.
- **Token budget** — A per-run cap on LLM tokens (input + output) enforced as a cost and fairness guard. **In plain terms:** H6 exists because oversized Storybook starters ate the context window and caused wrapper-dropping trims — token budgets catch payloads that make agents fail for economic reasons, not skill reasons.



### Information retrieval & NLP

- **Entity linking** — Mapping a surface form (export name, doc title, alias) to the canonical registry entity it refers to. **In plain terms:** When the agent asks for `VerticalNavigation`, entity linking should resolve to the real catalog entry — not `not_found`, which triggered the memorization fallback in the field session.
- **Alias resolution** — The subsystem that matches alternate names (doc titles, colloquial names, fuzzy spellings) to canonical entities — the H1 fix target. **In plain terms:** If docs say "vertical nav" but exports say `VerticalNavigation`, alias resolution connects them; today export names themselves fail, which is the known bug class.
- **Relevance judgments (qrels)** — Expert labels of which registry documents are relevant to which queries — the ground truth for retrieval bake-offs (H4). **In plain terms:** For the query "layout component with regions," qrels list which catalog chunks a human would want retrieved — without them, nDCG@5 is meaningless.
- **nDCG@k (normalized discounted cumulative gain)** — A ranking metric rewarding relevant documents appearing near the top of the top-*k* results. **In plain terms:** If the best Salt composition doc appears 9th in retrieval, nDCG@5 punishes that — H4 compares BM25 vs dense vs hybrid by who puts the right evidence first.
- **Recall@k / candidate recall** — The fraction of true matches found within the top *k* candidates returned. **In plain terms:** recall@10 asks "did the right entity appear anywhere in the first 10 lookup hits?" — important for alias layers with fuzzy fallback where accuracy@1 alone is too harsh.
- **Accuracy@1** — Whether the single top-ranked candidate is correct. **In plain terms:** For `StackLayout`, does the first lookup result map to the real `StackLayout` entity? H1 is judged primarily here on ~300 gold surface forms.
- **Lexical retrieval / BM25** — Keyword-based search scoring term overlap between query and document — strong for exact names like `@salt-ds/core`. **In plain terms:** Searching the catalog for "VerticalNavigation" by spelling match — fast and deterministic, often enough at Salt's corpus scale.
- **Dense retrieval / bi-encoder embeddings** — Representing queries and documents as vectors and retrieving by semantic similarity rather than exact words. **In plain terms:** "side navigation panel" might retrieve `VerticalNavigation` even without shared keywords — useful if qrels show lexical search misses paraphrases.
- **Hybrid retrieval** — Combining lexical and dense scores (e.g. weighted fusion) to get both exact-match precision and semantic recall. **In plain terms:** Use BM25 when the user names `GridLayout`; use embeddings when they say "responsive grid wrapper" — hybrid merges both signals.
- **Cross-encoder reranking** — A second model that jointly scores each query–document pair for relevance, applied to a short candidate list after initial retrieval. **In plain terms:** Retrieve 50 chunks quickly, then rerank the top 10 with a slower but sharper model — trading latency for nDCG@5 on create-routing.
- **Vector index** — A data structure storing embedding vectors and supporting fast nearest-neighbor search. **In plain terms:** The offline MCP catalog can ship an in-process index over a few thousand doc chunks — no separate infrastructure required unless H4 proves dense wins big.
- **HNSW (hierarchical navigable small world index)** — A popular approximate nearest-neighbor algorithm used in many vector indexes — fast search with tunable recall–speed tradeoff. **In plain terms:** Like a well-organized library map for embeddings: not guaranteed perfect, but finds "nearby" Salt docs in milliseconds on a laptop-class server.
- **Vector database** — A managed service or cluster optimized for storing and querying large embedding collections — proposed only if qrels justify the ops cost. **In plain terms:** We do not stand up Pinecone-by-default; if BM25 + in-process HNSW wins the bake-off, a vector DB cluster is engineering theater.
- **Embedding model** — A model that maps text to fixed-length vectors capturing semantic similarity — bundled for dense retrieval (B1 baseline and H4 candidates). **In plain terms:** The B1 "docs-dump" baseline embeds the user prompt and pulls the nearest Salt doc chunks — tools and gates stripped, context stuffing only.
- **Quantized ONNX model** — An embedding model exported to ONNX format and compressed (quantized) for smaller size and faster CPU inference inside the MCP server. **In plain terms:** Dense retrieval inside `@salt-ds/mcp` cannot depend on a GPU cluster — a quantized ONNX bi-encoder keeps the server self-contained and bank-deployable.
- **Retrieval-augmented generation (RAG)** — Prompting an LLM with retrieved documents instead of relying on memory alone — baseline B1 in this plan. **In plain terms:** B1 stuffs relevant Salt docs into the prompt via embedding search but has no `create_salt_ui` gate — if B3 does not beat B1 on FD, the workflow contract adds no value over cheap RAG.
- **Claim decomposition** — Splitting workflow guidance into atomic, independently verifiable statements before checking each against its cited source. **In plain terms:** "Use `VerticalNavigationItemContent` inside each item" becomes one claim with one citation — not a blob of prose where half is supported and half is invented.
- **Citation precision / citation recall** — Precision: fraction of citations that actually support their claim; recall: fraction of claims that have any citation at all. **In plain terms:** High recall but low precision means the agent cites everything but cites wrong chunks; high precision but low recall means unsupported advice slips through uncited — Q4 tracks both.
- **Natural language inference (NLI)** — Classifying whether one text entails, contradicts, or is neutral toward another — used here as an automated claim-vs-source checker. **In plain terms:** Given the catalog sentence about composition wrappers, does the workflow's claim "entail" (supported), "contradict" (wrong), or sit neutral (unsupported)?
- **Faithfulness (attribution)** — Whether generated statements are supported by the specific sources cited, regardless of whether those sources are complete. **In plain terms:** The agent cites the `VerticalNavigation` doc and accurately paraphrases it — faithful — even if the doc itself omits `VerticalNavigationItemContent` (a content gap, not an attribution lie).
- **Groundedness** — Whether outputs follow authoritative live evidence (registry + contract) rather than memorized priors — CTR measures causal grounding; faithfulness measures citation honesty. **In plain terms:** CTR asks "did perturbation change behavior?"; faithfulness asks "did cited text support what we said?"; together they bracket whether the system is truly tied to facts.



### Software testing & verification

- **Test oracle** — Any mechanism that decides pass/fail (or severity) for an output — execution, structural, metamorphic, or judge-based. **In plain terms:** Playwright rendering with zero console errors is an execution oracle; "every `@salt-ds/`* import exists in the installed package" is a structural oracle — both replace "looks fine to me."
- **Metamorphic testing / metamorphic relation** — Testing by comparing outputs across related inputs rather than checking a single golden answer. **In plain terms:** We do not need one perfect dashboard answer — we need "paraphrase the prompt → same gate decision" (INV) and "remove evidence → gate must block" (DIR-evidence for the `resolved_entities` bug).
- **Invariance test (INV)** — A metamorphic relation expecting the same outcome when a meaning-preserving change is applied. **In plain terms:** INV-paraphrase: three prompt-cluster variants of "build a nav sidebar" should yield the same implement/block decision — if phrasing alone flips the gate, the contract is fragile.
- **Directional expectation test (DIR)** — A metamorphic relation expecting a specific directional change when input meaning changes. **In plain terms:** DIR-fidelity: switching frame from prototype → production must *increase* review strictness on `href="#"` — production should fail where prototype passes.
- **Mutation testing / seeded defects** — Deliberately inserting known bugs into reference code to verify that oracles and review rules detect them. **In plain terms:** Seed a mutant missing `VerticalNavigationItemContent` — if composition oracles fail to fire, the rule is advisory-only until calibrated.
- **Abstract syntax tree (AST) analysis** — Parsing code into a tree structure for mechanical checks (imports, component nesting) without executing it. **In plain terms:** The import census oracle parses the agent's TSX AST to confirm `@salt-ds/core` symbols exist — catching invented components before runtime.
- **Selective classifier / selective prediction** — A decision system that can abstain (block/defer) on uncertain cases rather than always guessing — the implement gate is one. **In plain terms:** The gate should say "I won't implement yet" when evidence is incomplete — not always allow (unsafe) or always block (useless).
- **Risk–coverage curve** — A plot tracing error rate among *accepted* decisions as the abstention threshold varies — coverage = fraction acted on. **In plain terms:** At 90% coverage (implement most requests), what fraction of allows are unsafe? Sweeping thresholds traces the whole curve — Q3 compares gate versions by curve shift, not one cell.
- **AURC (area under the risk–coverage curve)** — A scalar summary of selective-classifier quality; lower is better (less risk at each coverage level). **In plain terms:** Two gate versions might tie at one operating point; AURC asks which is safer *across* all "how picky should we be?" settings — preventing Goodhart "block everything" fixes.
- **Reference solution** — An expert-authored passing implementation proving a benchmark task is solvable and anchoring oracle expectations. **In plain terms:** Before adding "nested Card dashboard" to SaltBench, we ship a reference solution that passes all production-frame oracles — task validity requires it.
- **Severity-weighted scoring** — Combining pass/fail with weights for harm (e.g. accessibility failure > cosmetic spacing). **In plain terms:** Functional Delivery is not binary — shipping UI that renders but traps keyboard users scores worse than UI with a minor token mismatch; severity weights encode that in one FD number.
- **Fidelity frame (intent conditioning)** — Declared or inferred user intent (prototype vs production) that conditions which oracles fire and how strictly. **In plain terms:** Placeholder `href="#"` is correct in a prototype frame and a production defect otherwise — H5 makes the system infer or ask which frame applies.
- **Accessibility (a11y) scanning** — Automated checks (e.g. axe) for WCAG-related issues in rendered UI under execution oracles. **In plain terms:** Production-frame tasks run Playwright + a11y scan — a visually fine Salt dashboard that fails focus order or labels still fails FD.
- **OpenTelemetry (OTel) tracing** — A standard for instrumenting systems to emit structured spans (timing, parent/child calls) across tool invocations. **In plain terms:** Each MCP tool call (`get_salt_reference`, `create_salt_ui`) emits OTel spans so we can reconstruct trajectories and compare runner frameworks without proprietary log formats.
- **Execution oracle** — The strongest oracle tier: run the agent's code for real — compile, type-check, render in a browser, probe interactions, scan accessibility — rather than inspecting text alone. **In plain terms:** "Does it build and run?" beats "does it look like React?" — the field session's invented `VerticalNavigation` might look plausible in chat but would fail an import census or render crash check.

