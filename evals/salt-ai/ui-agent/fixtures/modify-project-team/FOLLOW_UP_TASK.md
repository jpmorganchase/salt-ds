# Retain project drafts and multiple team invitations

Start from the same local React/Vite fixture and meet every requirement in
`TASK.md`. Add the following continuation without changing the package
manifest, adding dependencies, calling a service or making a network request.
Keep all state local to the existing application and extend its existing
navigation and form seams rather than introducing another application framework
or mock layer.

The existing **Overview** navigation control remains hash-addressable at
`#overview`. Before saving, a user can enter **Portfolio review** in **Project
name** and **draft-owner@example.com** in **Owner email**, navigate through
**Team** (`#team`) and back through **Overview** (`#overview`), and find both
unsaved values intact. This round trip must preserve the ordinary Overview and
Team views; it is not a save action.

After returning to Team, a user can add both invitations in separate uses of
**Invite collaborator**:

| Collaborator email | Access level | State   |
| ------------------ | ------------ | ------- |
| sam@example.com    | Editor       | Pending |
| lee@example.com    | Viewer       | Pending |

The member list must expose each invitation as a list item containing its
email, access level and Pending state. **Viewer** remains the default access
level for a newly opened invitation. Both entries must remain visible after the
second invitation; adding the second entry must not replace the first.

Keep the current provider and theme setup. The Overview round trip and both
invitations must work by keyboard and at 320 CSS pixels without horizontal
document overflow. The existing project save, mode, density, preview,
dismissal, focus and one-invitation behavior remain required.
