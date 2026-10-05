---
"@salt-ds/core": patch
"@salt-ds/embla-carousel": patch
"@salt-ds/styles": patch
---

Fixed references to undeclared dependencies, which could fail to resolve under strict package managers such as Yarn PnP, or pnpm with hoisting disabled.

- `@salt-ds/styles` now depends on `clsx`.
- `@salt-ds/embla-carousel` now depends on `@salt-ds/styles` and `@salt-ds/window`, and takes Embla's types from `embla-carousel-react` instead of importing the undeclared `embla-carousel`.
- `@salt-ds/core` now depends on `@floating-ui/core`, `@floating-ui/react-dom` and `@floating-ui/utils`, which its types reference, and the type of `DEFAULT_FLOATING_UI_MIDDLEWARE` no longer references `@floating-ui/dom`.
