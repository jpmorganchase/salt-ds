# @salt-ds/styles

## 0.2.1

### Patch Changes

- f7fcbd11: Fixed issue where components are not injecting their styles.

## 0.2.0

### Minor Changes

- 02815995: Updated `useComponentCssInjection` to not inject styles when configured by the SaltProvider.

## 0.1.2

### Patch Changes

- 45eaeeb5: Fix `useInsertionEffect` not found error bundled by Webpack

## 0.1.1

### Patch Changes

- abfc4364: Corrected the minimum supported version of React. It has been updated to 16.14.0 due to the support for the new [JSX transform](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)

## 0.1.0

### Minor Changes

- d78ff537: Added @salt-ds/styles and @salt-ds/window packages

  These packages are introduced to support uses of Salt in a desktop application where pop-out elements such as tooltips are rendered into separate windows with no previously added CSS.

  The insertion point where useComponentCssInjection inserts styles can be controlled via InsertionPointContext
