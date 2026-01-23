---
"@salt-ds/core": patch
---

Added `TableContainer` component to provide accessibility features for scrollable tables

- Introduced new TableContainer wrapper component for tables with horizontal scroll
- Implemented ARIA attributes (role="region", aria-labelledby) for screen reader support
- Added keyboard navigation support for scrollable content (tab focus on container)
- Ensured focus indicators are visible when navigating scrollable areas

```jsx
<TableContainer aria-labelledby={captionId}>
  <Table>
    <caption id={captionId}>{...}</caption>
    {...}
  </Table>
</TableCOntainer
```
