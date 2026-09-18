# Restore saved project details

Extend the prepared project-launch application with a way to restore saved
details. This is one bounded modification of the verified application. Preserve
its routing, provider, mode and density controls, project fields, validation,
save/preview workflow, disclosure, focus behavior and launch status.

In Overview, show a **Restore saved details** button. It is disabled before the
first valid save and whenever both editable draft values exactly equal the
latest valid saved project name and owner email. It is enabled whenever either
draft value differs from that snapshot, including invalid or empty drafts.
Draft values and restore availability survive a visit to Team and Settings and
a return to Overview.

Activating the button opens one modal labelled **Restore saved details?** with
**Keep editing** and **Restore details** buttons. Initial focus is on Keep
editing. Tab and Shift+Tab stay within the modal. Keep editing and Escape close
it, preserve both draft values and all saved and launch state, and return focus
to Restore saved details.

Restore details replaces both draft values with the latest valid saved project
name and owner email, closes the modal, and places focus on the Project name
input. The saved snapshot and launch state stay unchanged, and Restore saved
details becomes disabled. Opening, cancelling or confirming restoration must
not submit the project form, trigger save validation, save the draft or launch
the project. Repeated restoration acts once per confirmation, without duplicate
dialogs or status messages. No new notification is required.

Every later valid save becomes the restoration target. An invalid save leaves
the last valid target intact. Preview launch continues to show that saved
snapshot before and after restoration, including when the draft is invalid.
The existing Project launched status survives restoration and navigation.

Use the installed local Salt guidance to select and explain the implementation.
Do not install dependencies or make network/model API calls. Preserve the exact
prepared package cohort. Verify the complete existing journey and these restore
transitions with keyboard interaction at desktop and 320 CSS pixels, including
dark mode and high density. Capture and inspect labelled images of the dirty
draft, confirmation modal, cancelled draft and restored draft. Check modal
accessibility and that its title and actions are readable and fit the viewport.

After an initial implementation and actual evidence exist, preserve them and
obtain an independent native Salt reviewer assessment before claiming completion.
Allow at most two source repair cycles, each followed by affected checks and a
fresh independent Sol review. Report initial and final outcomes distinctly. Do
not treat a missing or unfinished review as approval.
