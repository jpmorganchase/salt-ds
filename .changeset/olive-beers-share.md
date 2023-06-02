---
"@salt-ds/styles": patch
"@salt-ds/window": patch
---

Added @salt-ds/styles and @salt-ds/window packages

These packages are introduced to support uses of Salt in a desktop application where pop-out elements such as tooltips are rendered into separate windows with no previously added CSS.

The insertion point where useComponentCssInjection inserts styles can be controlled via InsertionPointContext
