---
"@salt-ds/lab": patch
"@salt-ds/date-components": patch
---

Date components and related utilities have been extracted into a new package: `@salt-ds/date-components`. This package is intended to be the long-term home for these components.

To avoid a breaking change while the date components remain in release-candidate status, `@salt-ds/lab` continues to re-export the same APIs for now. Importing these APIs from `@salt-ds/lab` will emit a deprecation warning in development.

New code should import directly from `@salt-ds/date-components`. Once `@salt-ds/date-components` is marked stable, the date component exports will be removed from `@salt-ds/lab`.

In addition, `DatePickerSinglePanel` which was previously deprecated in favour of `DatePickerSingleGridPanel` has now been removed. Consumers should update to use `DatePickerSingleGridPanel` from `@salt-ds/date-components` if they have not already done so.

```diff
- import { DatePickerSinglePanel } from "@salt-ds/lab";
+ import { DatePickerSingleGridPanel } from "@salt-ds/date-components";
```

### DatePicker `enableApply` prop deprecation

The automatic detection of `DatePickerActions` to infer the `enableApply` prop is now deprecated. When using a modal `DatePicker` with confirmation controls, you must explicitly set `enableApply={true}` on the `DatePicker` component.

A deprecation warning will be emitted in development mode if `DatePickerActions` is detected and `enableApply` is not explicitly provided.

**Migration:**

Update your DatePicker usage to explicitly set `enableApply`:

```diff
  <DatePicker
    selectionVariant="single"
+   enableApply={true}
    onApply={handleApply}
    onCancel={handleCancel}
  >
    <DatePickerTrigger>
      <DatePickerSingleInput />
    </DatePickerTrigger>
    <DatePickerOverlay>
      <DatePickerSingleGridPanel />
      <DatePickerActions selectionVariant="single" />
    </DatePickerOverlay>
  </DatePicker>
```

The automatic detection will be removed in a future version.

### DatePickerRangePanel navigation fix

Fixed an issue where the end calendar's Next button was incorrectly disabled near `minDate`. The `isEndNextDisabled` guard was comparing against `minDate` plus one month instead of `maxDate`, which meant the Next button could be disabled even when valid later months were available.
