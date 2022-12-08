# @jpmorganchase/uitk-ag-grid-theme

## 0.3.0

### Minor Changes

- 248c6a2b: Add Odyssey AG Grid Theme
- e7530f8b: **BREAKING CHANGE:**

  uitk-sans has been removed. The default font family is now Open Sans.
  Fonts are no longer bundled with the components.

  You may add it to your project with a npm package e.g. [Fontsource](https://fontsource.org/), or with the [Google Fonts CDN](https://fonts.google.com/).

  For example, using fontsource:

  ```js
  import "@fontsource/open-sans/300.css";
  import "@fontsource/open-sans/300-italic.css";
  import "@fontsource/open-sans/400.css";
  import "@fontsource/open-sans/400-italic.css";
  import "@fontsource/open-sans/500.css";
  import "@fontsource/open-sans/500-italic.css";
  import "@fontsource/open-sans/600.css";
  import "@fontsource/open-sans/600-italic.css";
  import "@fontsource/open-sans/700.css";
  import "@fontsource/open-sans/700-italic.css";
  import "@fontsource/open-sans/800.css";
  import "@fontsource/open-sans/800-italic.css";
  ```

- 8c075106: Use American English 'gray' throughout code

### Patch Changes

- 822db3f0: Fix duplicate font declaration in ag-grid-theme

## 0.2.1

### Patch Changes

- 1f2fc236: Remove import directly from `src` so consumers won't encounter
  TS error if `skipLibCheck` is set to false.

## 0.2.0

### Minor Changes

- dd8c7646: Add global css box-sizing as border-box, and remove from components

## 0.1.1

### Patch Changes

- 05f3d98d: Ag grid theme
