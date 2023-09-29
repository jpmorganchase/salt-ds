---
"@salt-ds/core": minor
---

## Added desktop support for Tooltips

Advanced Desktop support can now be achieved for floating components such as `<Tooltip>`, `<Dropdown>` and `<Combobox>` by passing a [Floating UI Platform](https://floating-ui.com/docs/platform) via a new `<FloatingPlatformProvider>` component.

This enables advanced use-cases e.g. on multi-window desktop applications for example where you may want to render a `Tooltip` in an external window, and position it relative to a global coordinate space such as a user's desktop.

To support this use-case you can also pass a component to be used as the root for floating components such as `<Tooltip>`, overriding the default. This is done using the `<FloatingComponentProvider>`. The component used as the FloatingComponent will receive the Floating UI props used for positioning, as well as `open`, so you can hook into the Tooltip
s lifecycle e.g. to activate external windows.
