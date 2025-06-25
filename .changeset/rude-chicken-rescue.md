---
"@salt-ds/theme": minor
---

New cursor foundation

```diff
+ --salt-cursor-active
+ --salt-cursor-disabled
+ --salt-cursor-drag-ew
+ --salt-cursor-drag-ns
+ --salt-cursor-grab
+ --salt-cursor-grab-active
+ --salt-cursor-hover
+ --salt-cursor-pending
+ --salt-cursor-readonly
+ --salt-cursor-text
```

Deprecated the following cursor tokens:

| Name                                        | Replacement                 |
| ------------------------------------------- | --------------------------- |
| `--salt-taggable-cursor-hover`              | `--salt-cursor-hover`       |
| `--salt-taggable-cursor-active`             | `--salt-cursor-active`      |
| `--salt-taggable-cursor-disabled`           | `--salt-cursor-disabled`    |
| `--salt-navigable-cursor-active`            | `--salt-cursor-active`      |
| `--salt-navigable-cursor-hover`             | `--salt-cursor-hover`       |
| `--salt-navigable-cursor-disabled`          | `--salt-cursor-disabled`    |
| `--salt-navigable-cursor-edit`              | `--salt-cursor-text`        |
| `--salt-target-cursor-disabled`             | `--salt-cursor-disabled`    |
| `--salt-actionable-cursor-hover`            | `--salt-cursor-hover`       |
| `--salt-actionable-cursor-active`           | `--salt-cursor-active`      |
| `--salt-actionable-cursor-disabled`         | `--salt-cursor-disabled`    |
| `--salt-draggable-horizontal-cursor-hover`  | `--salt-cursor-drag-ns`     |
| `--salt-draggable-horizontal-cursor-active` | `--salt-cursor-drag-ns`     |
| `--salt-draggable-vertical-cursor-hover`    | `--salt-cursor-drag-ew`     |
| `--salt-draggable-vertical-cursor-active`   | `--salt-cursor-drag-ew`     |
| `--salt-draggable-grab-cursor-hover`        | `--salt-cursor-grab`        |
| `--salt-draggable-grab-cursor-active`       | `--salt-cursor-grab-active` |
| `--salt-selectable-cursor-hover`            | `--salt-cursor-hover`       |
| `--salt-selectable-cursor-selected`         | `--salt-cursor-active`      |
| `--salt-selectable-cursor-blurSelected`     | `--salt-cursor-hover`       |
| `--salt-selectable-cursor-disabled`         | `--salt-cursor-disabled`    |
| `--salt-selectable-cursor-readonly`         | `--salt-cursor-readonly`    |
| `--salt-editable-cursor-hover`              | `--salt-cursor-text`        |
| `--salt-editable-cursor-active`             | `--salt-cursor-text`        |
| `--salt-editable-cursor-disabled`           | `--salt-cursor-disabled`    |
| `--salt-editable-cursor-readonly`           | `--salt-cursor-text`        |
