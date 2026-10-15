---
"@salt-ds/theme": minor
"@salt-ds/core": patch
---

Added `--salt-text-code-fontWeight` to all themes, to match the code text style in Figma. It's a regular weight in every theme.

`Code`, `Text` and `styleAs="code"` now use it. Code text has a single weight, so the `fontWeight` prop and nested `<b>` and `<strong>` elements no longer change its weight. Previously they used the body text weights, which made the browser draw a synthetic bold because PT Mono only has a regular weight.
