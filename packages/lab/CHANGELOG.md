# @salt-ds/lab

## 1.0.0-alpha.75

### Patch Changes

- 8538730: Removed text selection background color override.
- e08ae14: Fixed TabsNext using aria-actions when it's not supported.
- 5d6210f: Fixed `CollapsibleTrigger` adding type="button" incorrectly to non-buttons.
- 5d6210f: Updated `VerticalNavigation` to use a `<nav>` element as its root element.
- Updated dependencies [846d975]
- Updated dependencies [8538730]
- Updated dependencies [8261887]
- Updated dependencies [e6445dc]
- Updated dependencies [ff646e2]
- Updated dependencies [9a25824]
- Updated dependencies [64ef723]
  - @salt-ds/core@1.47.5

## 1.0.0-alpha.74

### Minor Changes

- 7440996: A new component (`VerticalNavigation`) has been introduced to replace the existing `NavigationItem` component for vertical navigation. The new component provides a more structured and flexible way to create vertical navigation.
- 7440996: Added `Collapsible`, `CollapsibleTrigger` and `CollapsiblePanel`.

  Collapsible enables content to be either collapsed (hidden) or expanded (visible). It has two elements: a trigger and a panel whose visibility is controlled by the button.

  ```tsx
  <Collapsible>
    <CollapsibleTrigger>
      <Button>Click</Button>
    </CollapsibleTrigger>
    <CollapsiblePanel>Content</CollapsiblePanel>
  </Collapsible>
  ```

### Patch Changes

- d747775: Updated Table's footer text style to body strong.
- Updated dependencies [c58279f]
- Updated dependencies [239d20c]
- Updated dependencies [fe8da62]
  - @salt-ds/core@1.47.4

## 1.0.0-alpha.73

### Patch Changes

- 86877dd: Fixed extra margin appearing on StaticList.
- Updated dependencies [55e7bc5]
- Updated dependencies [3481308]
- Updated dependencies [851e4cb]
  - @salt-ds/core@1.47.3

## 1.0.0-alpha.72

### Patch Changes

- a8ee89c: Upgrade peer dependencies for Luxon and its type definitions to the latest versions.

  - Updated peer dependency `luxon` from `^3.5.0` to `^3.6.1`.
  - Updated peer dependency `@types/luxon` from `^3.4.2` to `^3.6.2`.

  This upgrade includes improvements and bug fixes provided in the newer versions of Luxon and its type definitions. Ensure compatibility with your codebase by reviewing any changes in the Luxon API or type definitions. As these are peer dependencies, make sure that the consuming projects are also updated to these versions to avoid potential conflicts.

- ab80f5f: Updated the `Calendar` API to use a `multiselect` prop instead of `selectionVariant="multiselect"`

  Previously, the `Calendar` component used `selectionVariant="multiselect"` to enable the selection and de-selection of multiple single dates, with the de-selection logic embedded within the component.

  To extend multiple selection capabilities to all selection variants, we have revised the API to include a `multiselect` boolean prop. This change removes the need for `selectionVariant="multiselect"`.

  Now, you can apply the multiselect property in `Calendar` alongside `selectionVariant="single`", `selectionVariant="range"`, or `selectionVariant="offset"`.

  This update allows us to offer a consistent multiple selection API across all date selection variants.

  ```diff
  <Calendar
  -  selectionVariant="multiselect"
  +  selectionVariant="single"
  +  multiselect
  >
    <CalendarNavigation />
    <CalendarGrid />
  </Calendar>
  ```

  To de-select a previous selection, control is provided through a new `select` prop that enables control over the current selection based on the day that has been selected by the user.

  ```diff
  function selectMultiselectSingle<TDate extends DateFrameworkType>(
    dateAdapter: SaltDateAdapter<TDate>,
    previousSelectedDate: SingleDateSelection<TDate>[],
    newDate: TDate,
  ) {
    const newSelection = previousSelectedDate.filter(
      (previousSingleDate) =>
        !dateAdapter.isSame(previousSingleDate, newDate, "day"),
    );
    if (previousSelectedDate.length !== newSelection.length) {
      return newSelection;
    }
    return [...previousSelectedDate, newDate];
  }

  <Calendar
  -  selectionVariant="multiselect"
  +  selectionVariant="single"
  +  multiselect
  +   select={(
  +     previousSelectedDate: SingleDateSelection<DateFrameworkType>[],
  +     newDate: SingleDateSelection<DateFrameworkType>,
  +   ) => selectMultiselectSingle(dateAdapter, previousSelectedDate, newDate)}
     >
     <StackLayout gap={0}>
        <CalendarNavigation />
        <CalendarGrid />
     </StackLayout>
  </Calendar>
  ```

  A few additional type changes have occurred:

  `CalendarMultiSelectProps` has been replaced by `CalendarMultiselectSingleProps`, and `UseCalendarMultiSelectProps` has been replaced by `UseCalendarMultiselectSingleProps`.

  ```diff
  - import { type CalendarMultiSelectProps } from "@salt-ds/lab";
  + import { type CalendarMultiselectSingleProps } from "@salt-ds/lab";

  - import { type UseCalendarMultiSelectProps } from "@salt-ds/lab";
  + import { type UseCalendarMultiselectSingleProps } from "@salt-ds/lab";
  ```

  The associated selected date type for multiselect single dates, has also been updated:

  ```diff
  import type { DateFrameworkType } from "@salt-ds/date-adapters"; // This type can be any supported date framework object type, such as Date, Dayjs, Luxon, or Moment
  - import type { MultipleDateSelection } from "@salt-ds/lab";
  + import type { SingleDateSelection } from "@salt-ds/lab";
  - type selectedDate = MultipleDateSelection<DateFrameworkType>;
  + type selectedDate = Array<SingleDateSelection<DateFrameworkType>>;
  ```

  Our goal for the `DatePicker` is to support multiple selection across all date types: `single`, `range`, and `offset`, similar to the functionality in Calendar.
  However, this will require a design iteration around the input component before it can be added.

- c86ee15: Fixed CascadingMenu and refactored the styles to not use any deprecated tokens.
- Updated dependencies [a8ee89c]
- Updated dependencies [09cac7d]
- Updated dependencies [cdce628]
- Updated dependencies [454686b]
- Updated dependencies [f25a82b]
- Updated dependencies [6bc8e53]
  - @salt-ds/date-adapters@0.1.0-alpha.5
  - @salt-ds/core@1.47.2

## 1.0.0-alpha.71

### Minor Changes

- 9c4575b: ### Summary

  The `Carousel` component has been moved from the Lab package to its own package, `@salt-ds/embla-carousel`.

  `Carousel` remains in a pre-release state and subject to feedback will be promoted to stable in a forthcoming release.

  Refer to the `@salt-ds/embla-carousel` changelog for the migration guide.

- 7db876d: Updated the `NumberInput`:

  1. Added support for `format` and `parse` callbacks for formatting capabilities.
  2. Added `clamp` prop to restrict entry within the min and max range.
  3. Refactored `stepBlock` prop to be `stepMultiplier` to be consistent with `Slider` and `RangeSlider` components and to ensure that valid values remain reachable.
  4. Refactored `decimalPlaces` to be `decimalScale`.
  5. Added caret handling to preserve the caret position, during change.

  Example:

  ```diff
  <NumberInput
  + format={(value) => `${value}%`}
  + parse={(value) => String(value).replace(/%/g, "")}
  - decimalPlaces={2}
  + decimalScale={2}
  - stepBlock={10}
  + stepMultiplier={4}
    min={0}
    max={100}
  + clamp
    defaultValue={20}
  />
  ```

### Patch Changes

- d5a52bb: Fixed Calendar's today indicator

  When Next theme with rounded corners is enabled, the today indicator will display rounded corners.

- 621253b: Refactored components and themes to use the new fixed tokens.
- Updated dependencies [62975de]
- Updated dependencies [b96166e]
- Updated dependencies [73ccf6b]
- Updated dependencies [95dd874]
- Updated dependencies [c93c943]
- Updated dependencies [104d776]
- Updated dependencies [621253b]
  - @salt-ds/core@1.47.1

## 1.0.0-alpha.70

### Patch Changes

- 5f6c967: Fixed CascadingMenu styles clashing with Menu styles.
- Updated dependencies [b99afaa]
- Updated dependencies [dd3e21d]
- Updated dependencies [edcd33d]
- Updated dependencies [a3a0608]
- Updated dependencies [0c140c0]
  - @salt-ds/core@1.47.0
  - @salt-ds/icons@1.14.0

## 1.0.0-alpha.69

### Patch Changes

- Updated dependencies [f107d63]
  - @salt-ds/core@1.46.1

## 1.0.0-alpha.68

### Minor Changes

- 4a240fd: - Removed `Splitter` component from labs, replaced with `@salt-ds/react-resizable-panels-theme` package.

### Patch Changes

- 1a50f7b: - `DatePickerSinglePanel` has been deprecated, use `DatePickerSingleGridPanel` instead.

  - `DatePickerSinglePanel` has been renamed to `DatePickerSingleGridPanel` to align the naming with `DatePickerRangeGridPanel`. This component now provides up to 12 `Calendars` within a panel via the `numberOfVisibleMonths` and `columns` props, enabling multi-month date selection (defaults to 1 visible calendar).

  ```
  <DatePicker
    selectionVariant="single"
  >
    <DatePickerTrigger>
      <DatePickerSingleInput />
    </DatePickerTrigger>
    <DatePickerOverlay>
      <DatePickerSingleGridPanel numberOfVisibleMonths={12} columns={3} />
    </DatePickerOverlay>
  </DatePicker>
  ```

  - `DatePickerRangeGridPanel` has been added. It provides up to 12 Calendars within a panel via the `numberOfVisibleMonths` and `columns` props, enabling multi-month date range selection (defaults to 2 visible calendars and 2 columns).

  ```
  <DatePicker
    selectionVariant="range"
  >
    <DatePickerTrigger>
      <DatePickerRangeInput />
    </DatePickerTrigger>
    <DatePickerOverlay>
      <DatePickerRangeGridPanel numberOfVisibleMonths={12} columns={3} />
    </DatePickerOverlay>
  </DatePicker>
  ```

  Note: `DatePickerRangePanel` remains unchanged and provides a dual `Calendar` date view, with individual month/year dropdowns for the start and end date range.

  - `CalendarWeekHeader` is now rendered by `CalendarGrid` and can be customized using the `CalendarWeekHeaderProps` prop. If you currently use `CalendarWeekHeader`, you may see two day of week headers, so delete the version from your code.
  - `CalendarMonthHeader` is now rendered by `CalendarGrid` and can be customized using the `CalendarMonthHeaderProps` prop.
  - A new `CalendarMonthHeader` component has been added, used by `CalendarGrid` to display a multi-month grid of `Calendar` components.
  - `DatePickerRangePanel` props `StartCalendarWeekHeaderProps` and `EndCalendarWeekHeaderProps` removed.
    Pass props to `CalendarWeekHeader` using `StartCalendarGridProps -> CalendarWeekHeaderProps` and `EndCalendarGridProps -> CalendarWeekHeaderProps`.

  ```
  <DatePicker
    selectionVariant="range"
  >
    <DatePickerTrigger>
      <DatePickerRangeInput />
    </DatePickerTrigger>
    <DatePickerOverlay>
      <DatePickerRangePanel
       StartCalendarGridProps={{ CalendarWeekHeaderProps: { "data-test-id" : "some value" }}}
       EndCalendarGridProps={{ CalendarWeekHeaderProps: { "data-test-id" : "some value" }}}
       />
    </DatePickerOverlay>
  </DatePicker>
  ```

  - `DatePicker` now supports `isDayDisabled`, `isDayUnselectable`, and `isDayHighlighted` props, rather than providing them through the `Calendar` props.
  - The `DatePickerOverlayProvider` prop `onOpenChange` has changed signature and `event` has been removed, to create a consistent API with other components.

  ```diff
  - onOpenChange?: ( newOpen: boolean, event?: Event, reason?: DatePickerOpenChangeReason) => void;
  + onOpenChange?: ( newOpen: boolean, reason?: DatePickerOpenChangeReason) => void;
  ```

  - DatePicker helper text simplified and resizing bug fixed

  In our DatePicker examples, we demonstrate how to include helper text when using a DatePicker within a FormField.
  The design requires the helper text to move inside the panel when the DatePicker is opened.
  However, this caused a resizing issue with the original date input.

  To resolve this, we have refactored the implementation by introducing a `DatePickerHelperText` component.
  This component is used as a child of the `DatePicker`, streamlining the process and removing the need for users to manage the visibility of the helper text themselves.

  ```diff
  - <FormField validationStatus={validationStatus}>
  -   <FormLabel>Select a date</FormLabel>
  -   <DatePicker
  -     selectionVariant={"single"}
  -   >
  -     <DatePickerTrigger>
  -       <DatePickerSingleInput />
  -     </DatePickerTrigger>
  -     <DatePickerOverlay>
  -       <DatePickerSingleGridPanel
  -         helperText={helperText}
  -       />
  -       <DatePickerHelperText>{helperText}</DatePickerHelperText>
  -     </DatePickerOverlay>
  -   </DatePicker>
  -   {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
  - </FormField>
  + <FormField validationStatus={validationStatus}>
  +   <FormLabel>Select a date</FormLabel>
  +   <DatePicker
  +     selectionVariant={"single"}
  +   >
  +     <DatePickerTrigger>
  +       <DatePickerSingleInput />
  +     </DatePickerTrigger>
  +     <DatePickerOverlay>
  +       <DatePickerSingleGridPanel
  +         helperText={helperText}
  +       />
  +     </DatePickerOverlay>
  +     <DatePickerHelperText>{helperText}</DatePickerHelperText>
  +   </DatePicker>
  + </FormField>
  ```

  - Added `useFocusOut` floating-ui middleware to close the overlay upon focus out.
  - Fixed a bug where the change event was triggered by blur when the entered date had not changed.
  - Fixed the styling of disabled and unselectable days, which previously used the same style.
  - Fixed invalid date ranges so they do not render as selected.
  - Fixed a bug for helper text to ensure it wraps during overflow.
  - Timezone prop added to date components, `DatePicker`, `DatePickerSingleInput`, `DatePickerRangeInput`, `DateInputSingle`, `DateInputRange`, `Calendar`.
    The `timezone` prop defines the timezone for the date components, when working with dates and times, it is important to ensure that the correct timezone is applied to avoid confusion and errors.
    If not working with times, the timezone can still affect the date displayed, as the date may be interpreted in a different timezone than intended.
    For this reason, when working with dates, it is recommended to always set the timezone to ensure that the date is displayed correctly.
    "UTC" is a cross-platform standard and is the most common timezone used in programming but may require you to convert to your local timezone for display purposes.
    If `timezone` is not set the timezone will be defined by the default behaviour of your configured date framework.
    The `timezone` prop can be set to one of the following values:
  - If undefined, the timezone will be derived from the passed date, or from `defaultSelectedDate`/`selectedDate` or "default" if no date is defined.
  - If set to "default", the default timezone of the date library will be used.
  - If set to "system", the local system's timezone will be applied.
  - If set to "UTC", the time will be returned in UTC.
  - If set to a valid IANA timezone identifier, the time will be returned for that specific timezone.
    Timezone is not supported by v3 of `date-fns`, so if you are using `date-fns` v3, the timezone will be set to "default" by default. If you require timezone support, use a date framework such as `luxon` or `dayjs`.
  - `Calendar` previously could render custom contents but did not provide a way to change the highlight styles, so `renderDayContents` has been replaced with `render`, passed through `CalendarDayProps`.

  ```
  function renderDayButton({
    className,
    date,
    status,
    ...rest
  }: renderCalendarDayProps<DateFrameworkType>): ReactElement {
    return (
      <button
        {...rest}
        className={clsx([{ buttonWithDot: !status.outOfRange }, className])}
      >
        <span className={clsx({ dot: !status.outOfRange })}>
          {dateAdapter.format(date, "D")}
        </span>
        {status.today ? <span className={"today"} /> : null}
      </button>
    );
  }

  return (
    <Calendar hideOutOfRangeDates {...args}>
      <CalendarNavigation />
      <CalendarGrid CalendarDayProps={{ render: renderDayButton }} />
    </Calendar>
  );
  ```

- Updated dependencies [1a50f7b]
- Updated dependencies [8b4cbfb]
- Updated dependencies [bbdf4a6]
- Updated dependencies [ec1736e]
  - @salt-ds/date-adapters@0.1.0-alpha.4
  - @salt-ds/core@1.46.0

## 1.0.0-alpha.67

### Minor Changes

- c664e97: - Moved `SteppedTracker` component from labs to core, renamed as `Stepper`.

### Patch Changes

- Updated dependencies [c664e97]
- Updated dependencies [06232b0]
  - @salt-ds/core@1.45.0

## 1.0.0-alpha.66

### Minor Changes

- 799cf41: Updated `Carousel` component

  - Renamed `initialIndex` to `defaultActiveSlideIndex`
  - Added controlled `activeSlideIndex`
  - Added `visibleSlides` to control how many slides can be visible at a time.
  - Added `CarouselSlider` and extracted the controls to its own component, `CarouselControls` to improve composition.
  - Added appearance in `CarouselSlide` to allow for border items.
  - Added keyboard navigation.
  - Removed usage of `DeckLayout`.

  before:

  ```tsx
  <Carousel>
    {items.map((item, index) => (
      <CarouselSlide
        key={index}
        ButtonBar={<Button variant="cta">Learn more</Button>}
        description="Lorem ipsum"
        title="Carousel slide title"
      />
    ))}
  </Carousel>
  ```

  after:

  ```tsx
  <Carousel>
    <CarouselControls />
    <CarouselSlider>
      {items.map((slide) => (
        <CarouselSlide
          key={slide.title}
          header={<H3>{slide.title}</H3>}
          actions={<Link href="#">{slide.link}</Link>}
        >
          <Text>{slide.content}</Text>
        </CarouselSlide>
      ))}
    </CarouselSlider>
  </Carousel>
  ```

### Patch Changes

- Updated dependencies [851b2eb]
  - @salt-ds/core@1.44.1

## 1.0.0-alpha.65

### Minor Changes

- 7fe2106: Removed `Slider` and `RangeSlider` from labs and promoted to core.

### Patch Changes

- Updated dependencies [7fe2106]
  - @salt-ds/core@1.44.0

## 1.0.0-alpha.64

### Minor Changes

- 78eaee3: - Removed `DialogHeader` from labs and promoted to core.
  - Removed `OverlayHeader` from labs and promoted to core.

### Patch Changes

- 2bdfbfb: Fixed DateInput adornment size and spacing, to align with rest of form controls.
- 5725384: Fixed the focus visible behaviour of Slider and RangeSlider.
- Updated dependencies [78eaee3]
- Updated dependencies [20abfb6]
- Updated dependencies [c59472d]
- Updated dependencies [2bdfbfb]
- Updated dependencies [0073384]
- Updated dependencies [ef8f30a]
  - @salt-ds/core@1.43.0

## 1.0.0-alpha.63

### Minor Changes

- 9287b09: enabled uncontrolled/un-controlled open behaviour for `DatePicker`

  - added `openOnClick` props to `DatePicker`.
  - when the triggering element (`DateInput`) is focused, arrow key down, will now open the DatePicker by default
  - revise the controlled behaviour of the `open` prop on `DatePickerOverlay`.

### Patch Changes

- 5639e94: Renamed StepperInput to NumberInput.
- 4731908: Slider / RangeSlider updates

  - track now support tick marks with the `showTicks` prop.
  - `restrictToMarks` prop will snap the value to the closest mark.
  - `decimalPlaces` prop specifies the number of decimal places for the value.
  - `constrainLabelPosition` will ensure that mark labels remain within the boundary of the track.

  This represents the final feature set before we move these changes to a stable API in core.

- a1c89e2: Update Slider component implementation to have separate `Slider` and `RangeSlider` components, with improved accessibility and test coverage.
- e93ee6f: Fixed the `TabsNext` overflow menu position when there is enough space, and prevented the hidden menu from causing the page to overflow.

  Closes #4617.

## 1.0.0-alpha.62

### Minor Changes

- f459825: Added a new `reset` action that sets the first step as active and all others as pending. This action is useful when the user has completed the current flow and wants to start over.

  Fixed a bug where the `ended` boolean was not updated correctly when all steps were completed. This issue was caused by an immutability problem in the state handling logic. The bug is now resolved, and the `ended` displays correctly.

  Changed the `warning`, `error` and `clear` actions to to `status/warning`, `status/error` and `status/clear` respectively. This change was made to streamline the naming convention of the actions.

  Removed `key` as identifier of StepRecord. This change was made to avoid confusion with the `key` attribute in React components and streamline search of a step. The `id` attribute should be used instead.

  Before:

  ```tsx
  export type StepRecord =
    | (Omit<StepProps, "children"> & { key: string })
    | (Omit<StepProps, "children"> & { id: string });
  ```

  After:

  ```tsx
  export type StepRecord = Omit<StepProps, "children"> & { id: string };
  ```

  We recommend passing down `id` and `key` for optimal results, although you could just provide `key`. Please refer to the examples provided for further clarification.

  Recommended approach, pass `id` as both `id` and `key`:

  ```tsx
  <SteppedTracker>
    {state.steps.map((step) => (
      <Step key={step.id} {...step} />
    ))}
  </SteppedTracker>
  ```

  Pass `id` as `key` only:

  ```tsx
  <SteppedTracker>
    {state.steps.map(({ id, ...step }) => (
      <Step key={id} {...step} />
    ))}
  </SteppedTracker>
  ```

- d078641: Added `Splitter` component to the Salt Design System.
- b619a9d: Fixed `DatePicker` being interactive when disabled.

### Patch Changes

- 076dedd: Improved Tab's overflow behavior and accessibility:

  - Tab lists should now collapse in more scenarios.
  - Tabs selected from the overflow menu should be focused more consistently.
  - When a tab is removed, focus moved to the next tab in the tab list more consistently.
  - When a selected tab is removed, the next tab in the tab list should be selected more consistently.

- 99f7506: Fixed `TabsNext` overflow when only having enough space for one tab.

  Fixes #4724.

- Updated dependencies [38da566]
- Updated dependencies [32de853]
- Updated dependencies [ea84dd2]
- Updated dependencies [aac1500]
- Updated dependencies [803d0c0]
- Updated dependencies [7a84d72]
- Updated dependencies [e783dd5]
- Updated dependencies [c30b6a4]
  - @salt-ds/core@1.42.0
  - @salt-ds/date-adapters@0.1.0-alpha.3

## 1.0.0-alpha.61

### Patch Changes

- 98d3aac: Improved screen reader support for read-only stepper inputs.
- Updated dependencies [90b85d4]
- Updated dependencies [90b85d4]
- Updated dependencies [fd86394]
- Updated dependencies [56a997c]
- Updated dependencies [9a75603]
- Updated dependencies [021e90d]
- Updated dependencies [7510f56]
- Updated dependencies [98d3aac]
- Updated dependencies [ea5fc00]
- Updated dependencies [ba0f436]
  - @salt-ds/core@1.41.0
  - @salt-ds/icons@1.13.2

## 1.0.0-alpha.60

### Patch Changes

- 45961dd: Fix dialog and overlay header alignments
- Updated dependencies [6a0db8d]
- Updated dependencies [3b1c265]
- Updated dependencies [1436b36]
- Updated dependencies [39bd967]
- Updated dependencies [efb37a0]
  - @salt-ds/core@1.40.0

## 1.0.0-alpha.59

### Minor Changes

- 373717d: Removed `SkipLink` from labs and promoted to core.

### Patch Changes

- e6c54b7: Refine peer dependency management for DatePicker adapters by splitting them into sub-packages. You now import only the specific date framework adapter you need, simplifying dependency handling.

  - **For `date-fns`:**

    ```diff
    - import { AdapterDateFns } from "@salt-ds/date-adapters";
    + import { AdapterDateFns } from "@salt-ds/date-adapters/date-fns";
    ```

  - **For `dayjs`:**

    ```diff
    - import { AdapterDayjs } from "@salt-ds/date-adapters";
    + import { AdapterDayjs } from "@salt-ds/date-adapters/dayjs";
    ```

  - **For `luxon`:**

    ```diff
    - import { AdapterLuxon } from "@salt-ds/date-adapters";
    + import { AdapterLuxon } from "@salt-ds/date-adapters/luxon";
    ```

  - **For `moment`:**

    ```diff
    - import { AdapterMoment } from "@salt-ds/date-adapters";
    + import { AdapterMoment } from "@salt-ds/date-adapters/moment";
    ```

  Additionally, `DateDetailErrorEnum` is now a simpler `DateDetailError` of type `DateDetailErrorType`.

  ```diff
  - import { DateDetailErrorEnum } from "@salt-ds/date-adapters";
  + import { DateDetailError } from "@salt-ds/date-adapters/moment";
  ```

  ### Instructions

  1. Modify your import statements to use the specific sub-package for the date adapter you require.
  2. Ensure your `package.json` includes the necessary date framework as a dependency. For example, if using `date-fns`:

     ```json
     {
       "dependencies": {
         "date-fns": "^x.x.x"
       }
     }
     ```

  This change helps streamline the integration of date frameworks with the DatePicker component by ensuring only the necessary adapters and dependencies are included.

- eed82f8: Overlay and Dialog headers fix alignment for titles spanning into multiple lines, wrap preheader and headers in H2.
- df7760d: Add border box to skip link container to ensure height is correctly measured.
- Updated dependencies [e6c54b7]
- Updated dependencies [373717d]
- Updated dependencies [225a61b]
- Updated dependencies [c5d61e2]
  - @salt-ds/date-adapters@0.1.0-alpha.2
  - @salt-ds/core@1.39.0

## 1.0.0-alpha.58

### Minor Changes

- 0302830: Updates to Lab `SkipLink`

  - Remove `targetRef` prop, added `target` prop to accept a string representing the ID of the target element.
  - Updated styling to adhere with the rest of the library styles for consistency.
  - Fixed an issue where the `SkipLink` would render when the ref to the target element was broken. Now, the skip link will not render at all if the target element is not found.

### Patch Changes

- 0a5b68b: Marked CSS files as having side effects. This fixes Webpack tree-shaking CSS files when `sideEffects: true` is not set on style-loader rules.
- a9edf03: Fixed DatePicker showing overlay when `readOnly`. Closes #4470.
- 86d2a28: Refactored SteppedTracker, added Step and useStepReducer

  The `SteppedTracker` is a component that helps you manage a series of steps in a process. It provides a way to navigate between steps, and to track the progress of the process.

  The `<SteppedTracker />` is meant to be used in conjunction with the `<Step />` component and potentially the `useStepReducer()` hook.

  In it's simplest form the `SteppedTracker` can be used like so:

  ```tsx
  import { SteppedTracker, Step } from "@salt-ds/lab";

  function Example() {
    return (
      <SteppedTracker>
        <Step label="Step 1" stage="completed" />
        <Step label="Step 2" stage="active" />
        <Step label="Step 3" stage="pending" />
      </SteppedTracker>
    );
  }
  ```

  The SteppedTracker component supports nested steps, which can be used to represent sub-steps within a step. This can be done by nesting `<Step />` components within another `<Step />` component. We advise you not to go above 2 levels deep, as it becomes hard to follow for the user.

  ```tsx
  import { StackLayout } from "@salt-ds/core";
  import { Step, SteppedTracker } from "@salt-ds/lab";

  export function NestedSteps() {
    return (
      <StackLayout style={{ minWidth: "240px" }}>
        <SteppedTracker orientation="vertical">
          <Step label="Step 1" stage="completed">
            <Step label="Step 1.1" stage="completed" />
          </Step>
          <Step label="Step 2" stage="inprogress">
            <Step label="Step 2.1" stage="active" />
            <Step label="Step 2.2" stage="pending">
              <Step label="Step 2.2.1" stage="pending" />
              <Step label="Step 2.2.2" stage="pending" />
              <Step label="Step 2.2.3" stage="pending" />
            </Step>
          </Step>
          <Step label="Step 3">
            <Step label="Step 3.1" stage="pending" />
            <Step label="Step 3.2" stage="pending" />
            <Step label="Step 3.3" stage="pending">
              <Step label="Step 3.3.1" stage="pending" />
              <Step label="Step 3.3.2" stage="pending" />
              <Step label="Step 3.3.3" stage="pending" />
            </Step>
          </Step>
        </SteppedTracker>
      </StackLayout>
    );
  }
  ```

  The `SteppedTracker` component is a purely presentational component, meaning that you need to manage the state of the steps yourself. That however becomes tricky when dealing with nested steps. This is where the `useStepReducer()` hook comes in. It is a custom hook that helps you manage the state of a `SteppedTracker` component with nested steps with ease. It has a built-in algorithm that determines the stage of all steps above and below the active step. All you need to do is add `stage: 'active'` to the desired step (see `step-3-3` in the hook example below), the hook will figure out the rest. This is what we call `autoStage`.

  Migrating from the previous SteppedTracker API

  Before:

  ```tsx
  function Before() {
    return (
      <SteppedTracker activeStep={0}>
        <TrackerStep>
          <StepLabel>Step One</StepLabel>
        </TrackerStep>
        <TrackerStep>
          <StepLabel>Step Two</StepLabel>
        </TrackerStep>
        <TrackerStep>
          <StepLabel>Step Three</StepLabel>
        </TrackerStep>
        <TrackerStep>
          <StepLabel>Step Four</StepLabel>
        </TrackerStep>
      </SteppedTracker>
    );
  }
  ```

  After:

  ```tsx
  function After() {
    return (
      <SteppedTracker>
        <Step label="Step One" stage="active" />
        <Step label="Step Two" />
        <Step label="Step Three" />
        <Step label="Step Four" />
      </SteppedTracker>
    );
  }
  ```

  Before:

  ```tsx
  function Before() {
    return (
      <SteppedTracker orientation="vertical" activeStep={8}>
        <TrackerStep stage="completed">
          <StepLabel>Step 1</StepLabel>
        </TrackerStep>
        <TrackerStep depth={1} stage="completed">
          <StepLabel>Step 1.1</StepLabel>
        </TrackerStep>
        <TrackerStep depth={1} stage="completed">
          <StepLabel>Step 1.2</StepLabel>
        </TrackerStep>
        <TrackerStep depth={1} stage="completed">
          <StepLabel>Step 1.3</StepLabel>
        </TrackerStep>
        <TrackerStep stage="completed">
          <StepLabel>Step 2</StepLabel>
        </TrackerStep>
        <TrackerStep stage="inprogress">
          <StepLabel>Step 3</StepLabel>
        </TrackerStep>
        <TrackerStep depth={1} stage="completed">
          <StepLabel>Step 3.1</StepLabel>
        </TrackerStep>
        <TrackerStep depth={1} stage="completed">
          <StepLabel>Step 3.2</StepLabel>
        </TrackerStep>
        <TrackerStep depth={1} stage="inprogress">
          <StepLabel>Step 3.3</StepLabel>
        </TrackerStep>
        <TrackerStep depth={1}>
          <StepLabel>Step 3.4</StepLabel>
        </TrackerStep>
        <TrackerStep>
          <StepLabel>Step 4</StepLabel>
        </TrackerStep>
      </SteppedTracker>
    );
  }
  ```

  After

  ```tsx
  function After() {
    return (
      <SteppedTracker orientation="vertical">
        <Step label="Step 1" stage="completed">
          <Step label="Step 1.1" stage="completed" />
          <Step label="Step 1.2" stage="completed" />
          <Step label="Step 1.3" stage="completed" />
        </Step>
        <Step label="Step 2" stage="completed" />
        <Step label="Step 3" stage="inprogress">
          <Step label="Step 3.1" stage="completed" />
          <Step label="Step 3.2" stage="completed" />
          <Step label="Step 3.3" stage="active" />
          <Step label="Step 3.3" />
        </Step>
        <Step label="Step 4" />
      </SteppedTracker>
    );
  }
  ```

  or you can utilize the hook for nested scenarios, such as the one above

  ```tsx
  import { Step, SteppedTracker, useStepReducer } from "@salt-ds/lab";

  export function AfterWithHook() {
    const [state, dispatch] = useStepReducer([
      {
        key: "step-1",
        label: "Step 1",
        substeps: [
          { key: "step-1-1", label: "Step 1.1" },
          { key: "step-1-2", label: "Step 1.2" },
          { key: "step-1-3", label: "Step 1.3" },
        ],
      },
      { key: "step-2", label: "Step 2" },
      {
        key: "step-3",
        label: "Step 3",
        substeps: [
          { key: "step-3-1", label: "Step 3.1" },
          { key: "step-3-2", label: "Step 3.2" },
          { key: "step-3-3", label: "Step 3.3", stage: "active" },
          { key: "step-3-4", label: "Step 3.4" },
        ],
      },
      { key: "step-4", label: "Step 4" },
    ]);

    return (
      <StackLayout style={{ width: 240 }}>
        <SteppedTracker orientation="vertical">
          {state.steps.map((step) => (
            <Step key={step.key || step.id} {...step} />
          ))}
        </SteppedTracker>
      </StackLayout>
    );
  }
  ```

- Updated dependencies [86d2a28]
- Updated dependencies [dedbade]
- Updated dependencies [0a5b68b]
- Updated dependencies [cd98ba5]
- Updated dependencies [bfea9b3]
  - @salt-ds/core@1.38.0
  - @salt-ds/icons@1.13.1

## 1.0.0-alpha.57

### Patch Changes

- f3ae565: Fixed `format` not working on `DatePickerRangeInput`. Closes #4474.

## 1.0.0-alpha.56

### Minor Changes

- e7b0406: Added `OverlayHeader` component to lab.

  ```tsx
  <Overlay {...args}>
    <OverlayTrigger>
      <Button>Show Overlay</Button>
    </OverlayTrigger>
    <OverlayPanel aria-labelledby={id}>
      <OverlayHeader
        id={id}
        header="Title"
        actions={
          <Button
            aria-label="Close overlay"
            appearance="transparent"
            sentiment="neutral"
          >
            <CloseIcon aria-hidden />
          </Button>
        }
      />
      <OverlayPanelContent>Content of Overlay</OverlayPanelContent>
    </OverlayPanel>
  </Overlay>
  ```

### Patch Changes

- b272497: DatePicker, DateInput, Calendar Lab updates

  We are excited to introduce a new Salt package, `@salt-ds/date-adapters`, currently in pre-release/lab status to gather your valuable feedback.

  This package includes supported adapters for Salt's date-based controls:

  - `AdapterDateFns` for [date-fns](https://date-fns.org/)
  - `AdapterDayjs` for [dayjs](https://day.js.org/)
  - `AdapterLuxon` for [luxon](https://moment.github.io/luxon/)
  - `AdapterMoment` (legacy) for [moment](https://momentjs.com/)

  > **Note:** As `moment` is no longer actively maintained by its creators, `AdapterMoment` is published in a deprecated form to assist in transitioning to a newer date framework.

  Salt adapters are integrated with a new `LocalizationProvider`, enabling a date-based API accessible through `useLocalization`. Typically, you only need to add one `LocalizationProvider` per application, although they can be nested if necessary.

  `@salt-ds/adapters` uses peer dependencies for the supported date libraries. It is the responsibility of the application author to include the required dependencies in their build. Additionally, the application author is responsible for configuring the date libraries, including any necessary extensions or loading dependencies for supported locales.

  **Example Usage**

  An app that renders a Salt date-based control may look like this:

  ```jsx
  import { AdapterDateFns } from "@salt-ds/date-adapters";
  import {
    Calendar,
    CalendarNavigation,
    CalendarWeekHeader,
    CalendarGrid,
    LocalizationProvider,
  } from "@salt-ds/lab";

  const MyApp = () => (
    <SaltProvider density="high" mode="light">
      <LocalizationProvider DateAdapter={AdapterDateFns}>
        <Calendar selectionVariant="single">
          <CalendarNavigation />
          <CalendarWeekHeader />
          <CalendarGrid />
        </Calendar>
      </LocalizationProvider>
    </SaltProvider>
  );
  ```

  A `DateInput` within an app that uses `LocalizationProvider` might be implemented as follows:

  ```jsx
  const MyDateInput = () => {
    const { dateAdapter } = useLocalization();

    function handleDateChange<TDate extends DateFrameworkType>(
      event: SyntheticEvent,
      date: TDate | null,
      details: DateInputSingleDetails
    ) {
      console.log(
        `Selected date: ${dateAdapter.isValid(date) ? dateAdapter.format(date, "DD MMM YYYY") : date}`
      );

      const { value, errors } = details;
      if (errors?.length && value) {
        console.log(
          `Error(s): ${errors
            .map(({ type, message }) => `type=${type} message=${message}`)
            .join(", ")}`
        );
        console.log(`Original Value: ${value}`);
      }
    }

    return <DateInputSingle onDateChange={handleDateChange} />;
  };
  ```

  A `DatePicker` within an app that uses `LocalizationProvider` might be implemented as follows:

  ```jsx
  const MyDatePicker = () => {
    const { dateAdapter } = useLocalization();
    const handleSelectionChange = useCallback(
      (
        event: SyntheticEvent,
        date: SingleDateSelection<DateFrameworkType> | null,
        details: DateInputSingleDetails | undefined,
      ) => {
        const { value, errors } = details || {};
        console.log(
          `Selected date: ${dateAdapter.isValid(date) ? dateAdapter.format(date, "DD MMM YYYY") : date}`
        );
        if (errors?.length && value) {
          console.log(
            `Error(s): ${errors
              .map(({ type, message }) => `type=${type} message=${message}`)
              .join(", ")}`
          );
          console.log(`Original Value: ${value}`);
        }
      },
    );

    return (
      <DatePicker
        selectionVariant="single"
        onSelectionChange={handleSelectionChange}
      >
        <DatePickerTrigger>
          <DatePickerSingleInput />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerSinglePanel />
        </DatePickerOverlay>
      </DatePicker>
    );
  };
  ```

  In addition to configuring adapters, `LocalizationProvider` offers props to define locale and fallback min/max dates for all date-based controls.

  Additional date adapters can be added , as long as they conform to the `SaltDateAdapter` interface.

  For more detailed examples, please refer to the documentation for `DateInput`, `Calendar`, and `DatePicker`.

- 33c8da5: Fix system status icons in content from using the component styles override
- Updated dependencies [5cf214c]
- Updated dependencies [bae6882]
- Updated dependencies [b272497]
  - @salt-ds/core@1.37.3
  - @salt-ds/date-adapters@0.1.0

## 1.0.0-alpha.55

### Minor Changes

- 91973ac: Added `DialogHeader` component to lab. `DialogHeader`'s update follows our standardized header for container components and app regions, and it can be added to provide a structured header for dialog. The header includes a title and actions that follows our Header Block pattern.

  ```typescript
  <Dialog open={open} onOpenChange={onOpenChange} id={id}>
    <DialogHeader
      header={<H2>Terms and conditions</H2>}
      actions={
        <Button
          aria-label="Close overlay"
          appearance="transparent"
          sentiment="neutral"
        >
          <CloseIcon aria-hidden />
        </Button>
      }
    />
    <DialogContent>
      <div>
        Only Chase Cards that we determine are eligible can be added to the
      Wallet.
      </div>
    </DialogContent>
  </Dialog>;
  ```

### Patch Changes

- 3cf8d99: Updated TabstripNext and TabNext to follow the new design guidelines and added dismissing and adding tabs.
- 6a08b82: Fixed circular dependencies in code.
- Updated dependencies [ae6e5c9]
- Updated dependencies [b395246]
- Updated dependencies [aced985]
- Updated dependencies [7432f62]
- Updated dependencies [0730eb0]
- Updated dependencies [1a29b4e]
- Updated dependencies [6b1f109]
- Updated dependencies [26bf747]
- Updated dependencies [6a08b82]
- Updated dependencies [dc5b3b3]
  - @salt-ds/core@1.37.2
  - @salt-ds/icons@1.13.0

## 1.0.0-alpha.54

### Patch Changes

- bb916f7: Removed the left padding from Static List.

## 1.0.0-alpha.53

### Minor Changes

- 5db28b8: Added `StaticList`, `StaticListItem`, `StaticListItemContent` component to lab.

  ```tsx
  <StaticList>
    <StaticListItem>
      <StaticListItemContent>
        <Text>New static list feature updates are available in lab</Text>
      </StaticListItemContent>
    </StaticListItem>
    <StaticListItem>
      <StaticListItemContent>
        <Text>New static list feature updates are available in lab</Text>
      </StaticListItemContent>
    </StaticListItem>
  </StaticList>
  ```

- 91639ec: ## StepperInput updates

  - Added `bordered` prop for a full border style
  - Changed `StepperInputProps` to extend `div` props instead of `Input`, to align with other input components
  - Added an optional event to `onChange`, when triggered by synthetic event
  - Added more keyboard interactions, e.g. Shift + Up / Down, Home, End.
  - Replaced `block` with `stepBlock` prop, which now explicitly defines the value that is increment or decrement, not a multiplier of `step`.

  ```tsx
  <StepperInput
    stepBlock={100}
    value={value}
    onChange={(_event, value) => {
      setValue(value);
    }
  />
  ```

### Patch Changes

- 3a9d518: DatePicker and Calendar API improvements

  - `CalendarCarousel` has been renamed to `CarouselDateGrid` so it's more obvious of the content
  - `Calendar` previously used `children` to define the `CalendarNavigation`.
    We have now changed that so the `children` defines `CalendarNavigation`, `CalendarWeekHeader` and `CalendarDateGrid`
    This enables more flexibility in both layout and configuration of the `Calendar` elements.
    A typical Calendar will now look like this,

  ```
  <Calendar selectionVariant="single" hideOutOfRangeDates>
     <CalendarNavigation />
     <CalendarWeekHeader />
     <CalendarDateGrid />
  </Calendar>
  ```

  `CalendarNavigation` - provides year/month dropdowns and forward/back controls for the visible month.
  `CalendarWeekHeader` - provides a header for `CalendarDateGrid` indicating the day of the week.
  `CalendarDateGrid` - provides a grid of buttons that represent the days from a calendar month.

  - cleaned up selection API, removed `select`, use `setSelectedDate` instead
  - fix issues with `Calendar` offset selection
  - updated examples, more consistent helper text, error text to match spec
  - test improvements to create a known state for tests and avoid failures based on locale differences
  - cleaned up Storybook imports in e2e tests

- 5eb77be: Fixed days in the calendar having the incorrect text color when part of a selection or hover range.

## 1.0.0-alpha.52

### Minor Changes

- 2999d0d: Remove `Slider` props, `pageStep`, `pushable`, `pushDistance`, `disabled`, `hideMarks`
  Updated `Marks` prop to recieve inline, bottom or all

### Patch Changes

- dccd349: Updated DatePicker to show validation status when set to read-only.
- 6013bf3: # Refactoring the `DatePicker` Component

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

## 1.0.0-alpha.51

### Minor Changes

- 888406d: Added bordered prop for `DateInput` component.

  Added examples for bordered style variant for DateInput and DatePicker.

  Added corner radius support for `DateInput` component in theme next.

  Added 1px gap between Date Input and the menu.

  Added borderedDropdown prop for `CalendarNavigation` component to display bordered months and year dropdown.

  ```
   <DatePicker bordered />
   <DateInput bordered />
  ```

  _Note: this Labs API will be refactored and re-aligned to the updated DatePicker approach via_ [PR 3716](https://github.com/jpmorganchase/salt-ds/pull/3716)

- ffc0dd4: Replaced TrackerStep's `state` prop with new `stage` and `status` props. Valid `stage` values are `"pending"` and `"completed"`. Valid `status` values are `"error"` and `"warning"`.
- 8f17df3: Update Dropdown classname to saltDropdownBase to fix them clashing with the dropdown in core

### Patch Changes

- e8d923c: Fix disabled out of bound dates still having a hover style

## 1.0.0-alpha.50

### Minor Changes

- 0008528: Added `SystemStatus`, `SystemStatusContent`, `SystemStatusActions` component to lab.

  ```tsx
  <SystemStatus>
    <SystemStatusContent>
      <Text color="inherit">New feature updates are available</Text>
    </SystemStatusContent>
  </SystemStatus>
  ```

### Patch Changes

- bfe0f84: Cleaned up TypeScript types in multiple components.

## 1.0.0-alpha.49

### Minor Changes

- 62d917d: Updated styling of date picker and calendar

  - Corner radius support for date picker panel in theme next
  - Corner radius support for calendar selected days in theme next
  - Use accent color for today indicator and highlight color in calendar

  Closes #3530.

### Patch Changes

- da92421: Fix warning logged when access a child ref on React 19.

## 1.0.0-alpha.48

### Minor Changes

- c759347: Added `visibleMonths` to control the number of visible months in a range `DatePicker`. The supports values are `1` or `2` (default).

  ```tsx
  <DatePicker selectionVariant="range" visibleMonths={1} />
  ```

- 6cde7ea: Removed `Divider` from lab and promoted to core.

### Patch Changes

- 50b03f5: Fix Range date picker cursor position after selection
- ba1dc07: - Exposed input values in dateInput's `onChange`.

  ```tsx
  <DatePicker onChange={(event, selectedDateInputValue: string | undefined) => {}}/>

   <DatePicker selectionVariant="range"
    onChange={(event, startDateInputValue: string | undefined, endDateInputValue: string | undefined) => {}}
  />
  ```

  - Removed `startDate`, `defaultStartDate`, `endDate`, and `defaultEndDate` in DatePicker.
  - Added `selectedDate`, `defaultSelectedDate` and `defaultOpen` in DatePicker.

## 1.0.0-alpha.47

### Minor Changes

- 400c730: Added Divider component—`Divider` provides a thin, unobtrusive line for grouping elements to reinforce visual hierarchy.

  ```tsx
  <Divider />
  <Divider variant={variant} orientation={orientation} />
  ```

### Patch Changes

- a92c421: Fixed date picker shown behind dialog. Fixed #3471

## 1.0.0-alpha.46

### Patch Changes

- 04a6fb86: - Remove validation logic from `DatePicker` to support integration through `FormField`.
  - Added `onSelect` `onSelectionChange` and `validationStatus` props to `DatePicker`.

## 1.0.0-alpha.45

### Minor Changes

- 375499e4: Removed `liveValue`, `showRefreshButton`, `ButtonProps` and `InputProps` props from `StepperInput`.
  Added `hideButtons` prop from `StepperInput` and updated to extend Input's `InputProps`.
- b9a6d1e8: - Fix calendar carousel receiving focus in firefox

  - Add DatePicker component to lab

  ```typescript
  <DatePicker />
  ```

  - Updated DateInput to integrate within DatePicker

- 25e38e48: TrackerStep now uses `--salt-status-success-foreground-decorative` and `--salt-status-info-foreground-decorative` instead of `--salt-status-success-foreground` and `--salt-status-info-foreground`.

### Patch Changes

- 579fe968: - Calendar aria-label format changed from 'MM YYYY' to 'Calendar, DD MMM YYYY'.
  - Calendar day aria-label format changed from 'DD/MM/YYYY' to 'DD MMM YYYY'.
  - Calendar navigation buttons aria-label format got simplified to 'Previous Month' and 'Next Month'.
  - Fix Calendar focused item getting lost when navigating trough calendar.
- 78e643f2: Changed `startDate` and `endDate` for `selectedDate` in DatePicker to align with Calendar props.
  Changed `defaultStartDate` and `defaultEndDate` for `defaultSelectedDate` in DatePicker to align with Calendar props.

## 1.0.0-alpha.44

### Patch Changes

- 92bb63a1: - fixed keyboard navigation between panel and dates in calendar
  - fixed highlight and today characteristics for previous months in calendar
- 894aaf0b: Calendar fixes:

  - Fixed mozilla div focus bug https://bugzilla.mozilla.org/show_bug.cgi?id=1069739 and added aria label to calendar for accessibility improvement.
  - Prevent event defaults in keyboard navigation.

## 1.0.0-alpha.43

### Minor Changes

- 542b6228: Removed `Menu`, `MenuItem`, `MenuTrigger`, `MenuPanel` and `MenuGroup` from labs and promoted to core.

## 1.0.0-alpha.42

### Minor Changes

- 059f6f7d: Submenu's now persist when the cursor moves from the menu to the body. This makes it easier to interact with submenus.
  Added `getVirtualElement` to Menu. To allow positioning Menu's relative to a custom reference area. This can be used to create a context menu.

  ```tsx
  <Menu
    getVirtualElement={() => ({
      getBoundingClientRect: () => ({
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      }),
    })}
  >
    <MenuPanel>
      <MenuItem>Copy</MenuItem>
      <MenuItem>Move</MenuItem>
      <MenuItem>Delete</MenuItem>
    </MenuPanel>
  </Menu>
  ```

## 1.0.0-alpha.41

### Minor Changes

- 884ce037: Removed `ParentChildLayout` from labs and promote to core.

## 1.0.0-alpha.40

### Minor Changes

- ae971d21: Remove `Overlay`, `OverlayTrigger`, `OverlayPanel`, `OverlayPanelCloseButton`, and `OverlayPanelContent` from labs and promote to core.
- ed32f6e0: Refactor of `ParentChildLayout`:

  - removes parentPosition and disableAnimation props
  - collapsedViewElement renamed to visibleView
  - reduced motion animation changed to fade in

### Patch Changes

- 0fe48b4f: Added `type="button"` to button elements to prevent some components submitting forms.
- a1dace8d: CarouselSlide's ButtonBar prop is now less strict and accepts more components

## 1.0.0-alpha.39

### Minor Changes

- 96c2ca62: Removed `SegmentedButtonGroup` from labs and promoted to core.
- 8ed621bc: Removed the `onClose` prop from `Overlay`, `onOpenChange` is now called for events that open/close the overlay.

  ```tsx
  export const ControlledOverlay = () => {
    const [open, setOpen] = useState(false);
    const onOpenChange = (newOpen: boolean) => setOpen(newOpen);

    return (
      <Overlay open={open} onOpenChange={onOpenChange}>
        <OverlayTrigger>
          <Button>Show Overlay</Button>
        </OverlayTrigger>
        <OverlayPanel>Overlay Content</OverlayPanel>
      </Overlay>
    );
  };
  ```

- ebe59171: Added `OverlayPanelCloseButton` and `OverlayPanelContent` components as children of `OverlayPanel`

  ```tsx
  export const OverlayWithCloseButton = ({ onOpenChange }: OverlayProps) => {
    const [open, setOpen] = useState(false);

    const onChange = (newOpen: boolean) => {
      setOpen(newOpen);
    };

    const handleClose = () => setOpen(false);

    return (
      <Overlay open={open} onOpenChange={onChange}>
        <OverlayTrigger>
          <Button>Show Overlay</Button>
        </OverlayTrigger>
        <OverlayPanel>
          <OverlayPanelCloseButton onClick={handleClose} />
          <OverlayPanelContent>Overlay Content</OverlayPanelContent>
        </OverlayPanel>
      </Overlay>
    );
  };
  ```

### Patch Changes

- f6202615: Visual updates to Calendar's "today" indicator and Tab's active indicator due to `--salt-size-indicator` being updated.

## 1.0.0-alpha.38

### Patch Changes

- 4adacc6b: Fix SegmentedButtonGroup's display name.
  Fix SegmentedButtonGroup's ref being applied incorrectly.

## 1.0.0-alpha.37

### Minor Changes

- 53a7f22c: Removed `DropdownNext`, `Option`, `OptionGroup` and `ComboBoxNext` from labs and promoted to core.
- 6cdfe94e: Add `SegmentedButtonGroup` to labs
  `SegmentedButtonGroup` should be used to display a list of actionable buttons, flush with separators

  ```tsx
  const SegmentedButtonGroup = () => (
    <SegmentedButtonGroup>
      <Button> Button </Button>
      <Button> Button </Button>
      <Button> Button </Button>
    </SegmentedButtonGroup>
  );
  ```

### Patch Changes

- 91074aa2: - Fixed tabs container height to fit its contents and display as block so it can take 100% width without an extra wrapper.

## 1.0.0-alpha.36

### Minor Changes

- 7d9436e0: Added pills to multi-select ComboBoxNext.
  Added `truncate` to ComboBoxNext which collapsing the ComboBoxNext to one line.

### Patch Changes

- 7d9436e0: Fixed DropdownNext and ComboBoxNext's list design.

## 1.0.0-alpha.35

### Minor Changes

- ff69de19: Remove `Dialog`, `DialogHeader`, `DialogContent`, `DialogActions`, and `DialogCloseButton` from labs and promote to core

### Patch Changes

- 517ce28b: Optional prop `id` is no longer passed down from `Overlay` to aria-labelledby in `OverlayPanel`
  aria-labelledBy should be passed down directly to the `OverlayPanel` via and id attached to the title element

  ```tsx
  export const Default = (): ReactElement => {
    const id = useId();
    return (
      <Overlay>
        <OverlayTrigger>
          <Button>Show Overlay</Button>
        </OverlayTrigger>
        <OverlayPanel aria-labelledby={id}>
          <h3 className={styles.contentHeading} id={id}>
            Title
          </h3>
          <div>
            Content of Overlay
            <Tooltip content={"im a tooltip"}>
              <Button>hover me</Button>
            </Tooltip>
          </div>
        </OverlayPanel>
      </Overlay>
    );
  };
  ```

- 0c4d186d: Fix tabstrip not collapsing when sharing parent with other items
- 54b8e1a9: Fixed Tab being deleted whilst editing Tab label and pressing backspace or delete

## 1.0.0-alpha.34

### Minor Changes

- f27ecfa7: Implemented corner radius for relevant components when used with theme next. Refer to [documentation](https://storybook.saltdesignsystem.com/?path=/docs/experimental-theme-next--docs) for more information.
- cba9f9b9: - Rename `DialogTitle` to `DialogHeader`
  - Change `DialogHeader` optional props `title` and `subtitle` to `header` and `preheader`
- 245301a9: Added `LinkCard` to lab.

  Use a Link card when the entire card should be clickable and navigate the user.

  ```tsx
  <LinkCard href="https://www.saltdesignsystem.com" target="_blank"></LinkCard>
  ```

- 8610999f: Remove `Drawer` and `DrawerCloseButton` from labs and promote to core
- cbe6c522: Removed `LinkCard` from lab and promoted to core.
- df15ac98: - Added `valueToString` to `DropdownNext` and `ComboBoxNext`. This replaces the `textValue` prop on `Option`s. This is needed when the value is different to the display value, or the value is not a string.
  - Removed `defaultValue` from `DropdownNext`.
  - Mousing over options will now set them to active.
  - Clearing the input will clear the list of active items.
  - `Option` will now use the value or the result from `valueToString` as its default children.

### Patch Changes

- 543c9ff2: Updates to calendar

  - Removed animations.
  - Visual updates to the component.
  - Updated the delay time for day tooltips.
  - Added `highlighted` days - characterized by a triangle in the top right corner that attributes an event to that day.
  - Added `disabled` days and made `unselectable` days focusable.

## 1.0.0-alpha.33

### Patch Changes

- 9d23fdce: Added `box-sizing: border-box` to:

  - `Dialog`
  - `DialogTitle`
  - `Drawer`
  - `FormLabel`
  - `InputLegacy`
  - `LayerLayout`
  - `List`
  - `Option`
  - `OptionList`
  - `TabNext`
  - `TabstripNext`
  - `TokenizedInputNext`
  - `TokenizedInput`

## 1.0.0-alpha.32

### Minor Changes

- 2771c6de: - Convert `Dialog Title` to accept props instead of a composable api

  - Optional Props `title` and `subtitle` added to `Dialog Title`
  - `Dialog Title` no longer accepts children
  - Optional `id` prop added to `Dialog` to announce the `title` and `subtitle` when using a screen reader

  ```tsx
  export const Default = (): ReactElement => {
    const [open, setOpen] = useState(false);
    const id = useId();

    const handleRequestOpen = () => {
      setOpen(true);
    };

    const onOpenChange = (value: boolean) => {
      setOpen(value);
    };

    const handleClose = () => {
      setOpen(false);
    };

    return (
      <>
        <Button onClick={handleRequestOpen}>
          Open default dialog
        </Button>
        <Dialog open={open} onOpenChange={onOpenChange} id={id}>
          <DialogTitle title="Terms and conditions" />
          <DialogContent>
            Dialog Content
            </StackLayout>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="cta" onClick={handleClose}>
              Accept
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };
  ```

- fc915775: - Refactored `Drawer` to use floating-ui and Salt's `Scrim`.

  - Fixced open prop to be false by default
  - Fixed `Floating Components` implementation of focus manager props from Floating UI
  - Added optional `DrawerCloseButton`.
  - Added optional props `disableScrim` and `diableDismiss`

  ```tsx
  export const DrawerTemplate = (): ReactElement => {
    const [open, setOpen] = useState(false);

    const handleRequestOpen = () => {
      setOpen(true);
    };

    const onOpenChange = (newOpen: boolean) => {
      setOpen(newOpen);
    };

    const handleClose = () => {
      setOpen(false);
    };

    return (
      <>
        <Button onClick={handleRequestOpen}>Open Drawer</Button>
        <Drawer open={open} onOpenChange={onOpenChange} style={{ width: 300 }}>
          <DrawerCloseButton onClick={handleClose} />
          <H2>Title</H2>
          <Text>Content of drawer</Text>
        </Drawer>
      </>
    );
  };
  ```

- 4ab245a7: - Add `disableScrim` as an optional prop preventing the Scrim from being rendered. Use case is for Desktop Environments

### Patch Changes

- 2e36ad0b: `TabstripNext`, `TabNext` and `AppHeader` have bene updated to use separable tokens.
- d9eaf511: Fixed DropdownNext and ComboBoxNext not working in desktop environemnts.
  Fixed DropdownNext not showing a placeholder when it's value was an empty string.
  Fixed DropdownNext and ComboBoxNext's lists not showing over Dialogs.

## 1.0.0-alpha.31

### Minor Changes

- de68031a: - Added `min` and `hideLabel` to LinearProgress and CircularProgress.
  - Removed `unit` from LinearProgress.
- 0e031a5c: Removed `CircularProgress` and `LinearProgress` from lab and promoted to core.
- 9d0b2a40: - Refactored `Dialog` to use floating-ui and Salt's `Scrim`.

  - Implement FloatingComponent for Desktop support
  - Added optional `disableDismiss` prop to prevent a click away dismissing the dialog.
  - Added a `size` prop which takes `small`, `medium` and `large`.

  ```tsx
  const AlertDialog = () => {
    const [open, setOpen] = useState(openProp);

    const handleRequestOpen = () => {
      setOpen(true);
    };

    const onOpenChange = (value: boolean) => {
      setOpen(value);
    };

    const handleClose = () => {
      setOpen(false);
    };

    return (
      <>
        <Button data-testid="dialog-button" onClick={handleRequestOpen}>
          Click to open dialog
        </Button>
        <Dialog
          size={"small"}
          role="alertdialog"
          status={"error"}
          open={open}
          onOpenChange={onOpenChange}
          initialFocus={1}
          disableDismiss
        >
          <DialogTitle>Delete Transaction</DialogTitle>
          <DialogContent>
            Are you sure you want to permanently delete this transaction
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="cta" onClick={handleClose}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };
  ```

- 604a7314: Add support for complex value options to ComboBoxNext and DropdownNext.

### Patch Changes

- bef0d509: Undeprecated `--salt-track-borderColor`, which was incorrectly deprecated in feb80146.
- 56af744e: Parent Child Layout

  Removed `parent-child-item` component. Replaced by `FlexItem`
  Renamed `stackedAtBreakpoint` prop to `collapseAtBreakpoint`
  Renamed `stackedViewElement` prop to `collapsedViewElement`
  Removed `orientation` prop
  Added `parentPosition` and `onCollapseChange` props

## 1.0.0-alpha.30

### Patch Changes

- b2b8dedb: Add vertical orientation for SteppedTracker

## 1.0.0-alpha.29

### Minor Changes

- f8fec5ab: Update Overlay to use floating-ui. Supports placement on top (default), right, bottom, and left.

  ```tsx
  const OverlayTemplate = (props: OverlayProps) => {
    const { style, ...rest } = props;
    const id = "salt-overlay";

    return (
      <Overlay id={id} {...rest}>
        <OverlayTrigger>
          <Button>Show Overlay</Button>
        </OverlayTrigger>
        <OverlayPanel style={style}>
          <h3 id={`${id}-header`}>Title</h3>
          <div id={`${id}-content`}>Content of Overlay</div>
        </OverlayPanel>
      </Overlay>
    );
  };
  ```

- 8f0012b7: Removed `FileDropZone` from lab and promoted it to core.

## 1.0.0-alpha.28

### Minor Changes

- 69549229: Removed `Scrim` from Lab and moved it to Core.
- 907397e2: Removed NavigationItem from lab and promoted it to core
- b2dd61d7: Removed Pagination from lab

## 1.0.0-alpha.27

### Minor Changes

- ebe9feca: - Focus trap behavior is no longer managed by Scrim. Props related to this behavior such as `autoFocusRef`, `disableAutoFocus`, `disableFocusTrap`, `disableReturnFocus`, `fallbackFocusRef`, `returnFocusOptions` an `tabEnabledSelectors`, have been removed.
  - Removed `onBackDropClick` prop. Use `onClick` instead.
  - Removed `closeWithEscape` and `onClose` props. You can handle this outside of the scrim.
  - Removed `enableContainerMode` and `containerRef` props and added `fixed` prop. The default behavior is now for the scrim to fill its container, and you can use the `fixed` prop to fill the viewport.
  - Removed `zIndex` prop. You can change the `zIndex` using CSS.
  - Removed `ScrimContext`.
- 18576480: Refactor Combo Box Next and Dropdown Next to use compositional APIs.

  ## Dropdown Next

  ```tsx
  <DropdownNext>
    {colors.map((color) => (
      <Option value={color} key={color}>
        {color}
      </Option>
    ))}
  </DropdownNext>
  ```

  ## Combo Box Next

  ```tsx
  <ComboBoxNext>
    {colors.map((color) => (
      <Option value={color} key={color}>
        {color}
      </Option>
    ))}
  </ComboBoxNext>
  ```

- 91d22148: Removed `pillNext` from Lab and promoted it to Core.

### Patch Changes

- d9ce0737: Replaced incorrect usage of nullish operators.
- bbc4ccb1: Added TokenizedInputNext to lab.

  Tokenized input provides an input field for text that’s converted into a pill within the field, or tokenized, when the user enters a delimiting character.

  ```tsx
  <TokenizedInputNext />
  ```

- e668b2d6: Navigation Item

  - Updated the logic to make Navigation Item act like a button when `href` isn't passed.
  - Fixed styles.

## 1.0.0-alpha.26

### Minor Changes

- 641197da: - Removed `onClose` prop from `Pill`. Pill has been updated to support only one action. The `onClick`prop can be used instead.
  - Remove `icon` prop from `Pill`. An icon can be added as a children instead.

### Patch Changes

- 70fad5a1: Updated @floating-ui/react to 0.26.5.
- c49c246e: Removed redundant Icon color overrides.
- 61072b78: Changes to Pagination:

  - Removed `compact` prop from `Pagination` component. Replaced by new `CompactPaginator` composition component
  - Removed `showPreviousNext` and `FormFieldProps` from `Paginator` component.
  - Added `CompactPaginator` for the compact version of pagination.
  - Removed `FormFieldProps` from `GoToInput` component and added `inputRef` and `inputVariant`

## 1.0.0-alpha.25

### Minor Changes

- 1d292f2e: Refactored FileDropZone.

  - FileDropZone has been split into three composible pieces: FileDropZone, FileDropZoneIcon and FileDropZoneTrigger.
  - Validation is handled outside of the component. `onFilesAccepted`, `onFilesRejected` and `validate` have been replaced with `onDrop` and `status`.
  - Aligned styling to Salt.

### Patch Changes

- f7fcbd11: Fixed issue where components are not injecting their styles.

## 1.0.0-alpha.24

### Patch Changes

- d9794a06: Fix global css clashing issues by replacing un-prefixed classes .root and .rootDisabledAlpha in ColorPicker with prefixed (.saltColorChooserPicker-root and .saltColorChooserPicker-rootDisabledAlpha)
- 7e352933: Removed left and right padding from TabstripNext for the inline variant.

## 1.0.0-alpha.23

### Patch Changes

- 2fd8c03c: Pill's `className` prop is now forwarded to its wrapper instead of the nested button.

## 1.0.0-alpha.22

### Minor Changes

- 966c362f: Expose a CSS file that allows Salt to be used without runtime CSS injection.

```tsx
import "@salt-ds/lab/css/salt-lab.css";
```

- 01fa27ad: Removed Badge from Lab and promoted it to Core.
- feb80146: **_Theming and CSS updates_** with visual change to Salt components.

  1. `Drawer`, `Dialog`, and `Scrim` components overlay colour updated from black to white in light mode.

  2. `Badge` component line height in HD updated from 11px to 10px.

  **_Theming and CSS updates_** with no visual change to `Pill` component. `Pill` CSS tokens have been updated to match design specs.

### Patch Changes

- 7023034a: Fix Combobox input's `onChange` and `onKeyDown` not being invoked.
- 0ddc1e42: Removed default min width styling in `Pill`. Smaller Pills should look cleaner.
- 9dbe7f4c: Fixed component text properties (`font-weight`, `font-family`, `font-size`, `line-height`) incorrectly inheriting external global styles, which should follow the text characteristic from the Salt theme.

  - Content Status
  - Dialog
  - Form Field Legacy
  - List
  - List Next
  - Tab
  - Tab Next
  - Toolbar

## 1.0.0-alpha.21

### Patch Changes

- f3143bb9: Fixed Badge occupying space when it is anchored to a child component.
- c5aede9b: Fix Combo Box Next `onChange` using stale values
- 26cc1b2a: Aligned height of inline tab to design

## 1.0.0-alpha.20

### Minor Changes

- 363a00a4: Removed Switch from Lab and promoted it to Core.
- bbd411a7: Added support for closable pills. Pills can now contain a close button that when triggered will call a function passed to the `onClose` prop.

  ```
  const handleClose = () => {
    console.log("closed");
  };

  <Pill onClose={handleClose}>Closable Pill</Pill>
  ```

### Patch Changes

- c9ee2c5d: Fixed Dropdown losing focus when clicking on the scrollbar or when selecting options.
  Focusing the Combo Box will not open the list automatically. This complies with [WCAG SC 3.2.1](https://www.w3.org/WAI/WCAG21/Understanding/on-focus.html).
- 0b8bfac6: Fixed Switch's label being misaligned.
- dba77589: Fixed Combo Box Next not applying a ref to its `DefaultListItem`.

## 1.0.0-alpha.19

### Minor Changes

- 01f3a2b3: - Remove `showInfo` prop in both `LinearProgress` and `CircularProgress` components
  - Update Progress component dimensions, track and bar size, progress value font size
  - Align Progress CSS tokens with latest design tokens

### Patch Changes

- 7e143979: Tabs Next

  - Add `activeColor`, `isActive`, `activate` and `variant` props to TabNext
  - Add `activeColor`, `isActive`, `activate` and `variant` values to TabNext context
  - Update TabNext and TabstripNext styles to match specs
  - Add `activeColor`, `align`, `value`, `defaultValue` and `variant` props to TabstripNext

- 191f1ff9: - Amend Navigation Item class names
  - Tweak Navigation item styles to match new specs

## 1.0.0-alpha.18

### Patch Changes

- 49614c3a: - Fixed Swatch not injecting CSS.
  - Fixed Swatch not showing a border for gray and white swatches.
  - Fixed Contact Metadata Item's font color.
  - Fixed Metric Header subtitle's font color.
  - Fixed Pill's style issues caused by CSS specificity.
  - Fixed the margin of Stepper Input's decrement button.
  - Fixed the size of Tokenized Input's expand button.
- 9dd3160b: Removes small close icon in closeable Tab
- 4aa50dd1: Adjust spacing in `NavigationItem`

## 1.0.0-alpha.17

### Minor Changes

- da568ca4: Added `onSelect` to `Dropdown`
- 23abebe7: Changes to Combo Box

  - Fix controlled implementation.
  - Removed `InputProps`.
  - Added `onListChange` and controlled props `inputValue` `defaultInputValue`.
  - Exposed `onSelect` in `ComboBox`.
  - Added `inputValue` and `defaultInputValue` to `useComboBox`.

- 05275590: Changes to `ListNext`

  - Added `onSelect` to `ListNext` and `useList`
  - Fixed onChange implementation in `useList`

### Patch Changes

- 3602f2fa: Add SaltProvider to drawer
- 99fafaee: - Change `NavigationItem` flex alignment so it works well with longer labels
  - Rename `blurSelected` prop to `blurActive`
  - Update description on `blurSelected` prop
  - Move `ConditionalWrapper` into separate file
- f6a06c7c: Add SaltProvider to Dialog
- 5247b7bd: - Make combo box controlled prop inputValue optional
  - Add z-index to combobox list
  - Increase specificity for list css
- 402e13f7: Browser compatibility CSS changes.

  Added missing prefix to `appearance` and revert `padding-inline`, `padding-block` and `margin-block` to improve browser compatibility with Chrome 79

- e356a06d: - Add z-index to dropdown list
  - Increase specificity for list css

## 1.0.0-alpha.16

### Minor Changes

- 0a07e0cf: Added ComboBox component to labs

  Combo Box helps users select an item from a large list of options without scrolling. The typeahead functionality makes this selection quicker, easier, and reduces errors.
  Users can see a list of available options when they click on the component and filter the list as they type. Once they’ve made their selection, it populates the field and the overlay list closes.

  ```tsx
  const handleChange = (
    event: SyntheticEvent,
    data: {
      value: string;
    },
  ) => {
    console.log("input value changed", data);
  };

  const handleSelect = (event: SyntheticEvent<HTMLInputElement>) => {
    console.log("selected item", event.currentTarget.value);
  };
  return (
    <ComboBoxNext
      onChange={handleChange}
      onSelect={handleSelect}
      source={["Option 1", "Option 2", "Option 3"]}
    />
  );
  ```

- fb7f67f7: Combo box changes

  - changed `itemRenderer` for `ListItem`.
  - Added box shadow `--salt-overlayable-shadow-popout` to internal `List`.

- e067c4ab: DropdownNext

  - Added `DropdownNext` component

  ```tsx
  <DropdownNext source={source} defaultSelected={defaultSelected} {...props} />
  ```

- cbfc1b99: Change Dialog to use floating-ui, add useDialog hook.

  Alert dialog example:

  ```tsx
  <Dialog
    status="warning"
    role="alertdialog"
    open={open}
    onOpenChange={handleOpenChange}
  >
    <DialogTitle>Warning Alert Title</DialogTitle>
    <DialogContent>Alert description</DialogContent>
    <DialogActions>
      <Button>Cancel</Button>
      <Button variant="cta">Ok</Button>
    </DialogActions>
  </Dialog>
  ```

  Content dialog example:

  ```tsx
  <Dialog open={open} onOpenChange={handleOpenChange}>
    <DialogTitle accent>Dialog Title</DialogTitle>
    <DialogContent>Dialog content...</DialogContent>
    <DialogActions>
      <Button
        style={{ marginRight: "auto" }}
        variant="secondary"
        onClick={handleClose}
      >
        Cancel
      </Button>
      <Button onClick={handleClose}>Previous</Button>
      <Button variant="cta" onClick={handleClose}>
        Next
      </Button>
    </DialogActions>
    <DialogCloseButton onClick={() => handleOpenChange(false)} />
  </Dialog>
  ```

### Patch Changes

- a58e83ae: - Rename `NavItem` to `NavigationItem`
  - Change component so it either renders a `Button` or a `Link` depending on whether it has children
  - Rename `ExpansionButton` to `ExpansionIcon` as this is no longer a button
  - Small styling tweaks
- 0930d64a: Fixed Logo Image sometimes being too large and made Logo work better when a separator is omitted.
- 92a5e3ef: Navigation Item

  - Remove `IconComponent` and `BadgeComponent` props (these can be passed as children)
  - Small styling tweaks

## 1.0.0-alpha.15

### Minor Changes

- b2ca1f11: Remove MultilineInput from labs and promote to core
- f353c3ac: Removed `ControlLabel`.
- 8c77cdb2: - Fixed tab in `ListNext` keyboard navigation
  - Exposed `setSelectedItem` and `setHighlightedItem` from useList.
- 894f7e07: Changes to Badge:

  - Renamed `BadgeContent` to `value`
  - Addition of inline styling when no child is passed to the component, enabling the badge to be used in other components e.g App Header
  - Truncation of numerical values > 3 characters or when max value is exceeded
  - Truncation of string values > 4 characters

  With Child:

  ```
  <Badge value={number} max={99}>
  <SettingsIcon/>
  <Badge/>
  ```

  No Child - Inline:

  ```
  <Badge value={string} />
  ```

### Patch Changes

- b0b58a0b: Increased the font-weight of Stepped Tracker labels
- fa6f54b3: Fixed Linear Progress's bar not animating to the beginning on reset
- f9291944: Removed truncation and tooltip behaviour from Stepped Tracker. After re-assessment it was judged that simply wrapping advising against long labels and wrapping text where necessary was preferable.
- 97719a52: Removed unit, renderInfo and disabled props from Circular Progress and Linear Progress.
- f353c3ac: Updated Switch's styling
  Refactored Switch and updated its change handler.

  ```diff
  - const Controlled: StoryFn<typeof Switch> = (args) => {
  -   const [checked, setChecked] = useState(false);
  -
  -   const handleChange = (
  -     _: ChangeEvent<HTMLInputElement>,
  -     isChecked: boolean
  -   ) => {
  -     setChecked(isChecked);
  -   };
  -
  -   return <Switch {...args} checked={checked} onChange={handleChange} />;
  - };
  + const Controlled: StoryFn<typeof Switch> = (args) => {
  +   const [checked, setChecked] = useState(false);
  +
  +   const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
  +     setChecked(event.target.checked);
  +   };
  +
  +   return <Switch {...args} checked={checked} onChange={handleChange} />;
  + };
  ```

- 52d7284e: Added controlled version of ListNext

  - Added `highlightedItem`, `selected` and `onChange` props to `ListNext` in order to support a controlled list.
  - Removed `selected`, from `ListNextItem` so state only gets controlled by list.
  - Exposed `selectedItem` and `highlightedItem` from useList.
  - Fixed `onChange` not being called on keyboard selection.
  - Fixed focus ring when focusing on disabled `ListNextItem`.

- 4f20e54c: Remove string truncation from Badge.
  Change default max to `999` for Badge.
- 678ec785: NavItem

  - Add nav item props for `blurSelected` state (when a nav item has active children), `IconComponent` and `BadgeComponent`
  - Update component styling to match designs
  - Remove `ChevronDownIcon` from horizontal expansion button as per designs

- bc24788c: Fix spacing imbalance in SteppedTracker
- 00feb5f9: Drawer

  - Replace `Scrim` with `FloatingFocusManager`
  - Remove `disableScrim`, `disableAnimations` and `scrimProps` props
  - Rename prop `isOpen` to `open` and add `onOpenChange` prop to allow component to be dismissed when clicking outside or pressing `Esc`

- 90e4604b: Add ToastGroup

  ```
  <ToastGroup>
    <Toast status="success">
      <ToastContent>
        <Text>
          <strong>Project file upload</strong>
        </Text>
        <div>Project file has successfully uploaded to the shared drive. </div>
      </ToastContent>
      <Button variant="secondary" onClick={closeToast}>
        <CloseIcon />
      </Button>
    </Toast>
    <Toast>
      <ToastContent>
        <Text>
          <strong>File update</strong>
        </Text>
        <div>A new version of this file is available with 37 updates. </div>
      </ToastContent>
      <Button variant="secondary" onClick={closeToast}>
        <CloseIcon />
      </Button>
    </Toast>
  </ToastGroup>
  ```

## 1.0.0-alpha.14

### Minor Changes

- 05c77e70: Add Pill

  ```tsx
  <Pill onClick={handleClick}>
      Pill
  </Pill>


  <Pill icon={<FavoriteIcon/>} onClick={handleClick}>
      Pill With Icon
  </Pill>
  ```

### Patch Changes

- 7857a11d: Added a story to show how character count can be implemented as an adornment.
- 2c6d86dd: Drawer

  - Added `Drawer` component

  ```
  const [open, setOpen] = useState(false);
  const show = () => setOpen(true);
  const hide = () => setOpen(false);
  <>
   <Button onClick={show}>Open Drawer</Button>
   <Drawer isOpen={open}>
    <div>
     <p>Drawer content</p>
     <Button onClick={hide}>Close Drawer</Button>
    </div>
   </Drawer>
  </>
  ```

- a5bb0a41: Remove Toast and ToastContent from lab and promote to core.
- abfc4364: Corrected the minimum supported version of React. It has been updated to 16.14.0 due to the support for the new [JSX transform](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)
- b93d2e4a: Changes to `CircularProgress` and `LinearProgress`:

  - Removed size prop
  - Added max prop for custom max value
  - Removed variant props

  Changes to `StatusIndicator`:

  - Removed use of `size` prop from CircularProgress

- a3ac536a: MultilineInput design update: When there is only a status adornment present, adornment is at the end of the row, inline with the text area. When there is a status adornment along with end adornments, these will take up an entire row below the textarea.
- 722228c6: SteppedTracker

  - Added `SteppedTracker` component
  - Includes the `TrackerStep` and `StepLabel` subcomponents

  Usage:

  ```jsx
  <SteppedTracker activeStep={1}>
    <TrackerStep>
      <StepLabel state="completed">Step 1</StepLabel>
    <TrackerStep>
    <TrackerStep>
      <StepLabel>Step 2</StepLabel>
    <TrackerStep>
    <TrackerStep>
      <StepLabel>Step 3</StepLabel>
    <TrackerStep>
  </SteppedTracker>
  ```

- 6ff7c9a7: Fixed alignment styling of adornments in MultilineInput
  Fixed padding of Multiline when readonly with and without a full border
  Fixed height of textarea fixed to number of rows
  Fixed placeholder styling in MultilineInput
- ea867cd2: Rename `fullBorder` prop in MultilineInput to `bordered`

## 1.0.0-alpha.13

### Minor Changes

- 00f04b17: Remove ToggleButton and ToggleButtonGroup from lab and promote to core.
- 58cf03cf: Remove AccordionGroup, AccordionPanel, Accordion, AccordionHeader from lab and promote to core

### Patch Changes

- ff3eea5d: Add Toast component

  - Add ToastContent component

  ```js
  <Toast {...args}>
    <ToastContent>Toast content</ToastContent>
    <Button variant="secondary">
      <CloseIcon />
    </Button>
  </Toast>
  ```

## 1.0.0-alpha.12

### Minor Changes

- 95188004: Added `MultilineInput` component with fixed number of rows
- 27139c5c0: Realign Accordion to our design language

Before:

```tsx
<Accordion expandedSectionIds={expanded} onChange={handleChange}>
  <AccordionSection id="accordion-0" key="AccordionSection0">
    <AccordionSummary>AccordionSummary0</AccordionSummary>
    <AccordionDetails>AccordionDetails0</AccordionDetails>
  </AccordionSection>
  <AccordionSection id="accordion-1" key="AccordionSection1">
    <AccordionSummary>AccordionSummary1</AccordionSummary>
    <AccordionDetails>AccordionDetails1</AccordionDetails>
  </AccordionSection>
</Accordion>
```

After:

```tsx
<AccordionGroup>
  <Accordion
    expanded={expanded === "accordion-0"}
    value="accordion-0"
    onToggle={onChange}
  >
    <AccordionHeader>AccordionHeader0</AccordionHeader>
    <AccordionPanel>AccordionPanel0</AccordionPanel>
  </Accordion>
  <Accordion
    expanded={expanded === "accordion-1"}
    value="accordion-1"
    onToggle={onChange}
  >
    <AccordionHeader>AccordionHeader1</AccordionHeader>
    <AccordionPanel>AccordionPanel1</AccordionPanel>
  </Accordion>
</AccordionGroup>
```

### Patch Changes

- 79e9f4bc: `MultilineInput` is now compatible with `FormField`. `FormFieldLabel` can be styled as a question by using the new `pronounced` prop.
- 4329d8c7: Update Button and Toggle Button to have a fixed gap between icons and text.
- 78ee0b81: Removed unnecessary transition in List Item Next

## 1.0.0-alpha.11

### Minor Changes

- de5ab33b: Added `onSelect` to Dropdown. `onSelect` is called when any selection occurs and differs from `onSelectionChange`, which is only called when the selection changes.
- c2f3e7d8: Add new tabs components: TabstripNext, TabNext

  ```tsx
  <TabstripNext defaultSelected="Home">
    <TabNext value="home">Home</TabNext>
    <TabNext value="transactions">Transactions</TabNext>
    <TabNext value="loans">Loans</TabNext>
  </TabstripNext>
  ```

- 8ff0a974: Refactor ToggleButton to use a new API to simplify its usage.

  ```diff
  - <ToggleButtonGroup onChange={handleChange} selectedIndex={selectedIndex}>
  -  <ToggleButton aria-label="alert" tooltipText="Alert">
  -    <NotificationIcon /> Alert
  -  </ToggleButton>
  -  <ToggleButton aria-label="home" tooltipText="Home">
  -    <HomeIcon /> Home
  -  </ToggleButton>
  -  <ToggleButton aria-label="search" tooltipText="Search">
  -    <SearchIcon /> Search
  -  </ToggleButton>
  -  <ToggleButton aria-label="print" tooltipText="Print">
  -    <PrintIcon /> Print
  -  </ToggleButton>
  -</ToggleButtonGroup>
  +<ToggleButtonGroup onSelectionChange={handleChange} selected={selected}>
  +  <ToggleButton value="alert">
  +    <NotificationIcon aria-hidden /> Alert
  +  </ToggleButton>
  +  <ToggleButton value="home">
  +    <HomeIcon aria-hidden /> Home
  +  </ToggleButton>
  +  <ToggleButton value="search">
  +    <SearchIcon aria-hidden /> Search
  +  </ToggleButton>
  +  <ToggleButton value="print">
  +    <PrintIcon aria-hidden /> Print
  +  </ToggleButton>
  +</ToggleButtonGroup>
  ``

  ```

- 71fc7474: Add new list components: ListNext, ListItemNext

  ```
  <ListNext>
    <ListItemNext value={Alaska}>
      {Alaska}
    </ListItemNext>
  </ListNext>

  ```

### Patch Changes

- de5ab33b: Dropdown will now close when the already selected item is selected.
- f699f26d: Logo

  - Added `LogoImage` and `LogoSeparator` components
  - Removed `LogoTitle` component
  - Removed `compact` prop
  - Logo follows composition API

- 1fefbe74: Fixed issue where the Dialog heading overlapped when wrapped

## 1.0.0-alpha.10

### Minor Changes

- 9d68637a: Moved form-field-next and form-field-context-next to core as form-field and form-field-context

  `FormField`: First version of Form Field built with a compositional API by providing the following components alongside:
  `FormFieldHelperText`: Helper text component
  `FormFieldLabel`: Form label component (compatible with left and top placement)
  `FormFieldControlWrapper`: Styling container for controls used within Form Field

  `FormFieldContext`, `useFormFieldProps`: Context and hook for inner controls to respond to disabled, readonly, and validation state on the parent Form Field

- 22c626e6: **Breaking change**

  Rename `Input` to `InputLegacy`
  All API tokens with `--saltInput-` prefix changed to `--saltInputLegacy-` prefix

- bf5a9441: **Breaking change**

  Rename `FormField` to `FormFieldLegacy`
  All API tokens with `--saltFormField-` prefix changed to `--saltFormFieldLegacy-` prefix

- eb3db91c: Removed `startAdornment` and `endAdornment` props from `InputNext`. Props will be added back once adornments come in v2

  Moved input-next to core as input

  `Input`: First version of `InputNext` renamed to Input

  - All tokens prefixed `--saltInputNext-` changed to prefix `--saltInput-`

  Moved status-adornment to core

  `StatusAdornment`: Component to be used for validation status indication

- 24f44d8a: Add docs for InputNext
- 3e6441df: **Nav Item**

  Nav Item allows you to compose Navigation patterns.

  ```tsx
  <NavItem active parent expanded href="#" onExpand={(event) => {}}>
    Nav Item
  </NavItem>
  ```

- c82a39ab: `FormFieldNext` tests
  Added back `a11yValueAriaProps` type for `a11yProps` in `FormFieldContextNextValue`
  Added `id={a11yProps?.["aria-describedby"]}` to helper text
  Added `id={a11yProps?.["aria-labelledby"]}` to label
- 95a360b8: `InputNext`: `InputProps` interface changed to extend `Omit<ComponentPropsWithoutRef<"div">,"defaultValue">, Pick<ComponentPropsWithoutRef<"input">, "disabled" | "value" | "defaultValue">`

  `ref` prop moved to target container div: for direct ref on input component, use new `inputRef` prop

- d78ff537: Refactored all components to use new style injection mechanism provided by `@salt-ds/styles`

### Patch Changes

- fef8ef56: Banner changes:

  - Remove `emphasize`, `announcement` and `disableAnnouncer` props
  - Add `variant` prop
  - Replace `BannerCloseButton` component with `BannerActions`

- 46af9f8c: Move Banner to core

## 1.0.0-alpha.9

### Minor Changes

- 4bd407b6: Fix Tabstrip crashing when `activeTabIndex` is set to null
- 3aba7cc0: Fixed id in `FormFieldNext`, and ids in `FormFieldLabel` and `FormFieldHelperText` from useFormFieldPropsNext
  Deleted `a11yValueAriaProps`, replaced `a11yProps` type with `A11yValueProps` in `FormFieldContextNext`
- e7230ade: Added `textAlign` prop to `InputNext` with possible configurations: "left" (default), "right", "center"
- 2d63d305: Changes to Form Field and Input CSS:

  - fixes background color when disabled
  - fixes cursor on helper text
  - fixes activation indicator width on active state
  - usage of `grid-template-areas`

  Removes CSS API variables:

  ```diff
  - --saltInputNext-borderColor-active
  - --saltInputNext-borderColor-hover
  - --saltInputNext-borderColor-focused
  - --saltInputNext-borderWidth
  - --saltInputNext-borderStyle
  - --saltInputNext-borderRadius
  - --saltInputNext-cursor
  ```

### Patch Changes

- 922b1fb8: Updated Banner to use the new spacing foundation

## 1.0.0-alpha.8

### Minor Changes

- 2e04f9bc: Moved `useFormFieldPropsNext` and `FormFieldContextNext` to `./form-field-context-next`
  Move `a11yValueAriaProps`, `A11yValueProps` to `FormFieldContextNext`
- b8ef52a3: Add `emptyReadOnlyMarker` prop to `InputNext`
- c3b945f0: Removed `startAdornment` and `endAdornment` props in InputNext; adornments will come in Input v2

### Patch Changes

- ebf58d26: Banner

  - Remove `render` prop
  - Remove `Link` component from content
  - Create composable components `BannerContent` and `BannerCloseButton`

- 1e9ef1a2: Fix duplicate Salt libraries being installed when multiple libraries are installed

## 1.0.0-alpha.7

### Minor Changes

- 562ddb0c: Added `endAdornment` and `startAdornment` props to `InputNext`
- eeb45421: Switch `FormFieldNext` to use a compositional based API

  ```jsx
  <FormFieldNext {...props}>
    <FormFieldLabel>My label</FormFieldLabel>
    <InputNext defaultValue="Value" />
    <FormFieldHelperText>Helper text</FormFieldHelperText>
  </FormFieldNext>
  ```

  Removed `helperText`, `label` props from `FormFieldNext`

  Removed `FormFieldLabelProps`
  Removed `FormFieldHelperTextProps`

- d0f97318: Added `validationStatus` to `InputNext`, `FormFieldNext`, `FormFieldContextNext`

  Added `StatusAdornment`, `ErrorAdornment`, `SuccessAdornment`, `WarningAdornment` components

  Removed `disabled` prop from `FormFieldHelperText`, `FormFieldLabel`

  Renamed `useA11yValueValue` to `u11yValueAriaProps`
  Removed `disabled` and `readOnly` out of `u11yValueAriaProps` and separated out `disabled`, `readOnly` within `FormFieldContextNext`
  Removed `useA11yValue` hook

  Removed `type`, `onChange` prop from InputNext

## 1.0.0-alpha.6

### Minor Changes

- 8bcc9d04: Deprecated tertiary editable tokens: If needed, use `#00000066` as a replacement for `--salt-editable-tertiary-background-readonly`, and use `transparent` as a replacement for all remaining tokens
  Deprecated `tertiary` variant in FormField
- bf66b578: Deprecated -emphasize tokens in status and palette; replaced with default tokens

  `--salt-status-error-background-emphasize` replaced with `--salt-status-error-background`
  `--salt-status-info-background-emphasize` replaced with `--salt-status-info-background`
  `--salt-status-success-background-emphasize` replaced with `--salt-status-success-background`
  `--salt-status-warning-background-emphasize` replaced with `--salt-status-warning-background`

  `--salt-palette-error-background-emphasize` replaced with `--salt-palette-error-background`
  `--salt-palette-info-background-emphasize` replaced with `--salt-palette-info-background`
  `--salt-palette-success-background-emphasize` replaced with `--salt-palette-success-background`
  `--salt-palette-warning-background-emphasize` replaced with `--salt-palette-warning-background`

- 47132c22: Added `FormFieldNext` component with associated `FormFieldLabel` and `FormFieldHelperText` components
  Added `FormFieldContextNext`, `useFormFieldPropsNext`
  Added `InputNext` component

## 1.0.0-alpha.5

### Minor Changes

- 9bee69f4: Move `Checkbox` from lab to core
- ea010ffa: New `--salt-size-container-spacing` and `--salt-size-adornmentGap` tokens

  ```diff
  +  --salt-size-container-spacing: calc(3 * var(--salt-size-unit));
  +  --salt-size-adornmentGap: calc(0.75 * var(--salt-size-unit));
  ```

- 4a51e4c6: Remove Radio Button and Radio Button Group
- 85647494: Move capitalize util from lab to core

### Patch Changes

- 139633d5: Improve Tabs alignment in AppHeader
- 3e7a1b0f: Checkbox

  Removed `CheckboxBase` and replaced with `Checkbox`
  Added `error` prop for error state styling.

  CheckboxGroup

  Removed `legend` and `LegendProps` prop; will be implemented by FormField.
  Replaced `row` prop with `direction` prop.
  Added `wrap` prop.

  CheckboxIcon

  Added `error` prop for error state styling.
  Added `disabled` prop for disabled state styling.

- ae3c837e: Fix focus ring doesn't show up when Dropdown is wrapped in Form Field

## 1.0.0-alpha.4

### Minor Changes

- 974c92da: - New characteristics introduced in `accent`, new palette token

  ```diff
  + --salt-accent-background-disabled: var(--salt-palette-accent-background-disabled);
  + --salt-palette-accent-background-disabled
  ```

  - New characteristics introduced in `selectable`, new palette tokens

  ```diff
  + --salt-selectable-foreground: var(--salt-palette-interact-foreground);
  + --salt-selectable-foreground-disabled: var(--salt-palette-interact-foreground-disabled);
  + --salt-selectable-foreground-hover: var(--salt-palette-interact-foreground-hover);
  + --salt-selectable-foreground-selected: var(--salt-palette-interact-foreground-active);
  + --salt-selectable-foreground-selectedDisabled: var(--salt-palette-interact-foreground-activeDisabled);
  + --salt-palette-interact-foreground-active
  + --salt-palette-interact-foreground-activeDisabled
  + --salt-palette-interact-foreground-hover
  ```

  Updated values in light mode

  ```diff
  - --salt-palette-interact-foreground: var(--salt-color-gray-900);
  + --salt-palette-interact-foreground: var(--salt-color-gray-200);
  - --salt-palette-interact-foreground-disabled: var(--salt-color-gray-900-fade-foreground);
  + --salt-palette-interact-foreground-disabled: var(--salt-color-gray-200-fade-foreground);
  - --salt-palette-interact-foreground-hover: var(--salt-color-gray-500);
  + --salt-palette-interact-foreground-hover: var(--salt-color-blue-500);
  ```

  Updated values in dark mode

  ```diff
  - --salt-palette-interact-foreground: var(--salt-color-white);
  + --salt-palette-interact-foreground: var(--salt-color-gray-90);
  - --salt-palette-interact-foreground-disabled: var(--salt-color-white-fade-foreground);
  + --salt-palette-interact-foreground-disabled: var(--salt-color-gray-90-fade-foreground);
  - --salt-palette-interact-foreground-hover: var(--salt-color-gray-500);
  + --salt-palette-interact-foreground-hover: var(--salt-color-blue-500);
  ```

  - Deprecated the following `selectable` tokens, use `--salt-text-primary-foreground` and `--salt-text-primary-foreground-disabled` as replacements

  ```diff
  - --salt-selectable-cta-foreground
  - --salt-selectable-cta-foreground-disabled
  - --salt-selectable-primary-foreground
  - --salt-selectable-primary-foreground-disabled
  - --salt-selectable-secondary-foreground
  - --salt-selectable-secondary-foreground-disabled
  - --salt-selectable-foreground-partial
  - --salt-selectable-foreground-partialDisabled
  ```

  - `Measured` characteristic replaced with `Track`

  Deprecated tokens prefixed by `--salt-measured-` and corresponding palette tokens
  New `--salt-track-` tokens and corresponding palette tokens

  The following are a direct replacement mapping:

  ```diff
  - --salt-measured-borderStyle
  - --salt-measured-borderStyle-active
  - --salt-measured-borderStyle-complete
  - --salt-measured-borderStyle-incomplete
  + --salt-track-borderStyle
  + --salt-track-borderStyle-active
  + --salt-track-borderStyle-complete
  + --salt-track-borderStyle-incomplete
  - --salt-measured-borderWidth
  - --salt-measured-borderWidth-active
  - --salt-measured-borderWidth-complete
  - --salt-measured-borderWidth-incomplete
  + --salt-track-borderWidth
  + --salt-track-borderWidth-active
  + --salt-track-borderWidth-complete
  + --salt-track-borderWidth-incomplete
  - --salt-measured-fontWeight
  - --salt-measured-textAlign
  + --salt-track-fontWeight
  + --salt-track-textAlign
  - --salt-measured-background: var(--salt-palette-measured-background);
  - --salt-measured-background-disabled: var(--salt-palette-measured-background-disabled);
  - --salt-measured-borderColor: var(--salt-palette-measured-border);
  + --salt-track-background: var(--salt-palette-track-background);
  + --salt-track-background-disabled: var(--salt-palette-track-background-disabled);
  + --salt-track-borderColor: var(--salt-palette-track-border);
  + --salt-track-borderColor-disabled: var(--salt-palette-track-border-disabled);
  - --salt-palette-measured-background
  - --salt-palette-measured-background-disabled
  - --salt-palette-measured-border
  - --salt-palette-measured-border-disabled
  + --salt-palette-track-background
  + --salt-palette-track-background-disabled
  + --salt-palette-track-border
  + --salt-palette-track-border-disabled
  ```

  The following should be replaced with the corresponding `selectable` tokens:

  ```diff
  - --salt-measured-foreground: var(--salt-palette-measured-foreground);
  - --salt-measured-foreground-disabled: var(--salt-palette-measured-foreground-disabled);
  - --salt-measured-foreground-hover: var(--salt-palette-measured-foreground-active);
  - --salt-measured-foreground-active: var(--salt-palette-measured-foreground-active);
  - --salt-measured-foreground-activeDisabled: var(--salt-palette-measured-foreground-activeDisabled);
  - --salt-measured-borderColor-disabled: var(--salt-palette-measured-border-disabled);
  ```

  The following should be replaced with the corresponding `accent` background tokens:

  ```diff
  - --salt-measured-fill: var(--salt-palette-measured-fill);
  - --salt-measured-fill-disabled: var(--salt-palette-measured-fill-disabled);
  ```

  - Usages of `measured` tokens in core and labs components updated to use appropriate characteristic replacement

  - Deprecated the following tokens, use hex value as replacement if needed:

  ```diff
  - --salt-measured-foreground-undo: #2670a9
  - --salt-palette-measured-fill: #2670A9
  - --salt-palette-measured-fill-disabled: #2670A966
  - --salt-palette-measured-foreground-active: #2670A9
  - --salt-palette-measured-foreground-activeDisabled: #2670A966
  - --salt-palette-interact-foreground-partial: #155C93
  - --salt-palette-interact-foreground-partialDisabled: #155C93B3
  ```

- f1b7a60d: - Add `colorName` to `Color`. When `Color` is set to a color in the Salt color palette `colorName` will be set to the color's name.
  - Fix colors with an alpha value of 0 not being correctly recognized by `isTransparent`

### Patch Changes

- b0e390c5: RadioButton

  Removed `RadioButtonBase` and replaced with `RadioButton`
  Removed `icon` prop; icon is not customizable any more.
  Added `inputProps` prop to be passed to the radio input.
  Added `error` prop for error state styling.

  RadioButtonGroup

  Removed `icon` prop; icon is not customizable any more.
  Removed `legend` prop; will be implemented by FormField.
  Removed `radios` prop; should be the users' responsibility to provide the nested RadioButtons as children.
  Replaced `row` prop with `direction` prop.
  Added `wrap` prop.

  RadioButtonIcon

  Added `error` prop for error state styling.
  Added `disabled` prop for disabled state styling.

## 1.0.0-alpha.3

### Minor Changes

- 2e0fdff0: Deprecated `--salt-size-graphic-small`, `--salt-size-graphic-medium`, `--salt-size-graphic-large`
  Deprecated `--salt-size-divider-height`, `--salt-size-divider-strokeWidth`, replaced with `--salt-size-separator-height`, `--salt-size-separator-strokeWidth`
- 242941c9: Move `Avatar` from lab to core
- 9cae606a: Deprecated differential characteristic; replaced tokens with below
  Moved differential tokens to status characteristic
  Added 'static' status variant

  ```diff
  - --salt-differential-positive-foreground
  - --salt-differential-negative-foreground
  + --salt-status-positive-foreground
  + --salt-status-negative-foreground
  + --salt-status-static-foreground
  ```

## 1.0.0-alpha.2

### Minor Changes

- b1c5c32e: Move Spinner from lab to core
- 598991f8: Move `SplitLayout` from lab to core
  Changes in `SplitLayout`

  - Removed `FlexItem` wraps around `SplitLayout` children.
  - `SplitLayout` uses `startItem` and `endItem` props as children to allow for direction.
  - Added `direction` prop to `SplitLayout`.
  - Remove `wrap` since `SplitLayout` has `direction` to control wrap by breakpoints.
  - End Aligned `endItem` so the element is always at the end of the layout.

### Patch Changes

- 94423b3c: Remove the `small` and `medium` size values from `Spinner` and add a `default` size.
- 6c9e0413: Refactor Tooltip to wrap around trigger. This is to simplify the use of Tooltip by not having to use to useTooltip hook to pass the props.
  Remove `render` and `title` props, replaced by `content` prop.
  Use '@floating-ui/react' instead of '@floating-ui/react-dom-interactions', as it's deprecated.
  Remove unused TooltipContext
- f576be1e: Move useFloatingUI from Popper to utils

## 1.0.0-alpha.1

### Minor Changes

- 7e660a8d: More Card from lab to core
- b39e51b3: Move `Panel` from lab to core

### Patch Changes

- a0724642: Fix SSR support

## 1.0.0-alpha.0

### Major Changes

- c1bc7479: Salt is the J.P. Morgan design system, an open-source solution for building exceptional products and digital experiences in financial services and other industries. It offers you well-documented, accessible components as well as comprehensive design templates, style libraries and assets.

  With this initial release we're providing:

  - AG Grid Theme
  - Border Layout
  - Button
  - Data Grid
  - Flex Layout
  - Flow Layout
  - Grid Layout
  - Icon
  - Link
  - Salt Provider
  - Stack Layout
  - Status Indicator
  - Text
  - Theme

  And a number of other lab components.
