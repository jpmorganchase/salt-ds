# Project launch review

This is a fresh feature exercise on the original project starter, independent
of the invitation comparison and its follow-up. Use the installed Salt material
to make and explain component choices. Preserve the provider, theme controls,
project form, package cohort, and local hash navigation convention.

Make Overview, Team, and Settings real application destinations in the existing
header. Reflect the current destination and support browser back/forward.
Overview owns the existing editable project details; Team shows a read-only
owner summary; Settings shows the current launch status. Preserve an unfinished
Overview draft when visiting another destination and returning.

Extend the existing **Preview launch** action into a project launch review:

- Keep **Project name**, **Owner email**, and **Save project**. Require a name
  and valid email before saving. The preview action is available after a valid
  save and reviews that saved snapshot, even if the editable draft later changes.
- The review dialog offers **Show review details** to expand the saved name and
  email, changing to **Hide review details**. This action operates within the
  dialog's content and leaves the review open. It is separate from the final
  **Cancel** and **Launch project** decisions.
- Cancel and Escape leave the launch status unchanged and restore focus to
  Preview launch. Launch project closes the review and shows **Project launched**
  in Overview and Settings. Opening and cancelling a later review preserves that
  status. Launching again must not append duplicate status messages.

Use in-memory fixture state; refresh persistence is outside this task. Keep the
existing mode and density controls usable. Verify keyboard interaction, the
draft round trip, saved-snapshot behavior, repeated review actions, dialog focus,
light/dark mode, and desktop/320 CSS-pixel layouts. Inspect the labelled browser
images and provide an independent native reviewer with the source, retrieved
references, and actual verification evidence before claiming completion.
