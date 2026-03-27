# Host Preprocessing Prompts

Use these prompts when a host can inspect screenshots or mockups, but Salt still needs structured migrate evidence instead of raw image attachments.

The rule stays the same everywhere:

1. inspect the attachment in the host
2. convert it into `source_outline` or `migrate_visual_evidence_v1`
3. pass only structured evidence into Salt

## Generic Prompt

```text
Use salt-ds for migration.
Inspect the attached screenshot or mockup first, but do not write Salt code yet.
Return only structured migration evidence:
- regions
- actions
- states
- notes
Keep anything uncertain in notes.
Then use that structured evidence for the Salt migrate workflow.
When Salt responds, summarize `result.ide_summary` first and keep the raw migration payload as supporting detail.
```

## Claude Prompt

```text
Use salt-ds to migrate this attached screen into Salt.
Preserve task flow, action order, and critical states.
Inspect the attachment first and produce only a source_outline JSON object with regions, actions, states, and notes.
Do not send the raw image to Salt.
Keep uncertainty in notes, then call migrate_to_salt with the source_outline.
Render the compact migrate summary before the raw workflow details.
```

## Copilot Prompt

```text
Use salt-ds for this migration task.
Normalize the attached screenshot or mockup into source_outline JSON before calling Salt.
Do not treat the raw image as a migrate_to_salt input.
If anything is low confidence, keep it in notes or ask a follow-up question.
Keep the answer focused on preserved behaviors, open questions, and the first Salt direction.
When Salt responds, lead with `result.ide_summary`.
```

## Cursor Prompt

```text
Use salt-ds to migrate this screen into Salt.
Read the attachment first and summarize it into source_outline or migrate_visual_evidence_v1.
Pass only structured evidence into Salt.
Keep the response centered on preserved behaviors, open questions, and the first Salt direction.
If MCP is unavailable, save the outline file and run salt-ds migrate --source-outline.
Render the compact migrate summary before the detailed translation payload.
```

## Codex Prompt

```text
Use salt-ds to migrate this attached UI into Salt.
Preserve task flow and critical states.
First write a source_outline JSON file in the repo with regions, actions, states, and notes.
Do not use the raw image as a direct Salt input.
Then run the Salt migrate workflow with that outline file.
Summarize the result from `result.ide_summary` first, then keep the rest of the payload reviewable.
```
