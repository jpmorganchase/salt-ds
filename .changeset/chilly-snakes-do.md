---
"@salt-ds/theme": minor
---

New border style foundation

```diff
+ --salt-borderStyle-dashed
+ --salt-borderStyle-dotted
+ --salt-borderStyle-solid
```

Deprecated the following `-borderStyle` characteristic tokens:

| Name                                         | Replacement                 |
| -------------------------------------------- | --------------------------- |
| `--salt-container-borderStyle`               | `--salt-borderStyle-solid`  |
| `--salt-editable-borderStyle`                | `--salt-borderStyle-solid`  |
| `--salt-editable-borderStyle-hover `         | `--salt-borderStyle-solid`  |
| `--salt-editable-borderStyle-active`         | `--salt-borderStyle-solid`  |
| `--salt-editable-borderStyle-disabled`       | `--salt-borderStyle-solid`  |
| `--salt-editable-borderStyle-readonly`       | `--salt-borderStyle-solid`  |
| `--salt-selectable-borderStyle`              | `--salt-borderStyle-solid`  |
| `--salt-selectable-borderStyle-hover`        | `--salt-borderStyle-solid`  |
| `--salt-selectable-borderStyle-selected`     | `--salt-borderStyle-solid`  |
| `--salt-selectable-borderStyle-blurSelected` | `--salt-borderStyle-solid`  |
| `--salt-separable-borderStyle`               | `--salt-borderStyle-solid`  |
| `--salt-target-borderStyle`                  | `--salt-borderStyle-dashed` |
| `--salt-target-borderStyle-hover`            | `--salt-borderStyle-solid`  |
| `--salt-target-borderStyle-disabled`         | `--salt-borderStyle-dashed` |
| `--salt-track-borderStyle`                   | `--salt-borderStyle-solid`  |
| `--salt-track-borderStyle-active`            | `--salt-borderStyle-solid`  |
| `--salt-track-borderStyle-complete`          | `--salt-borderStyle-solid`  |
| `--salt-track-borderStyle-incomplete`        | `--salt-borderStyle-dotted` |
