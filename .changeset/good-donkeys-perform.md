---
"@salt-ds/core": minor
"@salt-ds/lab": minor
"@salt-ds/theme": minor
---

- New characteristics introduced in `accent`, new palette token

```diff
+ --salt-accent-background-disabled: var(--salt-palette-accent-background-disabled);
+ --salt-palette-accent-background-disabled
```

- New characteristics introduced in `selectable`, new palette tokens

```diff
+ --salt-selectable-foreground: var(--salt-palette-interact-foreground);
+ --salt-selectable-foreground-disabled: var(--salt-palette-interact-foreground-disabled);
+ --salt-selectable-foreground-hover: var(--salt-palette-interact-foreground-hover);
+ --salt-selectable-foreground-selected: var(--salt-palette-interact-foreground-active);
+ --salt-selectable-foreground-selectedDisabled: var(--salt-palette-interact-foreground-activeDisabled);
+ --salt-palette-interact-foreground-active
+ --salt-palette-interact-foreground-activeDisabled
+ --salt-palette-interact-foreground-hover
```

Updated values in light mode

```diff
- --salt-palette-interact-foreground: var(--salt-color-gray-900);
+ --salt-palette-interact-foreground: var(--salt-color-gray-200);
- --salt-palette-interact-foreground-disabled: var(--salt-color-gray-900-fade-foreground);
+ --salt-palette-interact-foreground-disabled: var(--salt-color-gray-200-fade-foreground);
```

Updated values in light mode

```diff
- --salt-palette-interact-foreground: var(--salt-color-white);
+ --salt-palette-interact-foreground: var(--salt-color-gray-90);
- --salt-palette-interact-foreground-disabled: var(--salt-color-white-fade-foreground);
+ --salt-palette-interact-foreground-disabled: var(--salt-color-gray-90-fade-foreground);
```

- Deprecated the following `selectable` tokens, use `--salt-text-primary-foreground` and `--salt-text-primary-foreground-disabled` as replacements

```diff
- --salt-selectable-cta-foreground
- --salt-selectable-cta-foreground-disabled
- --salt-selectable-primary-foreground
- --salt-selectable-primary-foreground-disabled
- --salt-selectable-secondary-foreground
- --salt-selectable-secondary-foreground-disabled
- --salt-selectable-foreground-partial
- --salt-selectable-foreground-partialDisabled
```

- `Measured` characteristic replaced with `Track`

Deprecated tokens prefixed by `--salt-measured-` and corresponding palette tokens
New `--salt-track-` tokens and corresponding palette tokens

The following are a direct replacement mapping:

```diff
- --salt-measured-borderStyle
- --salt-measured-borderStyle-active
- --salt-measured-borderStyle-complete
- --salt-measured-borderStyle-incomplete
+ --salt-track-borderStyle
+ --salt-track-borderStyle-active
+ --salt-track-borderStyle-complete
+ --salt-track-borderStyle-incomplete
- --salt-measured-borderWidth
- --salt-measured-borderWidth-active
- --salt-measured-borderWidth-complete
- --salt-measured-borderWidth-incomplete
+ --salt-track-borderWidth
+ --salt-track-borderWidth-active
+ --salt-track-borderWidth-complete
+ --salt-track-borderWidth-incomplete
- --salt-measured-fontWeight
- --salt-measured-textAlign
+ --salt-track-fontWeight
+ --salt-track-textAlign
- --salt-measured-background: var(--salt-palette-measured-background);
- --salt-measured-background-disabled: var(--salt-palette-measured-background-disabled);
- --salt-measured-borderColor: var(--salt-palette-measured-border);
+ --salt-track-background: var(--salt-palette-track-background);
+ --salt-track-background-disabled: var(--salt-palette-track-background-disabled);
+ --salt-track-borderColor: var(--salt-palette-track-border);
+ --salt-track-borderColor-disabled: var(--salt-palette-track-border-disabled);
- --salt-palette-measured-background
- --salt-palette-measured-background-disabled
- --salt-palette-measured-border
- --salt-palette-measured-border-disabled
+ --salt-palette-track-background
+ --salt-palette-track-background-disabled
+ --salt-palette-track-border
+ --salt-palette-track-border-disabled
```

The following should be replaced with the corresponding `selectable` tokens:

```diff
- --salt-measured-foreground: var(--salt-palette-measured-foreground);
- --salt-measured-foreground-disabled: var(--salt-palette-measured-foreground-disabled);
- --salt-measured-foreground-hover: var(--salt-palette-measured-foreground-active);
- --salt-measured-foreground-active: var(--salt-palette-measured-foreground-active);
- --salt-measured-foreground-activeDisabled: var(--salt-palette-measured-foreground-activeDisabled);
- --salt-measured-borderColor-disabled: var(--salt-palette-measured-border-disabled);
```

The following should be replaced with the corresponding `accent` background tokens:

```diff
- --salt-measured-fill: var(--salt-palette-measured-fill);
- --salt-measured-fill-disabled: var(--salt-palette-measured-fill-disabled);
```

- Usages of `measured` tokens in core and labs components updated to use appropriate characteristic replacement

- Deprecated the following tokens, no replacement needed:

```diff
- --salt-measured-foreground-undo
- --salt-palette-measured-fill
- --salt-palette-measured-fill-disabled
- --salt-palette-measured-foreground-active
- --salt-palette-measured-foreground-activeDisabled
- --salt-palette-interact-foreground-partial
- --salt-palette-interact-foreground-partialDisabled
```
