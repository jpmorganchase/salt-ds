---
"@salt-ds/lab": minor
---

Added `SidePanel`.

`SidePanel` is a collapsible container that slides in from an edge of its parent, providing supplementary content or controls without disrupting the main layout.

Use `SidePanelProvider` to manage open state, `SidePanelTrigger` to toggle the panel, `SidePanelTitle` provides the accessible name for the panel region automatically and `useSidePanelContext` to access `setOpen` for programmatic close.

```tsx
const PanelContent = () => {
  const { CloseIcon } = useIcon();
  const { setOpen } = useSidePanelContext();
  return (
    <SidePanel>
      <SidePanelHeader>
        <SidePanelTitle>
          <H2>Panel Title</H2>
        </SidePanelTitle>
        <Button
          aria-label="Close"
          appearance="transparent"
          onClick={() => setOpen(false)}
        >
          <CloseIcon aria-hidden />
        </Button>
      </SidePanelHeader>
      <SidePanelContent>
        <Text>Panel body content.</Text>
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
