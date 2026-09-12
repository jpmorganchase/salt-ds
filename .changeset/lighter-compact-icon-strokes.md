---
"@salt-ds/theme": patch
---

Reduced `--salt-size-icon-strokeWidth` from `1.5` to `1.333333` in high and medium densities. At the default 12px icon size, the primary stroke now renders at approximately 1 CSS pixel, opening space between details while keeping lines visible. Low, touch and mobile densities retain their existing width of `1`. Numeric SVG masters, CSS masks and filled contours are unchanged.
