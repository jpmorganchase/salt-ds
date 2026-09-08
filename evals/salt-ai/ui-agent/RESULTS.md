# Salt UI agent prototype comparison — 2026-09-08

The creator profile did not demonstrate a quality advantage in this small
comparison. Both approaches passed the two task-specific automated checklists,
but both missed Salt Card reuse in the creation task and broader state
preservation problems remained. Keep the profiles as an experimental way to
organize work, with independent review; do not position them as a proven quality
upgrade or promote the generated trial applications as reference workflows.

## What was compared

Four fresh Codex desktop agents used `gpt-5.6-terra` with medium reasoning and a
twelve-minute allowance. Each task had identical starting application files,
installed dependencies, tool access and requirements across its two attempts.
One condition used the unchanged published `salt-design-system` skill. The other
used the creator role and the new shared `salt-ui` skill. No implementation hints
or human code corrections were supplied during these attempts. Agent self-repair
was allowed within the time limit.

Both conditions retrieved the same locally installed Knowledge bundle:
`sha256:481a857e8a9125d24ef900aa93efedf8e9439ed17010e447a13f8bfb9fd0717b`.
The application vector was core 1.70.0, icons 1.18.2 and theme 1.45.0, with React
18.3.1. The CLI and Knowledge packages remained at their local 0.0.0 candidate
versions. Fixture setup verified the local Salt tarball hashes and replayed an
npm lockfile. Salt retrieval and application execution stayed local; browser
requests to external hosts were blocked.

The task briefs and acceptance requirements were fixed before inspecting
generated applications. Browser checking was calibrated to await focus, layout
and hash-navigation updates, and its process-cleanup call was corrected. These
checker corrections were applied uniformly without changing task requirements
or generated application source. Final acceptance used script digest
`sha256:06909d6f488c9bcdbf7293173a44cea8dba37800fce907444eadcf5995b248c7`.

## Initial outcomes

| Task                             | Ordinary agent + published skill                     | Creator role + shared skill                           |
| -------------------------------- | ---------------------------------------------------- | ----------------------------------------------------- |
| Create saved reports             | Build, types and named browser checks passed; 8m 14s | Build, types and named browser checks passed; 11m 55s |
| Add team invitations             | Build, types and named browser checks passed; 7m 36s | Build, types and named browser checks passed; 6m 22s  |
| Salt Card reuse in saved reports | Missed: custom bordered article                      | Missed: custom bordered article                       |

Times run from each agent's first action to its final response, rounded to the
nearest second. Two attempts ran concurrently. These timings are diagnostic;
the sample is too small for an efficiency conclusion. Per-attempt token and
monetary usage were unavailable from the desktop host, so no cost saving is
claimed.

The browser checklists covered the named single-item creation and invitation
flows, empty-name validation, default Viewer selection, Cancel/Escape,
announcements, focus restoration, the starter's existing actions, axe, and
320-pixel containment including open dialogs. All four final browser runs
completed without application errors or external requests. Passing those
checklists did not establish complete task compliance or human design acceptance.

Both baseline agents also reported incomplete legacy Doctor coverage. That is
not a clean Doctor result and does not affect its preserved `CUT_DOCTOR`
disposition. The new shared skill does not depend on Doctor.

## Independent review and additional diagnostics

A fresh Terra reviewer used high reasoning, neutral case labels, current source,
labeled screenshots and the independent check definitions. It independently
retrieved the same compatible bundle, including Card, Dialog, FormField,
RadioButton and Banner records. It confirmed that the two saved-report summaries
match the existing Card role and therefore should not have been reconstructed
with custom borders. It also identified excessive vertical space in the creator's
report layout. The creator's profile alone did not enforce its own selection
and visual-review instructions.

The review fixture initially lacked complete package-manager evidence and
included obsolete checker-debugging images. These were corrected before findings
were accepted. The reviewer then retracted its preliminary validation and
clipping claims. Current screenshot labels and a verifiable installed project
context are necessary review inputs; an agent review is not self-validating.

After the initial checklists, separate browser probes exercised a second create
or invitation and a navigation round trip with an unsaved project draft:

| Additional diagnostic                                 | Ordinary agent + published skill | Creator role + shared skill |
| ----------------------------------------------------- | -------------------------------- | --------------------------- |
| Create a second report without losing the first       | First report replaced            | First report replaced       |
| Invite a second collaborator without losing the first | Both retained                    | First collaborator replaced |
| Return from Team to an unsaved project draft          | Draft cleared                    | Draft cleared               |

These were diagnostic probes added after the initial comparison, not silently
added to its original pass score. They expose important gaps in the generated
applications and in the first task checklists. The trial source was retained
unchanged; no repaired output is presented as an initial success.

## Decision and limits

Retain the hybrid architecture: canonical Salt facts in Knowledge, one short
shared skill for retrieval and verification, and thin creator/reviewer roles
above it. Independent retrieval let the reviewer catch a concrete reuse failure
that both creators missed. This supports keeping a review stage, but does not
prove that the new creator role is better than ordinary guidance.

Before a stronger claim, future tasks must cover repeated additive actions,
state retention across navigation, actual Salt reuse and visual composition as
well as first-action behavior. Do not add more personas or duplicate Salt API
guidance to compensate for these misses. This experiment combined a new role
and a revised shared skill; it cannot isolate their individual effects.

The files have valid Copilot YAML and Codex TOML structure. Native activation
remains unverified here: the Codex CLI smoke test rejected the custom agent type
and its shell smoke test blocked file reads; a Copilot executable was unavailable.
The completed desktop trials explicitly supplied the role and skill and therefore
validate their behavior, not native profile registration. There was no consumer
trial, manual accessibility/design approval, publication or deployment.

After the trials, closeout review corrected the shared skill's command examples
to invoke the installed CLI binary directly and clarified the harness's existing
repository dependency prerequisites. The trial environments already enforced an
offline guard. Direct `info`, `context`, and `docs` execution and the missing-binary
failure path were checked separately; no model comparison was rerun or improved
outcome claimed for this command-only correction.

Authored fixtures and checks live beside this report. Raw prompts, transcripts,
screenshots, installed dependencies and generated trial applications remain
outside Git. The existing published skill and candidate packages are unchanged.
