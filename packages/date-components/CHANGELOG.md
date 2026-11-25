# @salt-ds/date-components

## 1.1.5

### Patch Changes

- 2fa23b6: Added descriptions to props that had none, such as the date picker panels' `onSelectionChange` and `CalendarProps`, `LazyCountrySymbol`'s `code`, `WindowProvider`'s `window`, the `children` of providers such as `CSPProvider` and `StyleInjectionProvider`, and the `ref` of components such as `ComboBox`, `Dropdown`, `ListBox`, `Text` and the layout components.
- 2fa23b6: Tidied the formatting of prop descriptions: every description starts with a capital letter and ends with a period, uses American spelling and the multi-line `/** */` layout, and `@default` values are written as they are in code. Removed `@default false` and `@default undefined`, which describe how an unset prop already behaves.
- 2fa23b6: Reworded prop descriptions to follow a consistent pattern: boolean props start with "If `true`, …", callbacks with "Callback fired when …" and props objects with "Props applied to …". Defaults that were only in the description are now `@default` tags, so they show in editors and the props tables. Defaults that come from somewhere else are described in words, such as `SaltProvider`'s theme props inside another `SaltProvider`, `ToggleButton`'s `appearance` and `sentiment` inside a `ToggleButtonGroup`, and `Button`'s `appearance` and `sentiment` when the deprecated `variant` is set.

  Corrected descriptions that didn't match the components:

  - `CheckboxGroup`'s `wrap` described the opposite of what it does.
  - `ListBox`'s `bordered` adds a border when `true`, rather than removing one when `false`.
  - `GridLayout`'s and `BorderLayout`'s `columnGap` and `rowGap` default to the value of `gap`, not to fixed values.
  - `FlexItem`'s `align` follows the parent's alignment when not set, rather than defaulting to `"start"`.
  - `RadioButton`'s `checked` is the checked state of the radio button, not the group's default.
  - `Slider`'s and `RangeSlider`'s `constrainLabelPosition` keeps the labels of the first and last marks within the slider.
  - `DatePickerRangePanel`'s `EndCalendarProps` are applied to the end `Calendar`.
  - The `onClick` passed to `useSidePanel`'s trigger props no longer says that calling `preventDefault` stops the toggle, which the code doesn't do.
  - `Avatar`'s default `nameToInitials` uses the first letters of the first two words of `name`, not of every word.
  - `Menu`'s `placement` also defaults to `"right-start"` when the menu is positioned with `getVirtualElement`.
  - `Slider`'s and `RangeSlider`'s `format` formats the tooltip, `aria-valuetext` and the minimum and maximum values that screen readers announce, not the `minLabel` and `maxLabel`. `accessibleMinText` and `accessibleMaxText` replace "minimum" and "maximum" in what screen readers announce, and when they're set, the value after them isn't formatted. `stepMultiplier` is the number of steps that Page Up and Page Down move by. `showTooltip` also shows the tooltip while the thumb is dragged or focused with the keyboard. The event passed to `onChange` and `onChangeEnd` is `undefined` when the value is changed from the keyboard.
  - `useFloatingUI`'s `middleware` replaces the default middleware rather than updating it.
  - `DatePicker`'s `minDate` and `maxDate` default to the `LocalizationProvider`'s, which are January 1, 1900 and December 31, 2099 unless set, not 1900 and 2100. Its `createAnnouncement` uses the default announcements when it's `null`, rather than turning them off.
  - `DateInputSingle`'s and `DateInputRange`'s `onDateChange` passes `null` whenever the input is empty, and their `timezone` is derived from `date` or `defaultDate`. `DateInputRange`'s `onChange` doesn't receive a date.
  - The `focusedDate` passed to `onFocusedDateChange` on `DatePickerSingleGridPanel` and `DatePickerRangeGridPanel` is the new focused date, not the hovered date.
  - `DatePickerOverlayProvider`'s `disabled` only stops the overlay from opening on click.

- e1e38ea: Packages are now built with tsdown and their type declarations are generated with TypeScript 7. Entry points, export maps and existing deep import paths are unchanged. The compiled output now includes shared compiler helper modules under `_virtual/`.
- Updated dependencies [e1d9036]
- Updated dependencies [00bb4ab]
- Updated dependencies [2fa23b6]
- Updated dependencies [2fa23b6]
- Updated dependencies [40bb637]
- Updated dependencies [2fa23b6]
- Updated dependencies [2fa23b6]
- Updated dependencies [ff895b8]
- Updated dependencies [2fa23b6]
- Updated dependencies [ea6b309]
- Updated dependencies [fcea857]
- Updated dependencies [2fa23b6]
- Updated dependencies [23eeb4e]
- Updated dependencies [2fa23b6]
- Updated dependencies [2fa23b6]
- Updated dependencies [2fa23b6]
- Updated dependencies [fff2ebb]
- Updated dependencies [520e189]
- Updated dependencies [42b9e94]
- Updated dependencies [d62c57e]
- Updated dependencies [e1e38ea]
  - @salt-ds/core@1.76.0
  - @salt-ds/icons@1.20.0
  - @salt-ds/date-adapters@1.0.3
  - @salt-ds/styles@0.4.3
  - @salt-ds/window@0.1.3

## 1.1.4

### Patch Changes

- 40fb09b: Fixed a disabled tertiary `DateInputSingle` or `DateInputRange` having a transparent background. It now uses `--salt-editable-tertiary-background-disabled`, like `Input`.
- Updated dependencies [aa3ce52]
- Updated dependencies [f68dcb2]
- Updated dependencies [57304f5]
- Updated dependencies [57304f5]
- Updated dependencies [40fb09b]
- Updated dependencies [2c3cf5d]
- Updated dependencies [2c3cf5d]
- Updated dependencies [eccdb99]
- Updated dependencies [57304f5]
  - @salt-ds/core@1.75.0
  - @salt-ds/icons@1.19.0

## 1.1.3

### Patch Changes

- e009ed8: Fixed the `Calendar` day accessible name not matching the visible day text. The day's accessible name, selection announcements and `DatePickerActions` labels now use a two-digit day (e.g. "Monday 06 January 2025") to match the visible day.
- Updated dependencies [20db4be]
- Updated dependencies [0ac88c9]
- Updated dependencies [20db4be]
- Updated dependencies [3a74bce]
- Updated dependencies [20db4be]
- Updated dependencies [cdae245]
- Updated dependencies [cdae245]
- Updated dependencies [3a74bce]
  - @salt-ds/core@1.74.0

## 1.1.2

### Patch Changes

- e466542: `DateParserField` is now a const object with a matching union type instead of an enum. `DateParserField.START` and `DateParserField.END` work as before, as values and as types, and `"start"` or `"end"` can now be used wherever a `DateParserField` is expected.
- 825f63d: Renamed the `small` and `strong` font weight tokens to `lighter` and `bolder`, to match the new `fontWeight` prop on `Text`. The old tokens still work as aliases but are deprecated and will be removed in a future major version. Salt components now use the new tokens, so if you override an old token, override the new one instead.

  ```diff
  - font-weight: var(--salt-text-fontWeight-strong);
  + font-weight: var(--salt-text-fontWeight-bolder);
  ```

  | Deprecated token                         | Use instead                               |
  | ---------------------------------------- | ----------------------------------------- |
  | `--salt-text-fontWeight-small`           | `--salt-text-fontWeight-lighter`          |
  | `--salt-text-fontWeight-strong`          | `--salt-text-fontWeight-bolder`           |
  | `--salt-text-action-fontWeight-small`    | `--salt-text-action-fontWeight-lighter`   |
  | `--salt-text-action-fontWeight-strong`   | `--salt-text-action-fontWeight-bolder`    |
  | `--salt-text-display-fontWeight-small`   | `--salt-text-display-fontWeight-lighter`  |
  | `--salt-text-display-fontWeight-strong`  | `--salt-text-display-fontWeight-bolder`   |
  | `--salt-text-heading-fontWeight-small`   | `--salt-text-heading-fontWeight-lighter`  |
  | `--salt-text-heading-fontWeight-strong`  | `--salt-text-heading-fontWeight-bolder`   |
  | `--salt-text-label-fontWeight-small`     | `--salt-text-label-fontWeight-lighter`    |
  | `--salt-text-label-fontWeight-strong`    | `--salt-text-label-fontWeight-bolder`     |
  | `--salt-text-notation-fontWeight-small`  | `--salt-text-notation-fontWeight-lighter` |
  | `--salt-text-notation-fontWeight-strong` | `--salt-text-notation-fontWeight-bolder`  |

  The deprecated `--salt-text-h{1-4}-fontWeight-small`, `--salt-text-h{1-4}-fontWeight-strong`, `--salt-text-display{1-4}-fontWeight-small` and `--salt-text-display{1-4}-fontWeight-strong` tokens now alias the new tokens.

  The `small` and `strong` font weight tokens have been removed from the experimental Salt (Interim) theme without aliases. If you use the interim theme and reference them, switch to the matching `lighter` and `bolder` tokens in the table above.

  See [font weight](https://www.saltdesignsystem.com/salt/foundations/typography#font-weight) for how each text style uses these weights.

- 55f27de: The calendar, date input and date picker components now show their names in React DevTools instead of being anonymous.
- Updated dependencies [fd5ae98]
- Updated dependencies [4f1b504]
- Updated dependencies [75f2d7d]
- Updated dependencies [61228a7]
- Updated dependencies [f8925a2]
- Updated dependencies [825f63d]
- Updated dependencies [4aa4585]
- Updated dependencies [55f27de]
- Updated dependencies [602ddb5]
- Updated dependencies [fd1bf44]
- Updated dependencies [75f2d7d]
- Updated dependencies [7182ee8]
- Updated dependencies [7182ee8]
- Updated dependencies [825f63d]
- Updated dependencies [825f63d]
- Updated dependencies [825f63d]
- Updated dependencies [825f63d]
- Updated dependencies [cb2e335]
  - @salt-ds/core@1.73.0
  - @salt-ds/styles@0.4.2
  - @salt-ds/icons@1.18.4

## 1.1.1

### Patch Changes

- d578674: Applied typography letter spacing tokens consistently to text-owning components and inherited typography roots, and applied the display text transform token to display text.
- e990c46: Simplified the disabled appearance of `Calendar` days for a more consistent look across Salt components.
- Updated dependencies [ff312fb]
- Updated dependencies [d578674]
- Updated dependencies [24b5b04]
- Updated dependencies [83d7f9c]
- Updated dependencies [f9f5198]
- Updated dependencies [fbe1e48]
- Updated dependencies [394af0d]
- Updated dependencies [d578674]
- Updated dependencies [d578674]
- Updated dependencies [8e59c5d]
- Updated dependencies [cf3afb3]
- Updated dependencies [0b65f84]
- Updated dependencies [8e59c5d]
- Updated dependencies [8e59c5d]
- Updated dependencies [b434b9e]
- Updated dependencies [e75a32d]
- Updated dependencies [59a14d2]
- Updated dependencies [e990c46]
- Updated dependencies [550c4c1]
- Updated dependencies [8e59c5d]
- Updated dependencies [2a5cb0d]
  - @salt-ds/core@1.72.0
  - @salt-ds/styles@0.4.1
  - @salt-ds/window@0.1.2
  - @salt-ds/icons@1.18.3

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
