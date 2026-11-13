# @salt-ds/window

## 0.1.3

### Patch Changes

- e1e38ea: Packages are now built with tsdown and their type declarations are generated with TypeScript 7. Entry points, export maps and existing deep import paths are unchanged. The compiled output now includes shared compiler helper modules under `_virtual/`.

## 0.1.2

### Patch Changes

- 2a5cb0d: Refined the context typing so the default window value is correctly represented as `Window | null`.

## 0.1.1

### Patch Changes

- abfc4364: Corrected the minimum supported version of React. It has been updated to 16.14.0 due to the support for the new [JSX transform](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)

## 0.1.0

### Minor Changes

- d78ff537: Added @salt-ds/styles and @salt-ds/window packages

  These packages are introduced to support uses of Salt in a desktop application where pop-out elements such as tooltips are rendered into separate windows with no previously added CSS.

  The insertion point where useComponentCssInjection inserts styles can be controlled via InsertionPointContext
