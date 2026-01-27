---
"@salt-ds/lab": minor
---

Added `TableContainer` wrapper component that provides accessibility features including keyboard navigation support and focus indicators for scrollable tables.

```jsx
<TableContainer labelId={labelId}>
  <Table>
    <caption id={labelId}>{...}</caption>
    {...}
  </Table>
</TableContainer>
```
