# Create saved reports

Starting from this small local React/Vite screen, build a saved-report library
for an analyst. Use only the packages already declared in `package.json`; do
not add dependencies, call a service, make a network request, or change the
package manifest.

The page must start with the heading **Saved reports**, a clear empty state
whose text is **No saved reports yet.**, and an action named **New report**.

That action opens a named overlay for creating a report. It needs accessible
fields named **Report name** and **Description**, and an action named
**Create report**. Submitting an empty report name must show the visible alert
**Enter a report name.** and move focus to that field. The user can dismiss the
overlay with Escape or Cancel; dismissal returns focus to **New report** and
does not create a report.

Submitting `Quarterly risk overview` with the description
`Summary of open operational risks.` creates one visible report with that name,
description, and the state **Draft**. It closes the overlay, restores focus to
the creating action, and announces **Report "Quarterly risk overview"
created.** through a status message. All data is local UI state.

Keep the current provider and theme setup. Make the page work by keyboard and
at 320 CSS pixels without horizontal document overflow. Select the existing
Salt primitives and layouts that fit the interaction; use custom markup only
for a real missing role or behavior.
