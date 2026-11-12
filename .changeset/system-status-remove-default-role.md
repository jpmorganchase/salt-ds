---
"@salt-ds/lab": patch
---

Removed the default `role="status"` from `SystemStatus`, matching `Banner`. Screen readers don't reliably announce a live region that is added to the page after it loads, so the default role couldn't be relied on to announce a system status.

A `SystemStatus` rendered on its own is no longer a live region. To announce it, render it inside a container with `role="alert"` for an error system status, or `role="status"` for all other statuses, and add that container to the page when it first loads. If your tests find `SystemStatus` by its role, target the container instead.

```tsx
<div role="status">
  {open && (
    <SystemStatus>
      <SystemStatusContent>
        <Text color="inherit">
          Scheduled maintenance is planned for Saturday from 08:00 to 10:00 UTC.
        </Text>
      </SystemStatusContent>
    </SystemStatus>
  )}
</div>
```
