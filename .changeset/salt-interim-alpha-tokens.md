---
"@salt-ds/theme": minor
---

Updated the alpha palette tokens in the experimental Salt (Interim) theme to use theme neutrals instead of black.

- In light mode, `--salt-palette-alpha-contrast-*` and `--salt-palette-alpha-dark-*` now use `--salt-color-dove-900-*a`.
- In dark mode, `--salt-palette-alpha-*` and `--salt-palette-alpha-dark-*` now use `--salt-color-gray-900-*a`.

Removed the following unused alpha foundation tokens from the Salt (Interim) theme:

- `--salt-color-black-0a`, `--salt-color-black-5a`, `--salt-color-black-10a`, `--salt-color-black-15a`, `--salt-color-black-20a`, `--salt-color-black-30a`, `--salt-color-black-50a`, `--salt-color-black-65a` and `--salt-color-black-80a`. Apart from `-0a`, these are still available from the base foundations.
- `--salt-color-white-0a`
- `--salt-color-gray-300-10a`, `--salt-color-gray-600-40a`, `--salt-color-gray-700-10a` and `--salt-color-gray-700-40a`
- `--salt-color-blue-200-40a` to `--salt-color-blue-800-40a`
- `--salt-color-teal-200-40a` to `--salt-color-teal-800-40a`
- `--salt-color-green-400-40a`, `--salt-color-green-500-40a` and `--salt-color-green-600-40a`
- `--salt-color-orange-400-40a`, `--salt-color-orange-500-40a` and `--salt-color-orange-600-40a`
- `--salt-color-red-400-40a`, `--salt-color-red-500-40a` and `--salt-color-red-600-40a`
- `--salt-color-background-granite-40a`, `--salt-color-background-jet-40a`, `--salt-color-background-leather-40a`, `--salt-color-background-limestone-40a`, `--salt-color-background-marble-40a` and `--salt-color-background-snow-40a`
- `--salt-color-topaz-200-40a`, `--salt-color-topaz-500-0a`, `--salt-color-topaz-500-40a` and `--salt-color-topaz-800-40a`
