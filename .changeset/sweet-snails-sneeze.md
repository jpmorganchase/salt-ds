---
"@salt-ds/lab": minor
---

Added `SidePanel`.

`SidePanel` is a collapsible container that slides in from an edge of its parent, providing supplementary content or controls without disrupting the main layout.

Use `SidePanelProvider` to manage open state, `SidePanelTrigger` to toggle the panel, and `useSidePanelContext` to access `setOpen` for programmatic close. `SidePanelContent` provides a standardised header and scrollable body layout.

```tsx
const PanelContent = () => {
  const { setOpen } = useSidePanelContext();
  return (
    <SidePanel aria-label="Details">
      <SidePanelContent header={<H2>Title</H2>}>
        {/* panel body */}
      </SidePanelContent>
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
/SidePanelProvider>;
>>>>>>> origin/create-inlaid-panel-polish
```
