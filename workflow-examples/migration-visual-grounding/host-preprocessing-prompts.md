# Host Preprocessing Prompts

Use these prompts when a host can inspect screenshots or mockups, while Salt
MCP still needs structured migrate evidence instead of raw attachments.

The rule stays the same:

1. inspect the attachment in the host
2. convert it to the public `source_outline` shape
3. pass only that object to `migrate_to_salt`
4. keep uncertainty visible in `notes`

## Generic prompt

```text
Use Salt MCP for this migration.
Inspect the attached screenshot or mockup first, but do not write Salt code yet.
Return structured evidence with regions, actions, states, and notes.
Keep anything uncertain in notes.
Then call migrate_to_salt with that source_outline object and the migration goal.
Summarize preserved behavior, open questions, and the first source-backed Salt direction.
```

## Primary code-assistant prompt

```text
Use Salt MCP for this migration task.
Normalize the attached screenshot or mockup into source_outline JSON before calling migrate_to_salt.
Do not pass the raw image as a tool input.
If anything is low confidence, keep it in notes or ask the user.
Lead with preserved behaviors, open questions, and the first source-backed Salt direction.
```

## Terminal-agent prompt

```text
Use Salt MCP to plan migration of this attached UI.
Preserve task flow and critical states.
First write a source_outline JSON file in the repo with regions, actions, states, and notes.
Read that file back and pass the parsed object to migrate_to_salt; the tool does not accept a file path.
Do not use the raw image, browser text, or design-tool payload as direct Salt input.
Summarize the compact result first and keep the supporting evidence reviewable.
```

## Other MCP-host prompt

```text
Use migrate_to_salt for this screen.
Inspect the attachment in the host and summarize it into source_outline.
Pass only the structured object into Salt MCP.
Keep the response centered on preserved behaviors, open questions, and the first source-backed Salt direction.
If Salt MCP is unavailable, save the outline and stop; do not invent or claim verified Salt migration guidance.
```
