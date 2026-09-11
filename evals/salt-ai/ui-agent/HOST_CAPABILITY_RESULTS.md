# Native Salt host capability check

The unscored 2026-09-11 check from `25e075126` proved guarded local execution,
but did not prove creator-to-reviewer delegation. The conditional fresh UI task
was not dispatched. Unit 033/02a and its checkpoint remain unchanged. The earlier
[requalification result](REQUALIFICATION_RESULTS.md), including its incomplete
launch-scope attempt, is preserved.

## Frozen scope

One native `salt-ui-creator` used GPT-5.6 Luna at medium effort with no inherited
conversation and an eight-minute limit. A separate temporary copy of the verified
app retained the exact source and dependency cohort. The prompt required no source
edits and two independent capabilities: one specifically approved guarded
project/browser command, and an actual native `salt-ui-reviewer` on GPT-5.6 Sol at
medium effort with no inherited conversation and a three-minute limit. That
reviewer's marker-only task would report INCOMPLETE for UI review.

The task, role files, prompt, wrapper, checks, skill, guard and marker were frozen
before dispatch. The check retained the existing Codex account authorization,
sandbox policy and offline guard. No dependencies were installed or user-wide
configuration changed. Raw outputs, copied source and images remain outside Git.

## Observed results

| Capability                        | Evidence and outcome                                                                                                                                                                                                                                                              |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Guarded project/browser execution | Passed. The creator invoked `verify-host.ps1` exactly once with specific command approval; its saved tool-result excerpt reports structured exit code 0. The stage receipt independently records checker exit 0 and a passing typecheck.                                          |
| Source and evidence integrity     | Passed. Source, baseline and captured source match; the change diff is empty. The current project inputs, dependency cohort and compiled output match the browser and typecheck receipts. All frozen input hashes remain unchanged.                                               |
| Browser artifacts                 | Twelve screenshots were generated. Checks passed at 1280 and 320 pixels, including dialog focus/keyboard containment and saved-value readability. Receipts report no external requests.                                                                                           |
| Creator image inspection          | Incomplete. The local image helper failed, and the creator's base64 forwarding returned unprocessable image content. No creator visual inspection is credited.                                                                                                                    |
| Native reviewer delegation        | Unproved. The creator reported no callable native delegation tool. No native spawn call was attempted, no reviewer ran, and no marker response exists. This is a report of the selected entry point's exposed tools, not a failed spawn or a claim about every Codex entry point. |

The actual guarded stage ran from 21:25:01 to 21:26:26 UTC. Its source digest is
`sha256:9959ed20bc0841b1ac1cf416dbce6f70c3b87d1ae2dc0d419084faceb38a2d15`
and its dependency cohort digest is
`sha256:80734f755b9d8c3590d51d8e824b3e6d4578b52266aee12be322af5bd35da525`.

After the creator completed, the lead independently checked the receipts,
frozen-input hashes, current source/dependencies/build and all twelve image files.
The lead's image helper also failed, but forwarding the actual 320-pixel details
PNG as base64 succeeded: the saved details and dialog actions are visible. This
one-image inspection does not replace the creator's missing visual inspection or
an independent reviewer. A read-only follow-up obtained the creator's original
command-result excerpt and exact tool/image errors without rerunning the stage.

Local evidence is indexed by the ignored `host-smoke-frozen.json` and
`host-smoke-audit.json` under `dist/salt-ui-requalification`. The temporary app's
`.evidence/smoke` contains `stage-run.json`, `result.json`,
`typecheck-result.json`, source, empty diff and images; the sibling capability
notes retain the creator's report and command-result excerpt.

## Decision and remaining boundary

The approved condition required both capabilities. With no actual native reviewer
invocation, stop before a fresh scored task. No fresh creator/reviewer trial,
source repair, UI-quality pass or promotion is inferred. The selected creator
entry point still needs a supported, observed native delegation route and usable
image inspection before another evaluation can establish a complete workflow.
The lead's own delegation tool does not establish that the selected creator has
one.

The current official [subagent guidance](https://learn.chatgpt.com/docs/agent-configuration/subagents)
and [configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
were consulted alongside local role/configuration metadata. Those documents do
not establish tool availability in this specific child run; no configuration
change or unsupported workaround was inferred from them.

Closeout validation passed: the plan validator, current contracts validator
(13 package families and 13 current outcome cases), changed-quality check
(122 supported files across 127 paths against the unchanged unit checkpoint),
and `git diff --check`. Independent closeout consistency review found no
actionable inconsistencies. Human design/accessibility acceptance and independent
maintainer review remain pending.
