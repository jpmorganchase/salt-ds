# @salt-ds/date-adapters

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
