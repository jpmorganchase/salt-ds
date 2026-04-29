# Table (Copilot Context)

Displays simple tabular data using semantic table structure.

- API: ./table.json
- Guidance: ./table.md

## Key rules
- Use `Table` only for simple tabular data; use Data Grid for complex interactions
- Prefer `<caption>` for table accessible naming; use `aria-label`/`aria-labelledby` when needed
- Wrap in `TableContainer` when overflow is possible so the region becomes keyboard-focusable
- Use `variant` and `divider` to match visual hierarchy; avoid unnecessary decoration
- Use `zebra` for denser datasets where alternating rows improve scanning
- Right-align numeric columns with `textAlign="right"`

## Example
```tsx
import { Table, THead, TBody, TR, TH, TD, TFoot, TableContainer } from "@salt-ds/core";

<TableContainer style={{ maxWidth: 640 }}>
	<Table>
		<caption>Quarterly sales data</caption>
		<THead>
			<TR>
				<TH>Region</TH>
				<TH textAlign="right">Revenue</TH>
			</TR>
		</THead>
		<TBody>
			<TR>
				<TD>EMEA</TD>
				<TD textAlign="right">$1.2M</TD>
			</TR>
		</TBody>
	</Table>
</TableContainer>
```
