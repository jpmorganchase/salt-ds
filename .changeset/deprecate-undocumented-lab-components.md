---
"@salt-ds/lab": minor
---

Deprecated the lab components that aren't documented on the Salt website, in preparation for removing them in a future release. `AvatarGroup`, `CompactStepper`, `StaticList`, `SystemStatus`, `ToastGroup` and `TokenizedInputNext` aren't affected.

Deprecated components and hooks log a warning in development the first time they're used, and every deprecated export, including types, is marked `@deprecated` so your editor shows which imports to replace. Lab's own components don't warn when they use each other.

Replace the deprecated exports as follows:

- `ComboBox`, `ComboBoxDeprecated`, `Dropdown`, `FormField`, `Input`, `Tabs`, `Tabstrip` and `Toolbar`: use the equivalent components from `@salt-ds/core`. Use `FormFieldLabel` from `@salt-ds/core` instead of `FormLabel`, and the `startAdornment` and `endAdornment` props of `Input` instead of `StaticInputAdornment`.
- `List`, `ListNext` and the deprecated list hooks: use `ListBox` from `@salt-ds/core`.
- `TokenizedInput`: consider `ComboBox` from `@salt-ds/core` with `multiselect` first. If users need to enter their own values, use `TokenizedInputNext`.
- `CascadingMenu`: use `Menu` from `@salt-ds/core`.
- `FormGroup`: use `StackLayout` from `@salt-ds/core`.
- `LayerLayout`: use `Dialog`, `Drawer` or `Overlay` from `@salt-ds/core`.
- `DeckLayout` and `DeckItem`: consider `Carousel` from `@salt-ds/embla-carousel`.
- `Portal`: use `createPortal` from `react-dom`.
- `AppHeader`: follow the [app header pattern](https://www.saltdesignsystem.com/salt/patterns/app-header).
- `ButtonBar`: follow the [button bar pattern](https://www.saltdesignsystem.com/salt/patterns/button-bar).
- `ContactDetails`: follow the [contact details pattern](https://www.saltdesignsystem.com/salt/patterns/contact-details).
- `ContentStatus`: follow the [content status pattern](https://www.saltdesignsystem.com/salt/patterns/content-status).
- `FormattedInput`: follow the [formatted input pattern](https://www.saltdesignsystem.com/salt/patterns/formatted-input).
- `MenuButton`: follow the [menu button pattern](https://www.saltdesignsystem.com/salt/patterns/menu-button).
- `Metric`: follow the [metric pattern](https://www.saltdesignsystem.com/salt/patterns/metric).
- `SearchInput` and `QueryInput`: follow the [search pattern](https://www.saltdesignsystem.com/salt/patterns/search).
- `ColorChooser`, `EditableLabel`, `Logo` and `Window`, and the responsive, collection and overflow hooks and utilities that support these components, such as `useOverflow`, `useResizeObserver`, `useEventCallback` and `useClickOutside`, have no replacement.
