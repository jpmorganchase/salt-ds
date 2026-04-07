---
"@salt-ds/lab": minor
---

Added `SidePanel`.

`SidePanel` is a collapsible container that slides in from an edge of its parent, providing supplementary content or controls without disrupting the main layout.

Use `SidePanelProvider` to manage open state, `SidePanelTrigger` to toggle the panel, and `useSidePanelContext` to access `setOpen` for programmatic close.

```tsx
const PanelContent = () => {
  const { setOpen } = useSidePanelContext();
  return (
    <SidePanel aria-label="Details">
      <Button onClick={() => setOpen(false)}>Close</Button>
    </SidePanel>
  );
};

<SidePanelProvider>
  <SidePanelTrigger>
    <Button>Open Panel</Button>
  </SidePanelTrigger>
  <PanelContent />
</SidePanelProvider>;
```
