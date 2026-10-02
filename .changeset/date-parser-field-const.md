---
"@salt-ds/date-components": patch
---

`DateParserField` is now a const object with a matching union type instead of an enum. `DateParserField.START` and `DateParserField.END` work as before, as values and as types, and `"start"` or `"end"` can now be used wherever a `DateParserField` is expected.
