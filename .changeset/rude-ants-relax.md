---
"@salt-ds/core": minor
---

Move separators from `FlexLayout` to `StackLayout`.

 - Removed separators `div` wrapper with `display:content` from `FlexLayout`. 
   This change removes separators from `FlexLayout` and allows styles like `.classname > div` to be passed.
 - Add separators to `StackLayout`.
 - Add direction to `StackLayout` to allow horizontal stacks.
