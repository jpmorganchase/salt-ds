---
"@salt-ds/lab": patch
---

Refactor Tooltip to wrap around trigger. This is to simplify the use of Tooltip by not having to use to useTooltip hook to pass the props.
Remove `render` and `title` props, replaced by `content` prop.
Use '@floating-ui/react' instead of '@floating-ui/react-dom-interactions', as it's deprecated.
Remove unused TooltipContext
