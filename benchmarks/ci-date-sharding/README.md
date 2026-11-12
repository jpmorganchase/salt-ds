# Salt browser CI benchmark — 12 November 2026

## Decision

The evidence supports two browser-test shards for each supported React version, with the five large date suites split into adapter-specific files to improve shard balance. Keep all test cases, the existing worker limits, Strict Mode behavior, and tests against built package outputs.

In matched two-shard trials, the adapter split reduced the critical test-stage duration by **10.24% and 16.53%**. The combined candidate completed the first round's full React 19 browser jobs in **3m48s and 3m54s**, including preparation and package builds. These observations do not establish a universal percentage improvement in whole-repository CI.

The standalone split, without CI sharding, did not demonstrate a controlled performance improvement. The effect on summed runner time was also inconclusive. Package-build improvements were not part of this experiment.

## Revisions and evidence

| Item                                           | Reference                                                                                           |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Unmodified main baseline                       | `c69bf4650e6193e5161d57fe3bf78dce6f2c7888`                                                          |
| Adapter split and first benchmark              | `28af86c5d76936a76cff97368ed45772b8daa6e4`                                                          |
| Matched benchmark and compatibility validation | `d03e0b271a96852c1a5a02659c893c35544d8a52`                                                          |
| First round                                    | [GitHub Actions run 43327367902](https://github.com/jpmorganchase/salt-ds/actions/runs/43327367902) |
| Matched trials and compatibility               | [GitHub Actions run 43328807419](https://github.com/jpmorganchase/salt-ds/actions/runs/43328807419) |

Machine-readable measurements, job links, runner metadata and coverage checks are in [results.json](./results.json). The Actions runs contain full logs and per-job JSON reports. Uploaded benchmark artifacts have a seven-day retention period.

## Candidate change

The shared test bodies for `date-picker-range`, `date-picker-single`, `calendar-range`, `calendar-single` and `calendar` are extracted into `.suite.tsx` modules. Four small entry files per suite register the DateFnsTZ, Dayjs, Luxon and Moment cases. This replaces five browser spec files with twenty, increasing the complete suite from 148 to 163 spec files.

Assertions, hooks, adapter registrations and describe titles are preserved. Calendar's configured Moment locale fixture is retained. No component implementation, browser setup, test timeout, retry, worker limit or existing skip condition was changed.

## Matched comparison

Both layouts use two shards. Each worker installs dependencies, selects React 19 and builds packages once, then executes both layouts using the same CPU allocation, Chrome version and package outputs. Only the two date-test directories are restored from their fixed source revisions. The helper verifies the restored contents and clears generated Vite/Vitest caches before each test phase. A second group reverses execution order.

| Execution order | Original layout, slowest shard | Split layout, slowest shard | Reduction | Original summed test runner seconds | Split summed test runner seconds |
| --------------- | -----------------------------: | --------------------------: | --------: | ----------------------------------: | -------------------------------: |
| Original first  |                       199.423s |                    166.466s |    16.53% |                            300.172s |                         282.682s |
| Split first     |                       178.605s |                    160.317s |    10.24% |                            299.086s |                         316.325s |

The maximum shard duration represents the parallel test-stage critical path. Summed durations represent runner time consumed by testing. The experimental jobs deliberately execute both variants sequentially, so their complete job duration is not a production CI timing.

The split reduced elapsed test time in both orders. Summed test runner time fell 5.83% in one trial and rose 5.76% in the other; there is no demonstrated consistent compute saving. These are two descriptive trials, not a long-run p95 or flake-rate study.

## Coverage and compatibility

For every React 19 variant, the union of both shards was compared as a multiset of original logical filename, full test name and status. Every matched union contains exactly **3,801 test identities: 3,777 passed and 24 skipped**. There are no missing cases, duplicated cases or new skips.

| React | Passing cases | Existing skips | Collected identities | Candidate shard-pair elapsed time including preparation |
| ----- | ------------: | -------------: | -------------------: | ------------------------------------------------------: |
| 16    |         3,777 |             24 |                3,801 |                                                   4m05s |
| 17    |         3,777 |             24 |                3,801 |                                                   3m43s |
| 18    |         3,762 |             39 |                3,801 |                                                   3m06s |
| 19    |         3,777 |             24 |                3,801 |                      3m48s and 3m54s in the first round |

React 18's additional 15 skips are unchanged conditional cases in list selection/accessibility, declarative list, deprecated ComboBox and CascadingMenu. The [existing main React 18 job](https://github.com/jpmorganchase/salt-ds/actions/runs/43230837853/job/131225400502) reports the same 3,762 passing cases and 39 skips. Each version retains the same complete identity inventory.

All eleven jobs in the matched/compatibility run passed, including both repository type checks, focused Biome checks and workflow formatting.

## First-round observations and limitations

| Configuration       | Sample | Slowest test step | Complete job or shard-pair elapsed time | Summed job runner time | Outcome                             |
| ------------------- | -----: | ----------------: | --------------------------------------: | ---------------------: | ----------------------------------- |
| Original full suite |      1 |             3m15s |                                   4m33s |                  4m33s | Passed                              |
| Original full suite |      2 |             5m17s |                                   7m22s |                  7m22s | Failed: two baseline SkipLink cases |
| Split full suite    |      1 |             5m23s |                                   7m24s |                  7m24s | Passed                              |
| Split full suite    |      2 |             4m31s |                                   6m22s |                  6m22s | Passed                              |
| Split, two shards   |      1 |             2m09s |                                   3m48s |                  7m09s | Passed                              |
| Split, two shards   |      2 |             2m19s |                                   3m54s |                  7m09s | Passed                              |

All first-round jobs started at the same second, so each shard pair's elapsed span includes its slowest complete job. Hardware and browser versions differed between jobs: several AMD EPYC models and an Intel Xeon model were allocated, and Chrome 156 and 157 both appeared. Unchanged package builds took 44–77 seconds. These are observed end-to-end timings, not a controlled attribution of the whole difference to the refactor.

Two shards duplicate installation and package preparation. They can shorten feedback time while using more total runner time. A separate shared-build or faster-build experiment is needed to quantify that tradeoff.

## Existing SkipLink failure

The [second unchanged baseline job](https://github.com/jpmorganchase/salt-ds/actions/runs/43327367902/job/131563109256) failed two SkipLink tests. Both expected the first Tab press to focus and reveal the link, but its opacity stayed at zero. Neither reached the activation or target-focus assertions.

That job used Chrome 157. Every successful SkipLink execution in these experiments used Chrome 156. The passing Chrome 157 candidate shards did not contain SkipLink, so they do not establish a successful Chrome 157 result. Browser-version sensitivity remains unresolved; this has not been proven to be an intermittent flake or a component regression.

The failure is preserved in the evidence and excluded from clean timing summaries. No retry, assertion removal, timeout increase or additional skip was introduced to make the benchmark pass. A focused follow-up should capture active element and document/iframe focus immediately before and after Tab on Chrome 157.

## Applying the result

The production change should combine the adapter entry files with two shards per React version, give artifacts unique React/shard names, and preserve existing required-check names through appropriate completion gates. The ordinary Test workflow has not been changed by this experiment. The benchmark workflow is left manual to avoid rerunning experiments on report-only commits.
