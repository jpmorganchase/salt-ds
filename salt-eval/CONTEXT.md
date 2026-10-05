# salt-eval

salt-eval measures whether Salt context helps coding agents build better Salt interfaces, and diagnoses why when it doesn't.

## Language

### Tasks

**Task**:
One frontend request together with the starting point it runs from, the checks and rubric items that grade it and the Salt guidance it depends on.
_Avoid_: case, test case, scenario, prompt

**Request**:
The message the agent receives, written the way a product engineer or designer would ask for the work.
_Avoid_: prompt, instruction, query

**Starting point**:
The frozen app a task begins from: source files, locked dependencies and a single-commit git history.
_Avoid_: fixture, template, sandbox, repo

**Work type**:
The kind of change a task asks for: create (new UI in a Salt app), extend (add to existing Salt UI), migrate (move non-Salt UI to Salt) or fix (repair Salt misuse).
_Avoid_: track, workflow, category

**Fidelity**:
The finish a request asks for, prototype or production. It limits what checks may penalize: placeholder links are correct in a prototype.
_Avoid_: quality level, mode

**Specificity**:
How much of the Salt solution a request names: the outcome ("let users move between sections"), the pattern ("add vertical navigation") or the API ("use `VerticalNavigationItem`").
_Avoid_: difficulty, detail level

**Decision type**:
The kind of Salt decision a task turns on: setup and integration, component choice, composition, pattern, foundation, accessibility, content or API currency. A task's primary decision type is the one its "why it's hard" line leads with.
_Avoid_: category, layer, Salt layer

**Variant**:
A rewording of a task's request that keeps its checks. A task and its variants count as one unit in statistics and always share a split.
_Avoid_: paraphrase, duplicate, cluster

**Seeded defect**:
A deliberate Salt misuse placed in the starting point of a fix task. Each seeded defect has exactly one check.
_Avoid_: bug, planted error

**Reference solution**:
One known-good output for a task, used to prove its checks pass on valid work. It isn't the only acceptable answer.
_Avoid_: golden answer, expected output, answer key

**Known-bad output**:
A realistic wrong output for a task, used to prove its checks catch the mistake they target.
_Avoid_: negative fixture, counterexample

**Dev split**:
Tasks anyone may read, run and use to diagnose and improve context products.
_Avoid_: train set, public set

**Held-out split**:
Tasks nobody changing a context product may read. They only confirm that an improvement generalizes, and they're kept outside this repository.
_Avoid_: test set, private set

### Salt knowledge

**Salt guidance**:
What Salt publishes about how to use it at a given version: component usage, examples and accessibility pages; pattern and foundation pages; API types and deprecation notices.
_Avoid_: rules, best practices, the docs

**Guidance anchor**:
A pointer from a check or rubric item to the passage of Salt guidance that justifies it, or an explicit "none" when no passage exists.
_Avoid_: source, citation, reference fact

**Guidance gap**:
An expectation Salt experts agree on that no Salt guidance states. Every anchor marked "none" is a guidance gap.
_Avoid_: doc bug, missing docs

**Exposure**:
Whether the passage a guidance anchor points to entered the agent's context during a trial, judged from the trace.
_Avoid_: coverage, recall, hit

### Configurations

**Context product**:
A named, versioned way of delivering Salt guidance to an agent, such as the Salt MCP server, a Salt skill, docs bundled in the Salt packages, the Salt website or a DESIGN.md file.
_Avoid_: tool, tooling, integration, provider

**Agent**:
The coding agent under test: an agent program such as Claude Code, Cursor or Codex, plus a model and its settings.
_Avoid_: model, bot, assistant, host

**Arm**:
One complete configuration that trials run under: the agent, the Salt version and the context products enabled. Arms in a comparison differ in exactly one thing.
_Avoid_: profile, setup, condition, config

**Baseline arm**:
The arm a comparison is measured against. A "no context" baseline still includes whatever the installed Salt packages ship, such as types and bundled docs, so every baseline states what it includes.
_Avoid_: control, closed-book

**Oracle arm**:
A diagnostic arm: the baseline arm plus the passages a task's anchors point to, added to the request. It shows what the agent does when retrieval is perfect. It isn't a product.
_Avoid_: cheat mode, gold context

**Pins**:
The versions and hashes that make a trial reproducible: task version, starting point hash, agent program version, model, settings, Salt package versions and context product versions.
_Avoid_: config, metadata, fingerprint

### Runs

**Trial**:
One attempt by one arm at one task, from a fresh copy of the starting point.
_Avoid_: run, attempt, sample, rollout, episode

**Run**:
A batch of trials executed together (arms × tasks × repetitions), with pins recorded for each arm.
_Avoid_: job, suite run, experiment

**Transcript**:
The raw record of a trial in the agent program's own format.
_Avoid_: log

**Trace**:
The normalized record of a trial, derived from its transcript: messages, tool calls with their full results, files read and written, commands, tokens and time. Traces from different agent programs can be compared.
_Avoid_: history, log

**Output**:
The workspace at the end of a trial: the diff against the starting point and the app built from it.
_Avoid_: result, artifact, answer

### Grading

**Check**:
An automated pass or fail test of one property of an output, justified by the request or a guidance anchor. A check is either required (it decides task pass) or diagnostic (it's recorded to explain failures).
_Avoid_: assertion, criterion, rule, grader

**Gate**:
A required check an output must pass before anything else is graded: it installs, builds and renders.
_Avoid_: smoke test, precondition

**Rubric item**:
A yes-or-no claim about an output that needs judgment, written so two Salt experts would give the same answer.
_Avoid_: criterion, rating, score

**Judge**:
A model that answers rubric items from an output without being told the arm. Its answers count only after they've been shown to agree with reviewers.
_Avoid_: grader model, evaluator

**Reviewer**:
A Salt expert who labels rubric items, validates judges and attributes failures.
_Avoid_: annotator, rater, grader

**Verdict**:
The outcome of a check or rubric item on one output: pass, fail or unscorable. Unscorable means grading couldn't decide, and it never counts against the agent.
_Avoid_: score, result

**Task pass**:
The outcome of a trial in which every required check and required rubric item passes.
_Avoid_: success, solved, accuracy

### Diagnosis

**Failure attribution**:
The cause assigned to a failed check or rubric item using the trace: guidance gap, unclear guidance, retrieval miss, tool misuse, misinterpretation, prior override, implementation error or eval defect. It's a hypothesis for the next experiment to test, not a proven root cause.
_Avoid_: root cause, blame, error type

**Unclear guidance**:
The needed guidance exists but is ambiguous, buried, contradicted elsewhere or only implied by an example.

**Retrieval miss**:
The needed guidance exists, but it never entered the agent's context during the trial, either because the agent didn't look or because the context product didn't return it.

**Tool misuse**:
The agent called a context product in a way that lost the guidance: wrong arguments, a truncated input, an ignored error or a not-found result treated as found.

**Misinterpretation**:
The needed guidance entered the agent's context and the agent drew the wrong conclusion from it.

**Prior override**:
The needed guidance entered the agent's context, but the agent followed what it learned in training instead, such as a deprecated prop or another library's convention.

**Implementation error**:
The agent's intent matched the guidance, but its code doesn't work: a type error, a runtime error or broken wiring.

**Eval defect**:
A failure caused by salt-eval rather than the agent: an ambiguous request, a wrong check, a broken starting point or a harness error. It's fixed and rescored, never counted.
_Avoid_: flake, noise

### Measurement

**Pass rate**:
The share of an arm's trials on a task that are task passes. Across the bank, every task has equal weight.
_Avoid_: accuracy, success rate, score

**Paired difference**:
The mean over tasks of one arm's pass rate minus the baseline arm's, reported with a confidence interval.
_Avoid_: uplift, improvement, delta

**Noise floor**:
The smallest paired difference a run of a given size can reliably tell apart from chance.
_Avoid_: margin of error

**Saturated task**:
A task every arm passes in nearly every trial. It no longer tells arms apart.

**Dead task**:
A task no arm passes, including the oracle arm. It's usually an eval defect.
