---
"@jpmorganchase/uitk-core": minor
"@jpmorganchase/uitk-lab": minor
"@jpmorganchase/uitk-theme": minor
---

Make theme global font size `--uitk-text-fontSize` instead of 14px, and move to global.css from typography.css
Give global values for font-size, font-family, color, line-height, letter-spacing

Remove base 1.3 line height, and replace with appropriate line height variant throughout the code
Remove text background on default and hover state tokens

```diff
- --uitk-text-base-lineHeight
- --uitk-typography-lineHeight
- --uitk-text-background
- --uitk-text-background-hover
```
