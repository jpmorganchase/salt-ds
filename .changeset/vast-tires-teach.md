---
"@salt-ds/theme": patch
---

Fixed the neutral palette so that it's aligned with the other palette token sets.

```diff
.salt-theme.salt-theme-next[data-mode="light"]
-  --salt-palette-neutral-weaker: var(--salt-color-gray-300);
-  --salt-palette-neutral-weakest: var(--salt-color-gray-200);
+  --salt-palette-neutral-weaker: var(--salt-color-gray-200);
+  --salt-palette-neutral-weakest: var(--salt-color-gray-100);

}

.salt-theme.salt-theme-next[data-mode="dark"]
-  --salt-palette-neutral-weaker: var(--salt-color-gray-700);
-  --salt-palette-neutral-weakest: var(--salt-color-gray-800);
+  --salt-palette-neutral-weaker: var(--salt-color-gray-800);
+  --salt-palette-neutral-weakest: var(--salt-color-gray-900);
}
```
