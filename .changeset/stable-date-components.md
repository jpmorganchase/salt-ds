---
"@salt-ds/date-components": major
---

`@salt-ds/date-components` is now stable.

**Breaking change:** the React `Context` objects backing the date components are no longer part of the public API of `@salt-ds/date-components`. The following symbols have been removed from the package entry point:

- `LocalizationProviderContext` (the context value; the type alias of the same name remains exported)
- `SingleDateSelectionContext`
- `DateRangeSelectionContext`

Consumers should read context state through the provided hooks and configure providers through the exported `Provider` components instead:

- Use `useLocalization()` with `<LocalizationProvider>` in place of `LocalizationProviderContext`.
- Use `useDatePickerContext({ selectionVariant })` with `<DatePicker>` in place of `SingleDateSelectionContext` / `DateRangeSelectionContext`.

The value types (`LocalizationProviderValue`, `SingleDatePickerState`, `RangeDatePickerState`, `DatePickerState`) remain exported for typing.
