import {
  colorSchemeVariable,
  createPart,
  createTheme,
  iconOverrides,
  iconSetMaterial,
} from "ag-grid-community";

const saltIconOverrides = iconOverrides({
  type: "image",
  mask: true,
  // This uses `mask-image` CSS, need to check browser compatiblity problem, https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image#browser_compatibility
  icons: {
    filter: {
      svg: `<svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" >
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.49988 7L11.9999 0H-0.00012207L4.49988 7V12H7.49988V7ZM6.49988 11V6.7063L10.1682 1H1.83154L5.49988 6.7063V11H6.49988Z" />
</svg>
`,
    },
  },
});

const saltCheckboxStyle = createPart({
  // By setting the feature, adding this part to a theme will remove the
  // theme's existing checkboxStyle, if any
  feature: "checkboxStyle",
  params: {
    // Names will be converted to kebab-case CSS variables, which can be used in custom CSS block below
    // https://www.ag-grid.com/react-data-grid/theming-widgets/#styling-checkboxes
    checkboxUncheckedBackgroundColor: "yellow",
    checkboxUncheckedBorderColor: "darkred",
    checkboxCheckedBackgroundColor: "red",
    checkboxCheckedBorderColor: "darkred",
    checkboxCheckedShapeColor: "yellow",
    checkboxCheckedShapeImage: {
      svg: "<svg>... svg source code...</svg>",
    },
    checkboxIndeterminateBorderColor: "darkred",
  },
  // Add some CSS to this part.
  // If your application is bundled with Vite you can put this in a separate
  // file and import it with `import checkboxCSS from "./checkbox.css?inline"`
  css: `
      .ag-checkbox-input-wrapper {
        background-color: var(--ag-checkbox-unchecked-background-color);
      }`,
});

export const saltTheme = createTheme()
  .withPart(saltIconOverrides)
  .withPart(saltCheckboxStyle)
  .withPart(colorSchemeVariable)
  .withParams({
    rowHeight: "calc(var(--salt-size-base) + var(--salt-spacing-100))",
    // TODO: Secondary variant
    backgroundColor: "var(--salt-container-primary-background)",
    // TODO: Zebra
    oddRowBackgroundColor: "var(--salt-container-primary-background)",
    fontFamily: "var(--salt-text-fontFamily)",
  });
