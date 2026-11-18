# List control interaction measurements

Run separately from correctness tests, with one browser worker and no other
test runs competing for CPU:

```sh
yarn vitest run --config test/performance/vitest.config.mts --browser.headless
```

Each `LIST_CONTROL_BENCHMARK` console entry contains a scenario and its raw
measurements. Keep the output from each revision. Run this same harness on the
PR base, the PR head, and the fixed version, using the same dependencies, Chrome
version, viewport, machine, and power settings.

The matrix covers Dropdown and ComboBox, single and multiple selection, plain
and richer option content, and 20, 1,000, and 10,000 options. Each scenario runs
three samples of mounting, first focus, first open, five keyboard/pointer
movements, selection, filtering, clearing the filter, closing, and reopening.
Filtering replaces the rendered collection in both controls; it does not time
text entry or an application's search implementation.

`ms` measures from dispatch to two animation frames later, including React
updates, observer work, and a browser paint opportunity. Events are dispatched
inside the page to exclude Playwright transport latency. These are development
build measurements with Profiler and DOM instrumentation enabled, not production
INP measurements. Compare distributions; frame timing imposes a floor and small
differences are noise. There are no wall-clock pass/fail thresholds.

`commits` counts option Profiler commits. `collectionScans` counts DOM queries
for all options, while `orderComparisons` counts document-position comparisons
used by the original implementation. `longTasks` contains durations of browser
long tasks beginning within the measured interval. Allocation and retained-heap
profiling require a separate DevTools session; these counters do not measure
memory. Option counts after filtering and reopening are correctness checks.

The deterministic browser regression suite additionally checks zero registry
rebuilds for checkbox/decorative changes, one rebuild for batched collection
changes, and navigation order after metadata-only updates.
