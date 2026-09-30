# Grading

How an output gets its verdicts, and how a failure gets a cause. Verdicts answer the first question in the [README](../README.md): did the UI meet the request, the Salt way? Attributions answer the second: what should we improve?

## Layers

Use the cheapest layer that can decide a property.

| Layer                  | Question                                              | How                                                                                                                                                            | A failure means                                      |
| ---------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Plumbing               | Did the trial run properly?                           | Agent exit status, timeouts, API errors, cut-off output                                                                                                        | Unscorable: fix the harness and rerun; never counted |
| Gates                  | Can the output be graded?                             | Install, build and render every route without an uncaught error                                                                                                | Task fail                                            |
| Behavior and structure | Does the rendered UI do what was asked, the Salt way? | Playwright on the built app: the request's interactions, roles and accessible names, axe-core, Salt structure through rendered `salt*` classes                 | Task fail, if the check is required                  |
| Source                 | What only the code shows                              | Typecheck (required at production fidelity, diagnostic for prototypes); deprecated or nonexistent Salt APIs from the pinned types; files changed outside scope | Task fail, if the check is required                  |
| Rubric                 | What checks can't decide                              | A judge, then reviewer sampling                                                                                                                                | Task fail, if the item is required                   |

Plumbing and gates run first; if either fails, nothing else runs. After that, every check and rubric item runs on every gradable output, so attribution sees all the failures, not only the first.

Prefer behavior and structure checks to source checks. They accept any implementation that produces the right result, while source patterns reject valid code written differently, such as a helper component or a computed prop. Salt components render stable class names (`saltCard`, `saltFormField`, `saltVerticalNavigationItemContent`, `saltButton-solid`), so most composition rules can be checked on the rendered page.

## Writing checks

1. **One property per check,** named for the property ("the current section has `aria-current="page"`"), not the implementation.
2. **Justify it** with the request or a guidance anchor. A check is required only when its justification rules out the alternatives it fails. Guidance that recommends one option without ruling out others supports a diagnostic check.
3. **Anchors marked "none" make a check diagnostic,** and the expectation goes on the guidance issues list. No arm can deliver guidance that doesn't exist, so a required check would only measure what the model already knows.
4. **Prove it.** It passes on the reference solution and fails on the known-bad output it targets. Keep both as the check's fixtures.
5. **Allow every valid route.** When Salt guidance offers more than one way, make route-specific checks conditional ("if the output uses `VerticalNavigation`, then …") and record which route was taken.
6. **Respect fidelity.** Never check what the task's "Not checked" field excludes.
7. **Read deprecations and exports from the pinned version's types,** not from a hand-kept list.

## Rubric items and judges

A rubric item is a yes-or-no claim, never a scale. Write "Each headline figure shows what it measures and in what unit", not "Rate the dashboard from 1 to 5".

A judge gets the request, the task's fidelity, the rubric item with its anchored passage, the diff and screenshots at named states. It doesn't get the arm, the trace or other arms' outputs. The judge model is never one of the models under test.

A judge's answers count only after validation:

1. Reviewers label 20 to 30 outputs for the rubric item, including passes. False passes hide among passes.
2. The judge agrees with the reviewers at a bar set before looking (start at 90%) and doesn't systematically pass what reviewers fail.
3. The judge gives the same verdict when run twice on the same output.

If reviewers can't agree with each other on an item, the item is the problem: rewrite it or drop it. Averaging disagreement into a score hides it.

## Human review

Reviewers see outputs without arm labels. Every review session samples passes as well as failures, because automated grading's worst errors are false passes. On failures, the reviewer confirms or corrects the attribution and cites the trace evidence: the tool call, file read or message that shows it. A subset of trials gets two reviewers so we can measure agreement.

## Failure attribution

For each failed required check or rubric item, walk these steps in order. The first match wins.

1. **Is salt-eval at fault?** An ambiguous request, a wrong check, a broken starting point or a harness error is an **eval defect**. Fix it, version the task and rescore every arm.
2. **Was the intent right but the code broken?** The right components and structure with a type error, runtime error or wrong wiring is an **implementation error**. Exception: a failure caused by a Salt export or prop that doesn't exist is a knowledge failure, so continue to step 3 for that API's guidance.
3. **Is the anchor "none"?** Then it's a **guidance gap**.
4. **Did the anchored passage reach the agent?** Search the trace's tool results, file reads and fetched pages for the passage (its exposure).
   - **No**, and the agent called a context product in a way that lost it (wrong arguments, truncated input, an ignored error, not found treated as found): **tool misuse**.
   - **No**, otherwise: **retrieval miss**. Record whether the agent never looked or looked and wasn't given the passage. They call for different fixes.
   - **Yes**, and the output follows an older or foreign convention the passage contradicts, such as a deprecated prop: **prior override**.
   - **Yes**, otherwise: **misinterpretation**.
5. **Split misinterpretation with the oracle arm.** If the oracle arm, which has the passage in its request, fails the same check at a similar rate, the passage itself doesn't communicate: **unclear guidance**. If the oracle arm passes, the passage works when it's prominent, and the product's presentation is the suspect: the passage is buried in a long page or trimmed out of an oversized example.

Exposure detection runs automatically as a first pass by matching the passage's text against the trace, and reviewers confirm it on a sample. It only works if traces keep tool results in full; see "Traces" in [architecture.md](./architecture.md).

## From attributions to decisions

The anchor scorecard turns attributions into work for the Salt team. It has one row per guidance anchor across a run:

| Column                     | Meaning                                                   |
| -------------------------- | --------------------------------------------------------- |
| Exposure rate              | Share of trials in which the passage reached the agent    |
| Pass rate when exposed     | How often the check passed when the agent saw the passage |
| Pass rate when not exposed | What the model already knows                              |
| Oracle pass rate           | The ceiling with perfect retrieval                        |
| Main attribution           | The most common cause among failures                      |

Reading it:

| Pattern                                                | What to change                                                                                                                                                             |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Low exposure, high pass rate when exposed              | Retrieval: search terms, aliases, tool descriptions, skill triggers                                                                                                        |
| High exposure, low pass rate when exposed, high oracle | Presentation: put the rule earlier, shorten the example                                                                                                                    |
| Low oracle pass rate                                   | The passage: rewrite it, or add an example that shows it. If a rewrite doesn't move the oracle, consider the component API: a development warning or a simpler composition |
| High pass rate when not exposed                        | The model already knows this; context adds little here                                                                                                                     |
| Anchor "none"                                          | Write the guidance, then promote the check to required                                                                                                                     |

## What we report, and what we don't

Report only numbers that inform a decision:

| Metric                                                                                   | Decision it informs                                        |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Paired difference in pass rate, with interval and noise floor, overall and per work type | Does this context product or change help? Adopt it?        |
| Per-check pass rate on the tasks a change targets                                        | Did this guidance change work?                             |
| Anchor scorecard                                                                         | Fix retrieval, presentation, the passage or the component? |
| Consistency: the share of tasks where every trial passes                                 | Is it dependable enough to recommend to teams?             |
| Cost per trial (tokens and time) between arms of equal quality                           | Which of two equally good arms to prefer                   |

Don't report these, even though they're easy to collect:

| Metric                                               | Why not                                                                                                                   |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Count of Salt imports or token references            | Rewards Salt-flavored wrong UI                                                                                            |
| Lint error counts                                    | They scale with code size and rule set, not UI quality. Turn specific lint findings into checks when they map to guidance |
| Tokens, time or tool calls as a quality win          | Meaningful only at equal quality, and fewer tool calls can mean less retrieval                                            |
| A weighted "compliance score"                        | Hides which decision failed, uses arbitrary weights and gives nobody anything to act on                                   |
| Judge ratings from 1 to 10                           | Unstable and uncalibrated; use yes-or-no rubric items                                                                     |
| Percentage changes without task counts and intervals | Can't be told apart from noise on a small bank                                                                            |
