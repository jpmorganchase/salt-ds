# Roadmap

Small phases, each ending in evidence. A phase starts only when the one before it has met its exit criteria. Later phases are deliberately less detailed, because what we learn early should change them.

## Open decisions

Decide these in Phase 0 and record each answer here with its date.

| Decision                             | Default if nobody objects                               |
| ------------------------------------ | ------------------------------------------------------- |
| First agent program and model        | The one most Salt consumers use today                   |
| Private store location and access    | None; this needs an owner                               |
| Harness language                     | TypeScript on Node                                      |
| Two Salt reviewers                   | None; these need names                                  |
| How salt-eval joins the Yarn project | Decide when the first code lands                        |
| Judge model                          | A model family that isn't under test; decide in Phase 5 |

## Phase 0: agree on the brief

- [ ] Review these documents with two or three Salt maintainers. Resolve disagreements in CONTEXT.md, not in chat.
- [ ] Accept or amend [ADR 0001](./docs/adr/0001-salt-eval-lives-at-repo-root.md) on where salt-eval lives.
- [ ] Make the open decisions above.
- [ ] Confirm that the two questions in the [README](./README.md) are the ones the Salt team wants answered.

**Exit:** decisions recorded and reviewers named.

## Phase 1: seed tasks on paper

The critical path. One to two weeks, depending on maintainer time. No harness yet.

- [ ] Collect about 20 candidate requests from `findings.md`, Salt support questions and recurring review comments. Give each one a "why it's hard" line.
- [ ] Choose five to eight that cover all four work types and both fidelities. Start from the [worked examples](./docs/tasks.md#worked-examples).
- [ ] For each task, write the guidance anchors, checks, rubric items and "Not checked". Add every "none" anchor and every unclear passage to the guidance issues list.
- [ ] Build two or three shared starting points: an empty Salt app, an existing Salt app with a router, header and profile page, and a non-Salt app.
- [ ] Hand-write each task's reference solution and at least one known-bad output against the pinned Salt version.
- [ ] Have two reviewers judge each reference solution and known-bad output independently, and fix every disagreement.
- [ ] Choose the task file format. It must satisfy the [anatomy table](./docs/tasks.md#anatomy-of-a-task) and stay readable without tools.

**Exit:** the seed tasks, starting points and fixtures are in `salt-eval/`, and the guidance issues list has gone to the Salt docs owners. That list is the first result, before any agent runs. The worked examples already contribute two entries: nothing in prose says `VerticalNavigationItemContent` is required, and the vertical navigation pattern and component pages point to different components.

## Phase 2: one task, end to end

One to two weeks. Build the [first slice](./docs/architecture.md#first-slice).

- [ ] Workspace preparer: a copy outside the repository, the pinned Salt install, a single-commit history and a clean agent configuration.
- [ ] Adapter for the chosen agent program: headless run, time limit, raw transcript.
- [ ] Trace normalizer that keeps full tool results.
- [ ] Gates and the first task's checks.
- [ ] Trial directory in the private store, with pins.
- [ ] Static trial page showing the request, trace, diff, screenshots and verdicts, with each verdict linked to its evidence.
- [ ] Regrade command that reruns graders on a stored output.
- [ ] Prove the graders without an agent: the reference solution passes and the known-bad output fails when each is fed in as an output.
- [ ] Run the real agent three times on the baseline arm and read every trace.

**Exit:** someone who didn't build the harness can run the task and explain what the agent did from the trial page alone, in under ten minutes.

## Phase 3: seed bank, baseline and oracle

About a week, including run time.

- [ ] Checks for the remaining seed tasks.
- [ ] Oracle arm: add each task's anchored passages to its request.
- [ ] Exposure detector: did each anchored passage appear in the trace?
- [ ] Run every seed task ten times on the baseline and oracle arms.
- [ ] Measure per-task variance, set trial counts and compute noise floors for bank-wide and targeted comparisons.
- [ ] Run the [benchmark checks](./docs/experiments.md#checking-the-benchmark-itself). Fix every eval defect and version the tasks it affected.

**Exit:** a short report with per-task pass rates for both arms, the noise floor and the eval defects fixed. It answers "could Salt context help on these tasks at all?" If the oracle arm barely beats the baseline, rethink the tasks before comparing products.

## Phase 4: first product comparisons

Answers the first question for the context products that exist today.

- [ ] Arms for the existing context products (MCP server, skill, bundled docs), each pinned.
- [ ] Bank-wide comparisons against the baseline.
- [ ] The anchor scorecard.
- [ ] Blind human review of a sample that includes passes, with attributions confirmed from trace evidence.
- [ ] A comparison report as described in [experiments.md](./docs/experiments.md#reporting-a-comparison).

**Exit:** the report is shared with the Salt team and names the top three fixes the scorecard points to.

## Phase 5: grow the bank

Runs alongside Phase 4.

- [ ] Grow to about 30 tasks, with a third held out in the private store and every work type covered.
- [ ] Add a judge for rubric items that checks can't decide, and validate it against reviewer labels before any of its verdicts count.
- [ ] Retire saturated tasks to the canary set and investigate dead ones.

**Exit:** the coverage table is filled, and every rubric item in use has a validated judge.

## Phase 6: close the loop

Answers the second question: does a change we make show up in the numbers?

- [ ] Take the top anchor from the scorecard and make one change to the passage, to the product's retrieval or presentation or to the component.
- [ ] Run a targeted comparison on the tasks anchored to it, then a bank-wide regression run, then the held-out split once.
- [ ] Write the loop up as a runbook a Salt contributor can follow on a docs pull request.

**Exit:** one change shipped with before-and-after evidence, or rejected with it.

## Later, only if earlier phases show a need

- A second agent program, to see whether product rankings hold across agents.
- Scheduled runs on Salt releases, to catch regressions in context products.
- Pairwise judging for prototype tasks with many valid designs.
- Tasks that test clarifying questions.
- Visual checks against Salt themes and densities.
- Cost comparisons between arms of equal quality.
- Item-level statistics from the `mcp-eval` plans, once the bank supports them.
- A move to a private repository, if the conditions in [ADR 0001](./docs/adr/0001-salt-eval-lives-at-repo-root.md) are met.
