# Alpha Visual Migration Packet

This packet is the first checked-in evaluation set for the Alpha 2 visual-grounding experiment.

Use it to compare the same migration task across four evidence variants:

1. source-only
2. outline-only
3. runtime-only
4. combined outline + runtime

Fixture directory:

- [`../../../../workflow-examples/migration-visual-grounding`](../../../../workflow-examples/migration-visual-grounding)

Files:

- [`legacy-orders.query.txt`](../../../../workflow-examples/migration-visual-grounding/legacy-orders.query.txt)
- [`legacy-orders.source-outline.json`](../../../../workflow-examples/migration-visual-grounding/legacy-orders.source-outline.json)
- [`legacy-orders.runtime.html`](../../../../workflow-examples/migration-visual-grounding/legacy-orders.runtime.html)
- [`legacy-orders.scorecard.template.json`](../../../../workflow-examples/migration-visual-grounding/legacy-orders.scorecard.template.json)
- [`run-alpha-matrix.mjs`](../../../../workflow-examples/migration-visual-grounding/run-alpha-matrix.mjs)

Shortcut:

```bash
node workflow-examples/migration-visual-grounding/run-alpha-matrix.mjs
```

That command writes a filled scorecard skeleton and per-variant payload artifacts automatically.

## Run Matrix

Source-only:

```bash
salt-ds migrate "$(cat workflow-examples/migration-visual-grounding/legacy-orders.query.txt)" --json
```

Outline-only:

```bash
salt-ds migrate --source-outline workflow-examples/migration-visual-grounding/legacy-orders.source-outline.json --json
```

Runtime-only:

1. Serve [`legacy-orders.runtime.html`](../../../../workflow-examples/migration-visual-grounding/legacy-orders.runtime.html) locally.
2. Run:

```bash
salt-ds migrate "$(cat workflow-examples/migration-visual-grounding/legacy-orders.query.txt)" --url <served-url> --mode fetched-html --json
```

Combined:

```bash
salt-ds migrate "$(cat workflow-examples/migration-visual-grounding/legacy-orders.query.txt)" --source-outline workflow-examples/migration-visual-grounding/legacy-orders.source-outline.json --url <served-url> --mode fetched-html --json
```

## Rubric

Score each variant `1-5` on:

- `migration_fidelity`
  - does the plan preserve the important task flow, landmarks, actions, and states?
- `confidence_accuracy`
  - does the reported confidence match the real uncertainty level?
- `clarification_quality`
  - are the follow-up questions specific, necessary, and useful?
- `final_usefulness`
  - would a team actually want to implement from this result?

Use [`legacy-orders.scorecard.template.json`](../../../../workflow-examples/migration-visual-grounding/legacy-orders.scorecard.template.json) to record results.

## Expected Deltas

- source-only should be the weakest baseline
- outline-only should improve region/action/state modeling
- runtime-only should improve current-experience preservation
- combined should be better than either single-evidence mode on:
  - clarification quality
  - preserve checks
  - confirmation checks

If combined is not better than the best single-evidence run, the experiment should probably narrow rather than expand.

## Current Alpha Boundary

- raw screenshot files and image URLs are not first-class inputs yet
- use `source-outline` as the mockup-style representation for screenshot or Figma notes
- use `--url` for current live UI capture
- do not interpret this packet as a commitment to full design-tool ingestion
