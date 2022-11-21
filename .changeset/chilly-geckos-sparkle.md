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
-  --uitk-text-caption-minHeight
-  --uitk-text-help-fontWeight
-  --uitk-text-help-fontSize
-  --uitk-text-help-minHeight
+  --uitk-text-label-fontWeight
+  --uitk-text-label-fontWeight-strong
+  --uitk-text-label-fontSize
```

Correct line height values

TD

```diff
-  --uitk-text-caption-lineHeight: 16px;
-  --uitk-text-help-lineHeight: 16px;
+  --uitk-text-label-lineHeight: 18px;
```

LD

```diff
-  --uitk-text-caption-lineHeight: 14px;
-  --uitk-text-help-lineHeight: 14px;
+  --uitk-text-label-lineHeight: 16px;
```

MD

```diff
-  --uitk-text-caption-lineHeight: 14px;
-  --uitk-text-help-lineHeight: 14px;
+  --uitk-text-label-lineHeight: 14px;
```

HD

```diff
-  --uitk-text-caption-lineHeight: 14px;
-  --uitk-text-help-lineHeight: 14px;
+  --uitk-text-label-lineHeight: 13px;
```
