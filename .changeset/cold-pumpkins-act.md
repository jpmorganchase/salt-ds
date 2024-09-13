---
"@salt-ds/lab": patch
---

# Refactoring the `DatePicker` Component

The `DatePicker` component has been refactored to provide a more flexible and composable API. The updated approach allows developers to compose their own calendar patterns by combining provided components with their own or replacing the provided components entirely. This refactor also introduces new features such as locale and time zone support, custom parsers, and conditional types.

## Before

```tsx
// Original DatePicker component
<DatePicker style={{ width: "200px" }} />
```

## After

```tsx
// New DatePicker component
<DatePicker
  selectionVariant="single"
  onSelectedDateChange={(newSelectedDate) =>
    console.log(`Selected date: ${formatDate(newSelectedDate)}`)
  }
>
  <DatePickerSingleInput />
  <DatePickerOverlay>
    <DatePickerSinglePanel />
  </DatePickerOverlay>
</DatePicker>
```

## Reasons for Change

- **Flexibility**: The new composable API allows developers to swap out the input component and compose their own panels, providing greater flexibility.
- **Simplified API**: The new design reduces the complexity of the API, making it easier to use and customize.
- **Customization**: Developers can now combine provided components with their own or replace the provided components entirely.
- **Future-Proofing**: The new design is more adaptable to future changes and customizations.

## Additional New Features

- **Locale and Time Zone Support**: Experimental support for locale and time zones, demonstrated in a time-based Storybook example.
- **Custom Parsers**: Ability to provide custom parsers to parse custom date formats from the `DateInput`.
- **Conditional Types**: Simplified use of the `selectionVariant` prop through conditional types.
- **New Components**: Introduction of `DateInput`, `DateInputRange`, `DatePickerSingleInput`, `DatePickerRangeInput`, `DatePickerSinglePanel`, and `DatePickerRangePanel`.
- **DatePickerOverlay**: A wrapper for the `DatePicker`'s calendar, enabling custom panel composition with the calendar component.

## Experimental Time Support (Not For Production Use)

- To ensure the DatePicker can support DateTime, locales and timezones, we have created an experimental Storybook example that supports time entry.
