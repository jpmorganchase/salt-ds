---
"@salt-ds/lab": minor
---

- Fixed multiple design inconsistencies in `Table`. For example, the alignment of wrapped text, column header separator height etc.
- Updated the `zebra` implementation in `Table`. Previously `zebra` supported `primary`, `secondary` and `tertiary` values. This has been simplified to `true` and `false`.

The color of the alternating rows is determined by the `variant` prop:

- `primary` variant uses the secondary background for alternating rows.
- `secondary` variant uses the primary background for alternating rows.
- `tertiary` variant uses the primary background for alternating rows.

```diff
- <Table zebra="primary" />
- <Table zebra="secondary" />
- <Table zebra="tertiary" />
+ <Table zebra={true} />
```
