---
"@salt-ds/core": patch
"@salt-ds/embla-carousel": patch
"@salt-ds/styles": patch
---

Fixed references to undeclared dependencies, which could fail to resolve under strict package managers such as Yarn PnP, or pnpm with hoisting disabled.

- `@salt-ds/styles` now depends on `clsx`.
- `@salt-ds/embla-carousel` now depends on `@salt-ds/styles` and `@salt-ds/window`, and takes Embla's types from `embla-carousel-react` instead of importing the undeclared `embla-carousel`, so `embla-carousel` no longer needs to be installed for its types.
- `@salt-ds/core` types now only reference `@floating-ui/react`, instead of its transitive dependencies `@floating-ui/core`, `@floating-ui/dom`, `@floating-ui/react-dom` and `@floating-ui/utils`. `margin` takes its `Middleware` type from `@floating-ui/react`, `useTooltip` has an explicit return type, and `DEFAULT_FLOATING_UI_MIDDLEWARE` is typed as `Middleware[]`.
