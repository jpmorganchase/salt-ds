# Salt UI source retrieval correction

## Outcome

The packaged Knowledge/CLI path now delivers complete component example source
from task queries and owner documents. The rebuilt suite passed **755 tests in
59 files**, and installed-package checks passed. Bounded implementation work was
delegated to GPT-5.6 Terra.

The fresh native feature trial did **not** establish unattended Salt correctness.
Copilot selected GPT-5.6 Luna, ran three native reviewer passes and two repair
cycles, and still left navigation and narrow-layout issues. A separate supervised
repair completed the usable preview. These outcomes are recorded separately.

## Delivered behavior

Component owner documents and linked example pages expose source references.
Following one returns the exact example and its directly imported, contained
public support files, including CSS and local data where available. Unresolved
local imports remain explicit. The installed consumer needs no repository
checkout to retrieve these files.

Examples remain **contextual and unvalidated** unless separate execution evidence
establishes readiness. Direct support files do not claim transitive dependency
closure or a complete runnable setup. The existing runnable workflow recipe
retains its separate contract and acceptance.

Task context selects relevant example references within the existing 16 KiB
budget. Complete fitting guidance is retained, and compact responses identify
omitted material. Examples require meaningful query overlap or an explicitly
named owner. This improves lexical evidence selection; it does not decide whether
an implementation is correct. The canonical primitive chooser now distinguishes
horizontal application navigation, vertical navigation, inline links and tabs.

## Consumer evidence

The same four development queries were run through the previous and current
installed CLI under the local execution network guard. They covered Dialog
composition, a differently worded Dialog task, horizontal application navigation
and local tab panels. The previous context responses exposed no complete-source
example references. Current responses exposed eight references in total, all
followed through both JSON and Markdown. Each resolved one complete example;
Markdown retained the exact code and support-file text from JSON.

The four current responses were 10,048, 7,429, 9,819 and 6,108 bytes. Dialog owner
and linked example-page documents each exposed 12 examples; NavigationItem owner
docs exposed five. Navigation examples supplied their direct data/history files,
and the Tabs appearance example supplied its CSS. These are development probes,
not a held-out relevance score or a controlled causal comparison.

The exact local candidate used bundle
`sha256:2ae747b5de47ac804cc5f3c1a8c80484470ceeadfa089b487721be961762c80a`.
Its Knowledge tarball SHA-256 was
`fc5c7c05bce31b561684cc497bc2e3426d08edecd9b1a21141aa67eb32982823`.
The CLI and matching local Salt runtime tarballs were installed offline into
the prepared fixture, preserving its manifest and lockfile bytes.

Verification passed:

- Focused extraction, containment, docs/Markdown and query-budget regressions;
  the complete rebuilt Knowledge/CLI suite; tooling types and build.
- Current plan/contracts, public examples and public docs checks.
- Exact CLI/Knowledge package validation and installed task-to-source probes.
- Packed operations-dashboard reconstruction, behavior acceptance and both
  deliberate negative variants.
- Changed-file quality; closeout source review completed with the disposition
  below.

The latest dashboard receipt SHA-256 is
`680eb1b7acc43ba8e5d0dc0794160377e7a27d32406f515d55a2f6061fa05a62`.
Both validation-removed and missing-worklist-behavior variants were rejected.

The closeout review uses the installed `autoreview` helper with Codex,
`--mode local --model gpt-5.6-sol --thinking high --codex-speed fast
--no-web-search`. The complete command and generated review are local evidence
under `dist/salt-ui-retrieval/`; accepted findings were corrected within the
original source/acceptance scope.

Accepted findings covered retrieval truncation/filtering and acceptance gaps in
current-build binding, invalid saves, history, network/dependency evidence and
Escape status preservation. Old-bundle compatibility was rejected under the
user's unreleased, exact-current contract. A proposed filler-word coverage defect
was rejected because the existing query normalizer already removes those words.

The final helper reported one remaining evidence finding based on a stale
"still being checked" sentence in its supplied context. That finding was
rejected after inspecting the completed native acceptance receipt and the
Escape-variant failure output. Both runs had finished, and both outcomes matched
this report. The helper exited with one finding; no actionable finding remains
after that evidence review.

## Native feature exercise

The independent [task brief](fixtures/modify-project-team/RETRIEVAL_TASK.md)
extended an existing project settings screen with saved-project launch review.
It required working hash destinations and history, retained drafts, invalid-save
rejection, a saved snapshot independent of later edits, expandable review details,
cancel/Escape focus restoration, repeated launch behavior and usable theme,
density, desktop and narrow layouts. The brief and behavior acceptance were
frozen before native output. The lead supplied no missing Salt choice during
the native attempt.

Copilot CLI 1.0.83 selected GPT-5.6 Luna for one creator session and all three
native reviewer invocations. The wrapper ran for 11 minutes 9 seconds. The first
review identified native primary-navigation anchors, clipped saved email text
and missing disclosure ARIA. The creator attempted repairs, briefly adopted
NavigationItem, then reverted that choice. The final native reviewer reported
`REVIEW PASS` while explicitly limiting evidence to a desktop screenshot and
unfinished acceptance. The creator also disclosed the acceptance timeout.

The creator used local context and component documents but did not follow a
complete-example reference. The final reviewer did retrieve the Dialog sizes
example through the new reference route. This proves use of that route by a
native agent, not consistent reference-led creation.

The [acceptance harness](retrieval-acceptance.mjs) rebuilds current inputs before
checking behavior and binds source, mutable project inputs, dependencies and
compiled files. Browser execution blocks external requests and service workers
and records runtime errors, screenshots and layout evidence. It permits the
task's valid disclosure action inside dialog content; it prescribes no universal
JSX arrangement.

After the native attempt, lead diagnosis found that immediate close/focus
assertions raced asynchronous dialog dismissal. Those assertions were changed
to wait for the same required outcome. A diagnostic showed that the later
Settings activation occurred while the dialog remained open and focus stayed
on Cancel. Task requirements were unchanged; the original failures and native
source were preserved. The initial harness SHA-256 was
`d885f5e7952f0347338d7fc18f668fd7c1042677093cdffe2ea835d0b6889a79`;
the harness after that timing correction had SHA-256
`600c44c6c97ac63c7e8f0aa4e9585ada92ec4c1c0048e15aec11d0604047cb37`.
Closeout review then found a missing explicit assertion that Escape preserve
launch status. Adding it enforced the already frozen task requirement; the final
harness SHA-256 is
`4109ec2178e48e54de603b04197a7a339af111b60cd489ac95bb971717fe6a15`.

The preserved native source passed corrected automated acceptance, but visual
inspection still found clipped email text at 320px and the primary navigation
still used custom anchors. Thus automated behavior acceptance and the native
review verdict were insufficient to establish the requested Salt quality.

## Supervised completion

A separate bounded Terra repair used the installed NavigationItem source/API,
preserved native hash/history behavior, removed the custom active treatment and
made the dialog value column shrink and wrap. It modified only the prepared
application's two source files. Typecheck and complete desktop/320 acceptance
passed; the lead inspected all eight resulting screenshots, including dark mode
and high density. There were no runtime errors or external requests.

The source digest changed from native
`sha256:524f1475b51cdf5f94920d76b75ea1bba099c0f37d92df77b1fb24a29c641c2a`
to supervised
`sha256:eb25f1964ca98d0d9ce329d887ae1c7b6f4a46940eb8e8ec3acf15f1ca0da059`.
The final dependency digest matched the value frozen before the native attempt:
`sha256:168c5573c2f21e72400aebbe490f300ef2fbc5747ff0835f8d6e09adee2deccd`.
The exact verified compiled preview has digest
`sha256:fd42ac3fe7938a2d79ee9f679e947a70ff73af3eda04aebb96f133f77f5d46d4`.
Its copied source, build and screenshots are retained locally under
`dist/salt-ui-preview/apps/project-launch/`; raw host logs remain outside Git.

A separate diagnostic copy with only the valid-save snapshot update removed
still built successfully, then failed acceptance waiting for saved confirmation.
The earlier stale-build negative also rejected invalid current source despite
an older build being present. Neither diagnostic changed the delivered app.
The final harness also accepted both preserved native and supervised source, and
rejected a diagnostic variant whose Escape handler incorrectly launched the
project. That variant built successfully before failing the new assertion.

## Limits

This is one feature exercise with diagnosed harness corrections and explicitly
supervised completion. It supplies no general reliability, model-quality or cost
comparison. Better source availability did not ensure correct adoption or a
sound reviewer verdict. Manual workflow promotion reviews and the independent
maintainer exercise remain pending in Unit 033/02a. No workflow promotion,
publication or deployment follows from this result.

The 2026-09-09 [reviewer qualification](REVIEWER_RESULTS.md) subsequently found
that the supervised application still implemented a disclosure role with custom
state/content composition despite matching installed Collapsible coverage.
That finding invalidated its use as a fully corrected, expected-pass review
fixture. The passing behavior and visual evidence above remain historical
results; they do not establish complete Salt component selection.
