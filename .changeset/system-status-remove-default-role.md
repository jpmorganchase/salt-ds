---
"@salt-ds/lab": patch
---

Removed the default `role="status"` from `SystemStatus`, matching `Banner`. Because the role was on the system status itself, the live region was added to the page at the same time as its content, which screen readers don't reliably announce.

A system status that's present when the page loads doesn't need a role. To make it a landmark that screen reader users can find and identify, you can pass `role="region"` and an `aria-label`.

To announce a system status that's added after the page loads, render it inside a container with `role="alert"` for an error system status, or `role="status"` for all other statuses, and add that container when the page first loads.

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

If you use `role="status"` to find `SystemStatus` anywhere in your app, such as in tests, CSS or scripts, update those selectors.
