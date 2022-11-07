---
"@jpmorganchase/uitk-core": minor
"@jpmorganchase/uitk-icons": minor
"@jpmorganchase/uitk-lab": minor
"@jpmorganchase/uitk-theme": minor
---

Updated the `<Icon />` component.

- It now only accepts SVG elements as children and should be used as follows:

```jsx
<Icon aria-label="add" viewBox="0 0 12 12" size={1}>
  <path d="M7 0H5v5H0v2h5v5h2V7h5V5H7V0z" />
</Icon>
```

- Wrapping span elements have been removed so the root element is the `<svg>` itself. The Icon ref is now type `SVGSVGElement` instead of a `<span>`.

- The size prop has been updated to be a number which is a multiplier of the base value instead of a named size as follows:

```jsx
<AddIcon size="small" />
<AddIcon size="medium" />
<AddIcon size="large" />
```

becomes

```jsx
<AddIcon size={1} />
<AddIcon size={2} />
<AddIcon size={3} />
```

- The size of the Icon will now scale with density.
- **Note:** Previously Icon could be set to a specific size by passing a number to the `size` prop. This has been removed so Icons will scale with the rest of the design system. You can still set a specific size using the css variable `--icon-size` but it is not recommended as your component won't scale with density.
- Built in Icon components e.g. `<AddIcon />` have been regenerated to use the new Icon component so their html and API have changed accordingly.
- UITK components which had Icon or a built-in Icon as a dependancy have also been updated.
- A new size css variable `--uitk-size-icon-base` has been added to the theme for each density.
