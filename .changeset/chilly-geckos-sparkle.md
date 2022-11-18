---
"@jpmorganchase/uitk-core": minor
"@jpmorganchase/uitk-grid": minor
"@jpmorganchase/uitk-lab": minor
"@jpmorganchase/uitk-theme": minor
---

Merge `-caption` and `-help` tokens to single `-label` token
Remove `--uitk-text-help-fontWeight`, `--uitk-text-caption-fontStyle`

```diff
-  --uitk-text-caption-fontStyle
-  --uitk-text-caption-fontWeight
-  --uitk-text-caption-fontWeight-strong
-  --uitk-text-caption-fontSize
-  --uitk-text-caption-lineHeight
-  --uitk-text-caption-minHeight
-  --uitk-text-help-fontWeight
-  --uitk-text-help-fontSize
-  --uitk-text-help-lineHeight
-  --uitk-text-help-minHeight
+  --uitk-text-label-fontWeight
+  --uitk-text-label-fontWeight-strong
+  --uitk-text-label-fontSize
+  --uitk-text-label-lineHeight
+  --uitk-text-label-minHeight
```

Remove `-hover` and `-selected` foreground styles

```diff
- --uitk-text-primary-foreground-hover
- --uitk-text-primary-foreground-selected
- --uitk-text-secondary-foreground-hover
- --uitk-text-secondary-foreground-selected
```
