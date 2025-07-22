# @salt-ds/date-adapters

## 0.1.0-alpha.5

### Patch Changes

- a8ee89c: Upgrade peer dependencies for Luxon and its type definitions to the latest versions.

  - Updated peer dependency `luxon` from `^3.5.0` to `^3.6.1`.
  - Updated peer dependency `@types/luxon` from `^3.4.2` to `^3.6.2`.

  This upgrade includes improvements and bug fixes provided in the newer versions of Luxon and its type definitions. Ensure compatibility with your codebase by reviewing any changes in the Luxon API or type definitions. As these are peer dependencies, make sure that the consuming projects are also updated to these versions to avoid potential conflicts.

- 09cac7d: - Upgrade peer dependencies for `@salt-ds/date-adapters/date-fns` and its type definitions to the version 4.

  ```diff
    "peerDependencies": {
  -   "date-fns": "^3.6.0",
  +   "date-fns": "^4.1.0",
    }
  ```

  This upgrade is a breaking change for `date-fns`, mostly around inner types and ESM support.
  https://github.com/date-fns/date-fns/releases/tag/v4.0.0

  Ensure compatibility with your codebase by reviewing any changes in the `date-fns` API and type definitions.

  As these are peer dependencies, make sure that the consuming projects are also updated to these versions to avoid potential conflicts.

  - Added new `@salt-ds/date-adapters/date-fns-tz` adapter, a`date-fns` adapter with timezone support.

  ```diff package.json
    "peerDependencies": {
  -   "date-fns": "^3.6.0",
  +   "date-fns": "^4.1.0",
      }
  ```

  If you DO NOT require timezone support use `@salt-ds/date-adapters/date-fns`.
  If you DO require timezone support use `@salt-ds/date-adapters/date-fns-tz`.

  To use:

  ```
  import { AdapterDateFnsTZ } from "../date-fns-tz-adapter";
  import { enUS } from "date-fns/locale";

      <LocalizationProvider
        DateAdapter={AdapterDateFnsTZ}
        locale={enUS}
      >
      </LocalizationProvider>
  ```

  Creates a peer dependency on `@date-fns/tz`.

## 0.1.0-alpha.4

### Patch Changes

- 1a50f7b: Timezone support and simplified use of locale.

  - new `Timezone` type
    - "default", the default timezone of the date library will be used.
    - "system", the local system's timezone will be applied.
    - "UTC", the time will be returned in UTC.
    - string, a valid IANA timezone identifier, the time will be returned for that specific timezone.
  - `getTimezone` added to adapters, to return the timezone for the date (excluding date-fns, as v3 does not support timezones).
  - `setTimezone` added to adapters to set the timezone for the date (excluding date-fns, as v3 does not support timezones).
  - remove the need to pass a locale for `date`, `format`, `compare`, `parse`, `isValid`, `startOf`, `endOf`, `today`, `now`, `getDayOfWeekName`.
    If you previously passed locales to these functions, then remove the `locale` as `locale` is passed in to the adapter's constructor and treated as the default for allfunction calls.

  For `date-fns` we recommend v3, `date-fns` v4 requires Typescript v5, which will require a larger Salt upgrade. Our intention is to upgrade to support `date-fns` v4 before we move `DatePicker`, `Calendar`, `DateInput` components to core. Until the upgrade, if you require timezone support then use a date framework, that does support timezones, such as `luxon` or manage the timezone updates within your own code.

## 0.1.0-alpha.3

### Patch Changes

- ea84dd2: Fixed package entry points (main, module) pointing to non-existent file.

  Fixes [#4748](https://github.com/jpmorganchase/salt-ds/issues/4748).

## 0.1.0-alpha.2

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

## 0.1.0-alpha.1

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
