# @salt-ds/styles

## 0.4.2

### Patch Changes

- 4f1b504: Fixed references to undeclared dependencies, which could fail to resolve under strict package managers such as Yarn PnP, or pnpm with hoisting disabled.

  - `@salt-ds/styles` now depends on `clsx`.
  - `@salt-ds/embla-carousel` now depends on `@salt-ds/styles` and `@salt-ds/window`, and takes Embla's types from `embla-carousel-react` instead of importing the undeclared `embla-carousel`, so `embla-carousel` no longer needs to be installed for its types.
  - `@salt-ds/core` types now only reference `@floating-ui/react`, instead of its transitive dependencies `@floating-ui/core`, `@floating-ui/dom`, `@floating-ui/react-dom` and `@floating-ui/utils`. `margin` takes its `Middleware` type from `@floating-ui/react`, `useTooltip` has an explicit return type, and `DEFAULT_FLOATING_UI_MIDDLEWARE` is typed as `Middleware[]`.

## 0.4.1

### Patch Changes

- fbe1e48: Fixed `ClassNameInjectionProvider` stripping registered props from components that do not opt into an extension.

  Previously, every key registered via `registerClassInjector` was removed from the props of all matching components under the provider, even when the injector returned `undefined` for that instance. This meant an unrelated component (for example a standard `Button`) rendered under the provider could silently lose props such as `sentiment` or `appearance`. Now a key is only withheld when its injector actually returns a class for the current props, so components that the injector opts out of keep their props (and styling) intact.

## 0.4.0

### Minor Changes

- 7a828e4: Added `CSPProvider` and nonce support for dynamically injected style tags.

### Patch Changes

- fc112cb: Improved component CSS injection to avoid redundant duplicate style writes, respond to style injection and insertion point changes, and clean up injected style state more defensively.

## 0.3.0

### Minor Changes

- 27c4338: This feature is in-development, for exploration and feedback only.

  Introduce a context‑driven API for injecting CSS class names into Salt components based on their props, and optionally stripping implementation‑only props before forwarding.

  _Status_
  Non‑breaking for existing Salt consumers
  Experimental and incomplete — interfaces and behavior may change without notice

  **Note to JPM employees**
  Use only in non‑production codebases, or with prior permission from the Salt engineering team
  What’s included

  - `ClassNameInjectionProvider` — supplies a registry of class injectors via React context
  - `useClassNameInjection(component, props)`
    - computes additional classes via registered injectors
    - merges them with any className provided at the call site
    - removes internal/derived props (declared by each injector) before forwarding
  - `registerClassInjector(registry, component, keys, injector)` — registers per‑component injection rules

  _Documentation_
  Full documentation will follow once the API is stabilized; for now, consider this API private and subject to change.

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
