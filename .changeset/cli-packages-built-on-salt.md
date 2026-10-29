---
"@salt-ds/cli": minor
---

`salt-ds init` and `salt-ds check` also read packages built on Salt, such as pattern packages, that the application depends on directly and that declare agent docs in their `package.json` with `"salt": { "agentDocs": "docs" }`. Their pages are indexed after Salt's, and `salt-ds check` checks their components' props and parts and adds their design tokens.
