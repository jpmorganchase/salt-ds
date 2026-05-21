---
"@salt-ds/core": minor
---

A side panel is a persistent, side-by-side workspace that keeps supporting information and controls available while users continue their main task. It’s intended for ongoing parallel work—such as referencing details, inspecting data, filtering results, or editing attributes—where maintaining visibility and context improves accuracy and efficiency.

```tsx
<SidePanelProvider>
  <SidePanelTrigger>
    <Button />
  </SidePanelTrigger>
  <SidePanel>
    <SidePanelHeader>
      <SidePanelTitle>Section Title</SidePanelTitle>
      <SidePanelCloseButton />
    </SidePanelHeader>
    <SidePanelContent>
      <Text>Side panel content goes here.</Text>
    </SidePanelContent>
  </SidePanel>
</SidePanelProvider>
```
