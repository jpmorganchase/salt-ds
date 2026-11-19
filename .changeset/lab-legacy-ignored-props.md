---
"@salt-ds/lab": patch
---

Fixed props that lab components ignored, replaced with their own, or put on the wrong element.

- Removed props that never had an effect from the types of `ButtonBar` (`stackAtBreakpoint`, `sortStackOrder`), `CascadingMenu` (HTML attributes other than `className`), `ComboBoxDeprecated` (`overscanCount`, `disabledPortal`), `ContactAvatar`, `ContactDetails`, `ContactFavoriteToggle`, `ContactPrimaryInfo` and `ContactSecondaryInfo`, `DropdownButton` (`isOpen`, `posInSet`, `setSize`), `EditableLabel` (`defaultIsEditing`), `FormField` (`labelId`, `helperTextId`, `renderHelperText`), `FormLabel` (`readOnly`), `InputLegacy` (`value`, `defaultValue`, `disabled` and `readOnly` in `inputProps`), `List` (`itemCount`), `OrderedButton` (`stackOrder`), `Tab`, `TabPanel` (`role`, `tabIndex`), `Tabs` (`source`), `TokenizedInput` (the tooltip props), `Toolbar` (`TooltipComponent`), `ToolbarButton` (`overflowLabel`), `Tooltray` (`collapsible`, `disabled`), `VirtualizedList` and `Window` (`open`).
- `AppHeader`, `Tabstrip` (`title`) and `Tooltray` (`aria-label`) apply the props they dropped. `Tab`, `ContactActions`, `ContactMetadataItem` and `ToolbarButton` apply `className`, and `ListItem` applies `tabIndex`. `ContactPrimaryInfo` merges `aria-labelledby` with its own IDs.
- `Tabs` passes `orientation`, `keyBoardActivation`, `promptForNewTabName` and `showActivationIndicator` to its tab strip, and uses `id` as the base of its IDs.
- `ComboBox` respects `fullWidth` and `openOnFocus`.
- `List`, `VirtualizedList`, `ListItemNext`, `LayerLayout`, `QueryInput`, `Tabstrip` and `InputLegacy` call your event handlers as well as their own. `LayerLayout` keeps its own classes when `scrimProps.className` is set.
- `List` and `VirtualizedList` show `emptyMessage`, `VirtualizedList` applies `itemTextHighlightPattern`, and `MailLinkComponent` applies its props when the value isn't an email address.
- `FormField` no longer passes `readOnly` to a custom `LabelComponent`. It can read it from `useFormFieldLegacyProps().a11yProps.readOnly`.
- Deprecated `ListItemProxy` and `TabActivationIndicator`, which are internal.
