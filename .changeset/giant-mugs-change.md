---
"@salt-ds/lab": minor
---

Added `TableContainer` wrapper component that provides accessibility features including keyboard navigation support and focus indicators for scrollable tables.

```jsx
<TableContainer aria-labelledby={captionId}>
  <Table>
    <caption id={captionId}>{...}</caption>
    {...}
  </Table>
</TableContainer>
```
