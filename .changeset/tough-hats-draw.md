---
"@salt-ds/core": patch
---

Refactor internal implementation of button styles

- this is a non-breaking refactor of how we organise the styles within the CSS file.
- removes un-supported/un-documented vars prefixed `--saltButton`

```
--saltButton-alignItems
--saltButton-background
--saltButton-background-active
--saltButton-background-active-hover
--saltButton-background-disabled
--saltButton-background-hover
--saltButton-borderColor
--saltButton-borderColor-active
--saltButton-borderColor-disabled
--saltButton-borderColor-hover
--saltButton-borderRadius
--saltButton-borderStyle
--saltButton-borderWidth
--saltButton-cursor
--saltButton-cursor-disabled
--saltButton-fontFamily
--saltButton-fontSize
--saltButton-fontWeight
--saltButton-height
--saltButton-justifyContent
--saltButton-letterSpacing
--saltButton-lineHeight
--saltButton-margin
--saltButton-minWidth
--saltButton-padding
--saltButton-text-color
--saltButton-text-color-active
--saltButton-text-color-active-hover
--saltButton-text-color-disabled
--saltButton-text-color-hover
--saltButton-textAlign
--saltButton-textTransform
--saltButton-width
```

if using these vars then use the equivalent `button` prefix vars, that map to CSS attributes.

```diff
- --saltButton-background
+ --button-background
```

- switched approach to a minimal set of base styles that consistently apply CSS variables, making the style easier to read and maintain
- updated core/stable references to `--saltButton` to `--button` in `Button`, `Input`, `MultilineInput`, `NavigationItem`, `Pagination`, `Pill`
