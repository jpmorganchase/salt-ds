---
"@salt-ds/core": minor
---

Added table components, `Table`, `TBody`, `TD`, `TFoot`, `TH`, `THead`, `TR`, `TableContainer`.

`Table` is a basic HTML table intended for simple data display.

```tsx
<TableContainer>
  <Table>
    <caption>Table name</caption>
    <THead>
      <TR>
        <TH>Header 1</TH>
        <TH>Header 2</TH>
      </TR>
    </THead>
    <TBody>
      <TR>
        <TD>Row 1, Col 1</TD>
        <TD>Row 1, Col 2</TD>
      </TR>
      <TR>
        <TD>Row 2, Col 1</TD>
        <TD>Row 2, Col 2</TD>
      </TR>
    </TBody>
    <TFoot>
      <TR>
        <TD>Footer 1</TD>
        <TD>Footer 2</TD>
      </TR>
    </TFoot>
  </Table>
</TableContainer>
```
