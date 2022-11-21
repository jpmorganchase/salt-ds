---
"@jpmorganchase/uitk-lab": minor
"@jpmorganchase/uitk-theme": minor
---

Change 'Figure' Text component to 'Display'

Change `-figure` text tokens to `display`, updated values and font weights

```diff
- --uitk-text-figure1-fontSize
- --uitk-text-figure1-fontWeight
- --uitk-text-figure2-fontSize
- --uitk-text-figure2-fontWeight
- --uitk-text-figure3-fontSize
- --uitk-text-figure3-fontWeight
- --uitk-text-figure1-lineHeight: 72px;
- --uitk-text-figure2-lineHeight: 48px;
- --uitk-text-figure3-lineHeight: 24px;
+ --uitk-text-display1-fontWeight
+ --uitk-text-display1-fontWeight-strong
+ --uitk-text-display1-fontWeight-small
+ --uitk-text-display2-fontWeight
+ --uitk-text-display2-fontWeight-strong
+ --uitk-text-display2-fontWeight-small
+ --uitk-text-display3-fontWeight
+ --uitk-text-display3-fontWeight-strong
+ --uitk-text-display3-fontWeight-small
```

Add line heights

HD

```diff
+ --uitk-text-display1-lineHeight: 54px;
+ --uitk-text-display2-lineHeight: 36px;
+ --uitk-text-display3-lineHeight: 24px;
```

MD

```diff
+ --uitk-text-display1-lineHeight: 70px;
+ --uitk-text-display2-lineHeight: 47px;
+ --uitk-text-display3-lineHeight: 32px;
```

LD

```diff
+ --uitk-text-display1-lineHeight: 88px;
+ --uitk-text-display2-lineHeight: 60px;
+ --uitk-text-display3-lineHeight: 42px;
```

TD

```diff
+ --uitk-text-display1-lineHeight: 109px;
+ --uitk-text-display2-lineHeight: 76px;
+ --uitk-text-display3-lineHeight: 54px;
```
