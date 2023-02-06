---
"@salt-ds/lab": patch
---

Refactor Tooltip to wrap around trigger
Remove `render` and `title` props, replaced by `content` prop
Use '@floating-ui/react' instead of '@floating-ui/react-dom-interactions', as it's deprecated
Remove TooltipContext
