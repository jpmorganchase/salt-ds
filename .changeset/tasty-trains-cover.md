---
"@salt-ds/ag-grid-theme": major
---

Ag grid theme is updated to support ag grid version v31, and it's now driven by [AG grid variables](https://ag-grid.com/react-data-grid/global-style-customisation/) with a big reduction in bundle size. Follow below for upgrade instructions:

1. Update stylesheet import

```diff
- import "ag-grid-community/dist/styles/ag-grid.css";
+ import "ag-grid-community/styles/ag-grid.css";
```

UITK theme is removed, migrate to Salt theme

```diff
- import "@salt-ds/ag-grid-theme/uitk-ag-theme.css";
+ import "@salt-ds/ag-grid-theme/salt-ag-theme.css";
```

2. Update classnames used on the container around `AgGridReact`, which no longer has density portion. If you previously copied `useAgGridHelpers`, you'll need to copy a new version from [here](https://github.com/jpmorganchase/salt-ds/blob/main/site/src/examples/ag-grid-theme/useAgGridHelpers.ts).

In light mode:

```diff
- .ag-theme-salt-high-light
- .ag-theme-salt-medium-light
- .ag-theme-salt-low-light
- .ag-theme-salt-touch-light
+ .ag-theme-salt-light
```

```diff
- .ag-theme-salt-high-compact-light
+ .ag-theme-salt-compact-light
```

In dark mode:

```diff
- .ag-theme-salt-high-dark
- .ag-theme-salt-medium-dark
- .ag-theme-salt-low-dark
- .ag-theme-salt-touch-dark
+ .ag-theme-salt-dark
```

```diff
- .ag-theme-salt-high-compact-dark
+ .ag-theme-salt-compact-dark
```

Closes #2972
