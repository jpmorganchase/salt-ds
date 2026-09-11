# Project launch scope

Extend the prepared project-launch application with a launch scope. This is one
bounded modification of the verified application. Preserve its routing, provider,
mode and density controls, project fields, validation, save/preview workflow,
disclosure, focus behavior and launch status.

In Overview, add a visibly labelled **Launch scope** group with two mutually
exclusive, keyboard-operable radio choices: **Pilot** and **Full rollout**. Both
choices must remain visible. Pilot is initially selected. Keep the scope in the
editable draft when visiting Team or Settings and returning to Overview.

**Save project** saves the scope with the valid project name and owner email as
one snapshot. An invalid save must preserve the previous snapshot, including its
scope. **Preview launch** continues to review the last valid saved snapshot;
editing a scope without saving must not change that review. In the expanded
review details, show **Launch scope** and the saved choice alongside the saved
name and email. Expanding/collapsing, Cancel and Escape preserve existing behavior.

On **Launch project**, record the scope of that launch. Settings displays
**Launched scope: Pilot** or **Launched scope: Full rollout** below the existing
**Project launched** status. Before any launch, it shows no launched-scope value.
Saving or cancelling a later draft/review does not rewrite the previous launched
scope. Launching a later valid saved snapshot replaces that value; repeating a
launch does not duplicate status or scope summaries. Overview's existing launch
status continues to work.

Use the installed local Salt guidance to select and explain the implementation.
Do not install dependencies or make network/model API calls. Preserve the exact
prepared package cohort. Verify the complete existing journey and these scope
transitions with keyboard interaction at desktop and 320 CSS pixels, including
dark mode and high density. Inspect the labelled images of the new form, expanded
review and Settings result, including each selected scope.

After an initial implementation and actual evidence exist, preserve them and
obtain an independent native Salt reviewer assessment before claiming completion.
Allow at most two source repair cycles, each followed by affected checks and a
fresh independent Sol review. Report initial and final outcomes distinctly. Do
not treat a missing or unfinished review as approval.
