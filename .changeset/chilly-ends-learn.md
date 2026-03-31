---
"@salt-ds/core": minor
---

Added `Toggletip`.

`Toggletip` shows a user supplementary information on click.

```tsx
<Toggletip>
  <ToggletipTrigger aria-label="More info about locked content">
    <HelpCircleIcon aria-hidden />
  </ToggletipTrigger>
  <ToggletipPanel>
    <Text>
      This setting is managed at a project level. Contact your administrator for
      assistance.
    </Text>
  </ToggletipPanel>
</Toggletip>
```
