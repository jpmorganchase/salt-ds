# Native Salt UI preview outcome

On 8 September 2026, two local applications completed the Copilot creator,
independent reviewer and repair workflow. Both saved preview copies passed an
independent typecheck, production build, unchanged initial browser acceptance
and the additional checks in `follow-up-acceptance.mjs`.

| Application   | Reusable checker coverage                                                                                                                                                                                             | Final native review                                                                                                                                              |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Saved reports | Create two reports, search/no match/clear, select details, validate and cancel editing without changing the saved name or description, save one report while retaining the other; report actions activate by keyboard | Pass after source repair; reviewer retrieved FormField, Badge and Card records and viewed four labelled screenshots                                              |
| Project team  | Retain an unsaved Overview draft across navigation, invite two people with different access levels, preserve existing project controls; navigation and invitation actions activate by keyboard                        | Pass after source repair and a further focused-evidence correction; reviewer retrieved radio-button and form-field guidance and viewed five labelled screenshots |

The browser acceptance checks exercise desktop and 320-CSS-pixel states, focus
restoration, accessible names, axe checks, runtime errors and external requests.
The final runs reported no browser errors or external requests. They are focused
checks of these public fixtures, not full manual accessibility certification.

Separate focused native and independent browser diagnostics verified empty and
malformed email feedback, case-insensitive duplicate rejection, field-error
association and valid recovery with dialog closure and restored focus. The final
independent diagnostic passed axe, runtime and network checks and is retained
with the saved team app under `.evidence/independent-validation-final/`. These
validation assertions are not part of the reusable `follow-up-acceptance.mjs`
checker; repeating that checker alone does not repeat the focused diagnostics.

## What required repair

The initial native team attempt passed the task checks but used native radio
inputs for a role covered by Salt. A separate browser diagnostic also found
that malformed email values were accepted, blank submissions gave no useful
feedback, and the same email could be invited twice. The native creator replaced
the access selector with Salt RadioButton/RadioButtonGroup, used Salt form-field
error feedback and added validation and duplicate protection.

The initial report attempt reached passing browser checks after several local
iterations. Source and screenshot inspection found avoidable custom field,
badge and summary presentation, plus grid stretching that pushed related
controls far apart. The native creator applied FormField, Badge and Card
coverage and repaired the page flow.

The initial review results were insufficient: the team reviewer had run only
`info` and had not viewed images; the report reviewer completed before later
source edits and had not viewed images. The shared Skill now requires actual
task-relevant record retrieval, image inspection and a stable source handoff.
Fresh native reviews exercised those requirements. During the team repair,
the reviewer caught a focused screenshot captured before dialog closure settled.
The creator corrected the probe to assert closure and restored trigger focus,
captured settled evidence and obtained a fresh pass without further app edits.

These are supervised follow-up results. The lead supplied the first repair
findings and corrected review-evidence requirements; the native creator made
the app repairs. This does not establish that the initial workflow reliably
finds every defect without supervision. The original four attempts, their
briefs, `acceptance.mjs` and `RESULTS.md` remain unchanged.

## Native host and retained evidence

GitHub Copilot CLI 1.0.83 used its real `--agent salt-ui-creator` entrypoint and
named reviewer task delegation. The host emitted reviewer lifecycle events.
Both final reviews independently retrieved matching local Salt records, viewed
actual PNGs, and had no later application source edits in their native runs.
The creator's compatible cohort was core 1.70.0, icons 1.18.2, theme 1.45.0 and
React 18.3.1, using Knowledge bundle
`sha256:481a857e8a9125d24ef900aa93efedf8e9439ed17010e447a13f8bfb9fd0717b`.

The host selected `mai-code-1.1-flash` and `gpt-5.6-luna` in different phases
and reviewer calls. This was not a controlled model or cost comparison. The
Copilot reviewer profile is a read-only role and tool policy, not an operating
system sandbox. Codex native activation and VS Code extension activation remain
unverified.

Generated applications, before/after screenshots, focused diagnostics and raw
host logs remain outside Git. The local saved previews live under
`dist/salt-ui-preview/apps/report-library` and
`dist/salt-ui-preview/apps/project-team`, with `src/` and labelled `.evidence/`
directories. Their source and package files were compared byte-for-byte with
the reviewed originals before independent verification. The initial native
source/evidence snapshots and original comparison apps were retained separately.

| Final source file            | SHA-256                                                            |
| ---------------------------- | ------------------------------------------------------------------ |
| Report library `src/App.tsx` | `3e0a6c8740ef025bacf60b818be259c85b1963403992b333a492d7b4db78787f` |
| Report library `src/app.css` | `a17951a88f0266ec2925a6370c2dacf0f1ee8480635558b758ebe10756cd108f` |
| Project team `src/App.tsx`   | `11005190c862e39cdac5f42c7b9f6b01dbbc4ac6bf60e2709d511d260dcf26c2` |
| Project team `src/app.css`   | `5566aa8c41f206baf3703499a3dc5e06c21904e1fc3f561ed52b01577307f215` |

Use the [local preview quickstart](../../../docs/ai/salt-ui-agent-workflow.md)
for an already prepared Salt project and [follow-up instructions](FOLLOW_UP.md)
to repeat the fixture exercise. From either saved preview directory, the
prepared `run-local.ps1` wrapper can run `npm run typecheck`, `npm run build`,
or `node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port <port>`.
The apps use in-memory state and do not send real invitations or save to a
backend; a refresh clears the fixture records.

The preview is local and unreleased. Unit 033/02a remains in progress: human
owner/design/manual accessibility review, the independent maintainer exercise
and consumer observations are still pending. No publication, deployment,
workflow promotion or Doctor qualification occurred.
