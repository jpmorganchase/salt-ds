---
"@salt-ds/theme": patch
---

Updated the status background selected tokens in the legacy theme:

- In light mode, background selected tokens have moved from their respective 20 colors to 30 to improve the visual distinction between default and selected states.
  - For example: `--salt-palette-error-background-selected` went from `--salt-color-red-20` to `--salt-color-red-30`.
- In dark mode, background selected tokens have moved from their respective 900 color to 800 to provide a visual distinction between default and selected states. Except for warning which went from 900 to 875.
  - For example: `--salt-palette-error-background-selected` went from `--salt-color-red-900` to `--salt-color-red-800`.
