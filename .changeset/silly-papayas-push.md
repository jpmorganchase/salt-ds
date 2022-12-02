---
"@jpmorganchase/uitk-core": minor
"@jpmorganchase/uitk-lab": minor
"@jpmorganchase/uitk-theme": minor
---

Replace 1px borders with size token and remove `--uitk-size-bottomBorder` as it's component specific.

```diff
- --uitk-size-bottomBorder
- --uitk-container-borderWidth
- --uitk-editable-borderWidth
- --uitk-editable-borderWidth-hover
- --uitk-editable-borderWidth-disabled
- --uitk-editable-borderWidth-readonly
- --uitk-selectable-borderWidth
- --uitk-selectable-borderWidth-hover
- --uitk-selectable-borderWidth-selected
- --uitk-selectable-borderWidth-blurSelected
- --uitk-separable-borderWidth
- --uitk-target-borderWidth
- --uitk-target-borderWidth-hover
- --uitk-target-borderWidth-disabled
+ --uitk-size-border: 1px
+ --uitk-measured-borderWidth-active: 2px
+ --uitk-measured-borderWidth-complete: 2px
+ --uitk-measured-borderWidth-incomplete: 2px
```
