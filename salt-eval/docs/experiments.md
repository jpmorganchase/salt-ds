# Experiments

How we tell whether a change to a context product, to Salt guidance or to a Salt component actually helped. Agent runs are noisy, and it's easy to fool ourselves; these rules are the guardrails.

## One variable per comparison

Two arms in a comparison differ in exactly one thing. Everything else is pinned:

| Pinned                                                          | Why                                                                                |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Agent program version                                           | Agent programs update themselves, and behavior changes between versions            |
| Model and settings, such as effort and thinking                 | Aliases such as "latest" move, and effort changes results                          |
| Salt package versions, or the Salt commit they were packed from | Guidance and APIs change between versions, and newer packages may ship docs        |
| Context product versions                                        | The thing under test must be exactly identified                                    |
| Task versions and starting point hashes                         | A changed task is a different task                                                 |
| Agent configuration outside the workspace                       | User-level rules, skills, MCP servers and memories leak context into every arm     |
| Network access                                                  | Web search and fetch are a context product; allow them only in arms that test them |

## Standard questions

| Question                                | Arms                                                               | Tasks                                                                          |
| --------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Could Salt context help at all?         | Baseline vs oracle                                                 | Whole dev bank                                                                 |
| Does a context product help?            | Baseline vs product: one product per comparison, then combinations | Whole dev bank                                                                 |
| Is retrieval or content the bottleneck? | Product vs oracle                                                  | Tasks whose failures cluster on an anchor                                      |
| Did a guidance change help?             | The same product serving the guidance before and after the change  | Tasks anchored to the changed passage, then the whole dev bank for regressions |
| Did a product change help?              | The product build before and after the change                      | Whole dev bank                                                                 |
| Does the improvement generalize?        | The final configuration vs the baseline                            | Held-out split, once                                                           |

The first question matters most early on. If the oracle arm barely beats the baseline, context can't help much on these tasks, and the tasks or the question need to change before any product comparison is worth running.

Define every baseline explicitly. "No context" still includes the types in the installed Salt packages, and once packages bundle docs (the `ai-agent-docs` branch writes them to `node_modules/@salt-ds/core/docs`) it includes those too. Either say so or remove them.

## Repetitions and noise

Agents are stochastic, so each arm runs each task several times. Choose how many from measured variance, not habit:

1. Pilot: run the seed tasks ten times on one arm and measure how much each task's pass rate varies.
2. Before a comparison, compute its noise floor. If the smallest difference you'd act on is below it, add trials (for targeted comparisons) or tasks (for bank-wide ones), or don't run the comparison.
3. Tasks are the statistical unit. Trials estimate a task's pass rate, and checks and variants aren't extra samples.
4. Report the paired difference with a 95% interval. The default method is a paired bootstrap over tasks.

Rough expectations, to be replaced by the pilot's numbers:

| Comparison | Size                                  | Smallest difference it can reliably detect                 |
| ---------- | ------------------------------------- | ---------------------------------------------------------- |
| Bank-wide  | 30 tasks, 5 trials per arm            | About 15 to 20 percentage points in pass rate              |
| Targeted   | 3 tasks, 10 trials per arm, one check | About 30 to 40 percentage points in that check's pass rate |

So a 30-task bank can confirm only large effects bank-wide. That's enough to answer "does context help?" but not to fine-tune guidance. Fine-tuning works through targeted comparisons on the tasks a change is aimed at, followed by a bank-wide run to confirm nothing else got worse.

## Not fooling ourselves

- **Split the bank.** The dev split is for diagnosis and iteration. The held-out split confirms, once. After anyone uses a held-out task's trace to change a product, the task moves to dev.
- **Change the guidance, not the test.** A fix must help a Salt user who never saw the task. Stating in the vertical navigation docs that every trigger needs `VerticalNavigationItemContent` is a fix. Adding "when asked for navigation with five sections, …" to a skill is overfitting.
- **Keep answers out of reach.** The agent can't read tasks, checks, reference solutions or Salt source, and every trial starts from a fresh copy with a single-commit history. See "Isolation" in [architecture.md](./architecture.md).
- **Watch for shortcuts.** Diff-scope checks catch agents that pass by deleting a failing route or editing tests.
- **Detect contamination.** Every task file carries a canary string; a model that reproduces it has seen the bank in training. Held-out tasks stay private.
- **Write the question down first.** Before a comparison, record the question, the arms, the tasks, the trials, the smallest difference you'd act on and what you'll do for each outcome. Then run it.

## Checking the benchmark itself

Adapted from Anthropic's four elements of a good eval, summarized in [prior-art.md](./prior-art.md). Run these on every bank-wide run:

| Check                           | Expected                            | If not                                                                                                                 |
| ------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Oracle vs baseline, per task    | The oracle does at least as well    | The task or its checks are suspect                                                                                     |
| Stronger model or higher effort | At least as good overall            | Suspect ambiguous tasks or miscalibrated grading                                                                       |
| Headroom                        | Best non-oracle arm well below 100% | At about 95% or more, the bank can't show improvement: add harder tasks, or compare cost between arms of equal quality |
| Dead tasks                      | None                                | Investigate them as eval defects                                                                                       |
| Judge stability                 | Same verdict on a rerun             | Rewrite the rubric item                                                                                                |
| Plumbing failures               | Rare                                | Fix the harness before reading any result                                                                              |

## Reporting a comparison

A comparison report contains:

1. The question and the smallest difference that would change the decision, both written before the run.
2. Both arms' pins, and the tasks and trials.
3. The paired difference with its interval and noise floor, overall and per work type.
4. The anchor scorecard, described under "From attributions to decisions" in [grading.md](./grading.md).
5. Cost per trial, where the arms' quality is equal.
6. Eval defects found and fixed during the run.
7. A recommendation: adopt, reject or inconclusive. A difference inside the noise floor is inconclusive, and inconclusive means don't ship on this evidence.
