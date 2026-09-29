---
"@salt-ds/date-components": patch
---

`DateParserField` is now a const object with a matching union type instead of an enum. `DateParserField.START` and `DateParserField.END` work as before, and a parser's `field` can also be compared with `"start"` or `"end"`.
