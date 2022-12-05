---
"@jpmorganchase/uitk-core": minor
"@jpmorganchase/uitk-lab": minor
"@jpmorganchase/uitk-theme": minor
---

Make theme global font size `--uitk-text-fontSize` instead of 14px

Remove base 1.3 line height, replace with appropriate line height variant throughout code
Remoce text background on default and hover state tokens

```diff
- --uitk-text-base-lineHeight
- --uitk-typography-lineHeight
- --uitk-text-background
- --uitk-text-background-hover
```
