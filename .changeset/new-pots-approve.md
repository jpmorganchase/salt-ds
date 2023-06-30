---
"@salt-ds/core": major
---

Removed `AdornmentButton`. Replace usages with the `Button` component.

```diff
- <Input
-   defaultValue="Value"
-   startAdornment={<AdornmentButton>Test</AdornmentButton>}
-   data-testid="test-id-3"
- />
+ <Input
+   defaultValue="Value"
+   startAdornment={<Button>Test</Button>}
+   data-testid="test-id-3"
+ />
```

```diff
- <Input
-   disabled
-   defaultValue="Value"
-   startAdornment={<AdornmentButton>Test</AdornmentButton>}
-   data-testid="test-id-3"
- />
+ <Input
+   disabled
+   defaultValue="Value"
+   startAdornment={<Button disabled>Test</Button>}
+   data-testid="test-id-3"
+ />
```

**Note:** You will need to pass `disabled` to the `Button` component if the `Input` is disabled.
