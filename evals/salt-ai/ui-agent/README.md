# Salt UI-agent comparison fixtures

These two authored fixtures are local development comparison inputs. They are
not supported examples, Knowledge inputs, release evidence, or a model
evaluation registry. Generated applications and raw run records stay outside Git.

The initial comparison uses two fresh attempts per task: an ordinary agent
with the current published Salt skill, and the same model with the shared
`salt-ui` skill and creator role. Both can retrieve the same installed Knowledge.
The tasks and acceptance are fixed before examining generated applications.
Use Terra with medium reasoning, the same tools and a twelve-minute wall-clock
limit per attempt. Native host-profile activation is a separate smoke check;
directly supplying the role and skill tests their behavior, not host discovery.

Judge initial results before providing corrective feedback. Acceptance requires
the task's build, behavior, accessibility and layout checks to pass. Separately
inspect appropriate public Salt reuse and desktop/narrow screenshots, recording
concrete issues rather than inventing a visual-quality score. Distinguish agent
self-repair from subsequent human or reviewer corrections. Do not infer a usage
or cost result when the host does not expose per-attempt counters.

For each cell, copy one fixture into a new empty run directory. Preserve the
fixture's `package.json` bytes, then prepare the same exact local Salt package
cohort and non-Salt dependencies for every cell. Do not copy one agent's
working tree into another cell.

The harness stays in this repository and resolves `execa`, `playwright`, and
`axe-core` from this repository's installed root dependencies (including
development dependencies), pinned by the existing `yarn.lock`. Prepare that
checkout through its normal dependency setup before running the harness; the
fixture manifests intentionally contain
only application dependencies. Do not copy the harness into a fixture or expect
its imports to resolve from the current working directory. Chrome must also be
available to Playwright's `chrome` channel.

After an agent finishes, run from the staged directory:

```sh
npm run typecheck
npm run build
node <repository-root>/evals/salt-ai/ui-agent/acceptance.mjs --task <task-id> --root . --seed <repository-root>/evals/salt-ai/ui-agent/fixtures/<task-id> --artifacts <temporary-artifacts-dir>
```

The acceptance script also requires the staged application's `node_modules` and
a production Vite build. Run it with the same
offline guard used for the local sample-app fixture setup. It checks behavior,
keyboard/focus, axe on the initial, open-dialog, and narrow states, 320 CSS
pixel horizontal containment, and source closure. The modification fixture
also checks the predecessor actions.

For each cell, record the model, exact prompts and guidance payload hashes,
starting fixture digest, package cohort identity, tool access, limits, elapsed
time, token and tool usage, acceptance result, and separately observed human
correction events/time. The four cells report paired outcomes only; they do
not establish a statistical result or human design acceptance.
