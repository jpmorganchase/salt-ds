# @salt-ds/date-components

## 1.1.0

### Minor Changes

- 87a8a85: - Added a top-level `name` prop to `DateInputSingle`.
  - Added `startName` and `endName` to `DateInputRange` which map to the underlying native inputs.

### Patch Changes

- 5663ad4: Updated the `@floating-ui/react` dependency to align the Date Components package with the Floating UI contract used by its overlays. This fixes Date Picker calendar positioning and outside-press dismissal behavior while keeping the root-level resolution available for Mosaic.
- Updated dependencies [8aaa8d0]
- Updated dependencies [fc112cb]
- Updated dependencies [8aaa8d0]
- Updated dependencies [7a828e4]
- Updated dependencies [87a8a85]
- Updated dependencies [8156149]
  - @salt-ds/core@1.68.0
  - @salt-ds/styles@0.4.0
  - @salt-ds/icons@1.18.2

## 1.0.0

### Major Changes

- 8687aa7: `@salt-ds/date-components` is now stable.

  **Breaking change:** the React `Context` objects backing the date components are no longer part of the public API of `@salt-ds/date-components`. The following symbols have been removed from the package entry point:

  - `LocalizationProviderContext` (the context value; the type alias of the same name remains exported)
  - `SingleDateSelectionContext`
  - `DateRangeSelectionContext`

  Consumers should read context state through the provided hooks and configure providers through the exported `Provider` components instead:

  - Use `useLocalization()` with `<LocalizationProvider>` in place of `LocalizationProviderContext`.
  - Use `useDatePickerContext({ selectionVariant })` with `<DatePicker>` in place of `SingleDateSelectionContext` / `DateRangeSelectionContext`.

  The value types (`LocalizationProviderValue`, `SingleDatePickerState`, `RangeDatePickerState`, `DatePickerState`) remain exported for typing.

### Patch Changes

- Updated dependencies [9729a10]
- Updated dependencies [52daa64]
- Updated dependencies [ed2779c]
- Updated dependencies [07e4d5d]
- Updated dependencies [8687aa7]
  - @salt-ds/core@1.64.0
  - @salt-ds/date-adapters@1.0.0

## 0.1.0

### Minor Changes

- 5d4de6f: Date components and related utilities have been extracted into a new package: `@salt-ds/date-components`. This package is intended to be the long-term home for these components.

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

  ### DatePickerActions label fix

  Fixed an issue where action button labels (Apply/Cancel) were missing context when `selectedDate` was `undefined` (e.g. an untouched uncontrolled picker). The guard now checks for both `null` and `undefined`. Additionally, partial range selections now show explicit wording (`"no start date"` / `"no end date"`) instead of blank labels.

- 5d4de6f: ## New package: `@salt-ds/date-components`

  A new package, `@salt-ds/date-components`, has been introduced as the long-term home for shared date-related components and utilities (for example `Calendar`, `CalendarNavigation`, and `DateInput`).

  To avoid a breaking change while these components remain in release-candidate status, `@salt-ds/lab` continues to re-export the same APIs for now and will emit a deprecation warning in development. New code should import directly from `@salt-ds/date-components`.

  ## Calendar

  - Fixed styling issues with the selected range border.
  - Fixed Calendar dropdown spacing that caused an ellipsis to appear at mobile breakpoints.
  - Improved screen reader support.
  - Type improvements:
    - Removed unused code/types and simplified selection type structures.
    - Simplified adapter generics; consumers typically no longer need to provide generics unless implementing a custom date adapter.
  - Calendar now provides default screen reader announcements.
  - Custom live announcements can be configured via the `createAnnouncement` factory.

  ```tsx
  import { Calendar } from "@salt-ds/date-components";
  import type { CreateAnnouncement } from "@salt-ds/date-components";

  const customCreateAnnouncement: CreateAnnouncement<DateFrameworkType> = (
    announcementType,
    state,
    dateAdapter,
  ) => {
    switch (announcementType) {
      case "minFocusableDateExceeded":
        return `Minimum date exceeded ${dateAdapter.format(state.selectedDate)}`;
      case "maxFocusableDateExceeded":
        return `Maximum date exceeded ${dateAdapter.format(state.selectedDate)}`;
      case "dateSelected":
        return `You selected ${dateAdapter.format(state.selectedDate, "longDate")}`;
      case "visibleMonthChanged":
        return `Selected ${dateAdapter.format(state.startVisibleMonth, "monthYear")}`;
      default:
        return undefined;
    }
  };

  <Calendar createAnnouncement={customCreateAnnouncement} timezone="UTC" />;
  ```

  ### `CalendarNavigation` API updates

  - Added `PreviousButtonProps` and `NextButtonProps` to pass props to the navigation buttons. These can be used instead of `onNavigateNext`, `disableNavigateNext`, `onNavigatePrevious`, and `disableNavigatePrevious`.
  - Removed `onMonthSelect` and `onYearSelect`. Use `MonthDropdownProps` and `YearDropdownProps` instead.

  ```diff
  <CalendarNavigation
  -  onMonthSelect={handleMonthSelect}
  +  MonthDropdownProps={{
  +    onChange: handleMonthSelect
  +  }}
  -  onYearSelect={handleYearSelect}
  +  YearDropdownProps={{
  +    onChange: handleYearSelect
  +  }}
  -  onNavigatePrevious={handlePrevious}
  -  disableNavigatePrevious={isPreviousDisabled}
  +  PreviousButtonProps={{
  +    onClick: handlePrevious,
  +    disabled: isPreviousDisabled
  +  }}
  -  onNavigateNext={handleNext}
  -  disableNavigateNext={isNextDisabled}
  +  NextButtonProps={{
  +    onClick: handleNext,
  +    disabled: isNextDisabled
  +  }}
  />
  ```

  - `CalendarNavigation` now adds tooltips to out-of-range dates.
  - When a Calendar has `minDate` or `maxDate` and the user navigates outside that range, it will automatically navigate back to the closest valid month.

  ## DateInput

  - Accessibility improvements for `DateInputSingle` and `DateInputRange`.
  - Day.js timezone improvements for `DateInputSingle` and `DateInputRange`.
  - Added `aria-invalid` to `DateInputSingle` and `DateInputRange` input elements when an error is present.

  ## DatePicker

  - Fixed a bug where a disabled picker could still open by clicking the input
  - Improved screen reader support
  - Fix DatePicker calendar visible month when user enters out of range date in the input and opens the calendar. The calendar will now open to the closest valid month instead of the current month.
  - Fix the error type for `defaultRangeValidator` in `DatePickerRangeInput` (contributed by @VAIBHAVHATISKAR21)

### Patch Changes

- Updated dependencies [5d4de6f]
- Updated dependencies [5d4de6f]
  - @salt-ds/date-adapters@0.1.0-alpha.7
  - @salt-ds/core@1.60.0
