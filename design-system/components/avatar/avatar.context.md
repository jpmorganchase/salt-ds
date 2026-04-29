# Avatar (Copilot Context)

Use Avatar for compact identity representation (person, group, entity, or channel).

- API: ./avatar.json
- Guidance: ./avatar.md

## Key rules
- Use `src` for image avatars; provide `name` to support initials fallback.
- Keep default `size={2}` and `color="accent"` unless layout/category intent requires change.
- Mark decorative avatars as `aria-hidden` to avoid repeated announcements.
- For custom fallback icons, use a context-appropriate `aria-label`.

## Example
```tsx
import { Avatar } from "@salt-ds/core";

<Avatar name="Ada Lovelace" src="/profiles/ada.png" />
```
