# Add team invitations without regressing the project screen

Starting from this local React/Vite project screen, add a usable team-invitation
experience. Use only the packages already declared in `package.json`; do not
add dependencies, call a service, make a network request, or change the package
manifest.

Keep the existing project screen working: the initial page still has **Create a
project**; the mode and density controls still change their displayed state;
**Preview launch** still opens its overlay and Escape closes it; completing the
existing project form still announces **Project settings saved.**

Make **Team** in the existing primary navigation hash-addressable. Following
it must expose a **Team members** section and mark Team as the current
location. Add **Invite collaborator**, which opens a named overlay with an
accessible **Collaborator email** field and an accessible **Access level**
choice. The choice must offer Viewer and Editor, with Viewer selected by
default.

The invitation overlay dismisses with Escape or Cancel and returns focus to
**Invite collaborator** without adding a member. Sending
`sam@example.com` as Editor adds a visible row for that address with **Editor**
and **Pending**, closes the overlay, restores focus, and announces
**Invitation sent to sam@example.com.** All data is local UI state.

Keep the current provider and theme setup. Make the new flow work by keyboard
and at 320 CSS pixels without horizontal document overflow. Select the existing
Salt primitives and layouts that fit the interaction; use custom markup only
for a real missing role or behavior.
