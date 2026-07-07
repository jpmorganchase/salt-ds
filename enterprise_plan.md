# Salt AI Tooling — Enterprise Delivery Plan

**What this is:** the execution plan that turns the measurement science in `improved_plan.md` and the field evidence in `findings.md` into a running program: a product that gets better every sprint, an instrument that proves it, and a team (humans + coding agents) that can start Monday.
**Owner-level goal, in plain terms:** any J.P. Morgan engineer or AI agent asked to build Salt UI gets correct, accessible, canonical output — and we can show, with numbers that survive scrutiny, that it works and keeps improving.

Companion documents: `improved_plan.md` (measurement methodology — the instrument), `findings.md` (field failure evidence — the motivation). This document is deliberately short; anything methodological lives there.

---

## 1. Value thesis and the one management rule

The product bet: **grounding beats memory.** Models already "know" Salt from public pretraining data — including obsolete APIs, which is precisely why they invent (`findings.md`: `VerticalNavigation` implemented wrongly "from types/memory"). The tooling's entire value is making agent behavior track the *current, canonical* registry instead of the prior, and blocking implementation when evidence is missing. Every metric that matters is a version of that claim:

- **Grounded:** Counterfactual Tracking Rate (CTR) — behavior follows the registry when it contradicts the prior.
- **Correct:** Functional Delivery (FD) — severity-weighted, intent-framed, execution-verified task completion.
- **Trusted gate:** risk–coverage — the implement gate permits good work and blocks invention, measurably better than trivial policies.
- **Worth its complexity:** the full system beats a naive docs-dump RAG baseline (B1) on the same tasks.

**The one management rule:** every engineering investment is a pre-registered hypothesis with a named endpoint from the scoreboard (`improved_plan.md` §10) and a paired before/after run. No endpoint, no build. This is the entire governance model; there is no other process.

---

## 2. Operating model — four workstreams, one instrument

| Workstream | Mandate | First shippable |
|---|---|---|
| **WS1 — Product Engineering** | The MCP server, contract, skill, and the retrieval/grounding engine inside them | H1 alias layer (below) |
| **WS2 — Evaluation Science** | SaltBench 2.0 per `improved_plan.md`; owns endpoints, stats, and the veto on unmeasured claims | Stats library + entity-linking gold set |
| **WS3 — Content & Registry** | Registry completeness, composition contracts, docs gaps (design-system team owns this backlog) | Composition trees for top-20 compound components |
| **WS4 — Platform & Governance** | CI, private assets repo, LLM gateway integration, telemetry, cost | Private eval-assets repo + model pinning |

One instrument serves all four: WS1 proves changes with WS2's endpoints; WS3's content changes are registry-version experiments like any code change; WS4 keeps runs reproducible and data inside the bank.

---

## 3. Product backlog as ranked hypotheses (WS1 — Product Engineering)

Each item: what we build → the endpoint that judges it → why it's ranked there. H1–H3 are *known bugs with known instruments* — they ship first because they convert findings.md from anecdote to measured regression-fix.

**H1 — Entity linking & alias layer.** Deterministic resolution from every public `@salt-ds/*` export name, doc title, and curated alias/paraphrase to its canonical registry entity, with normalized fuzzy fallback. *Endpoint:* entity-linking accuracy@1 / candidate-recall@k on the gold link set (`improved_plan.md` §5.1) — today this fails on `VerticalNavigation`, `BorderLayout`, `StackLayout`, `GridLayout`, `H1`. High-n, deterministic, day-one measurable.

**H2 — Evidence honesty in the gate.** `resolved_entities` claims are verified against actual successful reference retrievals (closing the `buildResolvedFollowThroughEvidence` hole where extra names bypass gating), and evidence scoping moves from pattern-level to per-emitted-component. *Endpoint:* DIR-evidence metamorphic relation (must hold) + gate risk–coverage curve shift.

**H3 — Composition contracts.** Machine-checkable required-subtree data for compound components (the `VerticalNavigationItemContent` class), encoded once in the registry and consumed three ways: served as create/migrate evidence, checked by `review_salt_ui`, and used as an eval oracle. *Endpoint:* composition-class CTR + seeded-mutant recall in review.

**H4 — Retrieval architecture bake-off (the "vector database" question, answered scientifically).** The current create-retrieval index is lexical. Candidates: (a) tuned lexical + H1 alias layer, (b) dense bi-encoder embeddings, (c) hybrid lexical+dense fusion, (d) c + cross-encoder reranking. Decide by nDCG@5/recall@10 on the graded qrels (`improved_plan.md` §5.2), under the real deployment constraint: **the MCP ships an offline catalog with no query-time network**, so dense retrieval requires a bundled small embedding model (quantized ONNX — MiniLM/bge-small class, runnable in Node) with its size, latency, and licensing costs on the scale. Engineering prior, stated honestly: at this corpus scale (hundreds of entities, low thousands of chunks) a strong lexical+alias baseline is hard to beat and an in-process index (HNSW / LanceDB / pgvector-if-a-service-exists) is sufficient — **no dedicated vector-DB cluster unless the qrels say dense wins by a margin that pays for it.** The bake-off is cheap (offline, no agent loop) and permanently settles a debate that otherwise runs on fashion.

**H5 — Fidelity-frame intent handling.** Production users never declare "prototype vs production"; the workflows must infer intent from context or ask one clarifying question, and review severity must condition on it. This is the product-side half of the `href="#"` fix (the eval-side half is frame-conditioned oracles). *Endpoint:* DIR-fidelity relation + frame-ambiguity adversarial tasks.

**H6 — Minimal starter snippets.** Replace full-Storybook starter payloads with per-entity canonical examples (≤ ~40 lines), since oversized starters caused wrapper-dropping trims (findings §6.8). *Endpoint:* FD on create tasks + payload guard budgets.

**H7 — Systemic usage rules.** Relational correctness (nested-Card class, layout ownership, heading order) as calibrated rule objects shared between review and eval — only after H1–H5, because rules without the frame machinery recreate the lint-rule trap.

---

## 4. Instrument build order (WS2 — Evaluation Science, compressed from improved_plan.md M1–M4)

Sequenced so that **component metrics land before agent-loop machinery** — they are cheap, high-powered, and immediately judge H1–H3:

1. **Week 1–2:** stats library (clustered SEs, paired inference, power — Miller's formulas); entity-linking gold set (~300 surface forms, agent-buildable from the export census + human-curated aliases); retrieval qrels v1 (~100 graded queries — needs expert grading time, start immediately); rule-object schema + calibration-case harness.
2. **Week 3–6:** perturbed-registry builder + CTR pilot (one model, 3 perturbation classes, three-way scoring); 25-task pilot corpus with frames, prompt clusters, reference solutions, shortcut audits; runner decision spike — extend `workflowEvalHarness` vs adopt mcp-eval/MCPEval as substrate (decision criteria: TS-ecosystem fit, OTel trace assertions, simulated-user support; one week, then commit).
3. **Week 7–12:** execution oracles (compile/render/interaction); corpus to ~60 audited tasks; B0–B3 baseline conditions; gate risk–coverage instrumentation; judge panel admitted only if/when a dimension passes the κ gate.

Standing discipline from day one: every run stamped with the full version tuple; CTT item statistics on every batch (broken-oracle detector); all numbers with CIs or they don't get reported.

---

## 5. Data & content (WS3 — Content & Registry)

- **Composition-contract encoding sprint:** top-20 compound components, trees derived from `packages/core/src` + docs examples, reviewed by component owners. This is the single highest-leverage content artifact — it feeds H3's three consumers simultaneously.
- **Registry completeness scorecard:** per-entity presence of when-to-use/when-not-to-use, composition tree, minimal example, a11y guidance — validated against per-entity failure rates before it's treated as authoritative (a scorecard must predict outcomes to earn authority).
- **Gap ledger:** aggregate the contract's built-in "we don't know" signals (`questions`, `internal_limitations`, `heuristic_fallback`) across eval and field runs; recurring clusters become docs tasks and new golden tasks. The oracle-context ablation (C2, from `evaluation_plan.md` §11.2 — still valid) quantifies headroom where docs investment would pay.

---

## 6. Platform, compliance, and the public-repo problem (WS4 — Platform & Governance)

- **Everything self-hosted, nothing egresses.** Traces and scores live in repo/CI JSONL (system of record) plus optional self-hosted Langfuse (MIT core) for browsing and annotation queues. Decisions read repo scorecards only.
- **Models via the approved internal LLM gateway**, versions pinned per quarter; harness models, judge panel (3 distinct families), and the embedding model for H4 all inventoried with pinned identifiers so every result is reproducible.
- **The public-repo contamination problem, taken seriously:** `jpmorganchase/salt-ds` is open source — golden tasks, reference solutions, and perturbation specs committed here would enter future pretraining corpora and quietly invalidate the benchmark. They live in a **private assets repo**; the public repo keeps harness code, schemas, and calibration fixtures only; all eval assets carry a canary GUID so leakage is detectable. Aggregate scores are publishable; items are not.
- **Cost envelope:** full runs are budgeted per `improved_plan.md` §6 variance-allocation (more tasks over more repeats); token spend is a guard metric on every report. Nightly = CI subset on the reference model; weekly = full matrix.

---

## 7. Humans + agents: who builds what

Coding agents are a first-class workforce here — with the same rule as the product they're building: **every agent task has a spec in the repo, a mechanical oracle for "done", and a named human reviewer.**

**Agent-executable now (specs are essentially written):** export-census + alias gold-set scaffolding; rule-object schema and calibration harness; perturbed-registry builder (data transforms on the registry build); stats library implementation against published formulas; fixture-repo sandboxing and runner plumbing; composition-tree extraction drafts from component source (human-verified before merge).

**Human-required (judgment is the deliverable):** qrel relevance grading; expert adjudication samples for oracle meta-evaluation; perturbation plausibility audits; frame/intent policy decisions; judge-validation labels; kill/pivot calls.

**Weekly ritual (the only recurring meeting):** 60 minutes — read the scorecard deltas, adjudicate the sampled oracle firings, convert new failures to tasks (private repo), re-rank H-backlog. Product, eval, and design-system representation in one room.

---

## 8. 30 / 60 / 90 — with falsifiable exits

**Day 30 — "Known bugs are fixed and the fixes are measured."**
H1 + H2 shipped behind paired component-metric evidence (alias accuracy@1 delta with CI; DIR-evidence relation passing). Gold sets, stats library, rule-object harness, private assets repo live. CTR pilot running.
*Exit test:* the findings.md failure chain, replayed, now blocks where it previously invented.

**Day 60 — "We know if grounding is real."**
CTR read on the pilot (three-way breakdown, per perturbation class) → **go/no-go on the grounding architecture**: if grounded-behavior rate at the contract layer is statistically indistinguishable from the closed-book base rate, the program pivots to contract/product redesign before any further eval build-out. Corpus at ~60 tasks; execution oracles live; H3 composition contracts encoded and serving.
*Exit test:* pre-registered CTR claim resolved either way, in writing.

**Day 90 — "We know if the product beats the cheap alternative."**
B0–B3 baselines run; the pre-registered product-value hypothesis ("B3 > B1 on FD, 95% CI excluding 0") resolved. H4 retrieval bake-off decided from qrels. First quarterly benchmark report published internally (scores, CIs, version tuple, honest limitations per ABC reporting standards).
*Exit test:* a written verdict — improve (B3 wins), simplify (B3 ≈ B2), or overhaul (B1 wins) — with the next quarter's H-backlog re-ranked accordingly.

**Kill/pivot criteria, restated from improved_plan.md so nobody forgets they were pre-committed:** CTR ≈ closed-book base rate → redesign grounding; B3 ≤ B1 → redesign the workflow contract; gate risk–coverage dominated by trivial policies → simplify the gate. The benchmark is allowed to embarrass the product; that is what it is for.

---

## 9. Top risks (only the ones that change decisions)

1. **CTR pilot returns "ungrounded"** → that is not a program failure, it is the program working; the pivot path (contract redesign) is pre-agreed and resourced.
2. **Expert time (qrels, adjudication) becomes the bottleneck** → scope grading to the H1–H4 slices first; agents pre-draft, humans verify — never the reverse for gold data.
3. **Self-contamination via the public repo** → private assets repo + canary GUIDs from day one; audit before every external publication.
4. **Oracle debt** (rules shipped without calibration cases under delivery pressure) → uncalibrated rules are *advisory by mechanism*, not by promise — the harness refuses to count them toward FD.
5. **Metric theater** (dashboards accumulating, decisions unchanged) → the one management rule is the countermeasure: a metric that never gates a decision for two quarters is deleted.

---

## 10. Start Monday

1. Create the private `salt-eval-assets` repo; move golden-task scaffolding there; add canary GUIDs. *(WS4, agent-executable, 1 day)*
2. Land the export-census spec and let an agent generate the entity-linking gold set draft; book two hours of design-system-engineer review. *(WS2+WS3, 2–3 days)*
3. Land the rule-object schema with the `nav-trigger-real-href` rule and its two calibration fixtures as the reference implementation. *(WS2, agent-executable, 2 days)*
4. Start H1 behind the gold set; pre-register its endpoint in the PR description. *(WS1, week 1)*
5. Spike the runner decision (extend vs adopt) with a one-page recommendation. *(WS2, week 1)*
6. Schedule the weekly ritual; first agenda item: adjudicate the first CTT item-statistics report.

From there, the loop runs itself: hypothesis → paired run → scorecard → re-rank. That loop — not any single document — is the deliverable.
