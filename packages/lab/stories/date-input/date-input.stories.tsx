import { withDateMock } from ".storybook/decorators/withDateMock";
import {
  Button,
  Dropdown,
  FlexItem,
  FlexLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  GridItem,
  GridLayout,
  Option,
  StackLayout,
  Text,
} from "@salt-ds/core";
import type { DateFrameworkType } from "@salt-ds/date-adapters";
import {
  DateInputRange,
  type DateInputRangeDetails,
  type DateInputRangeProps,
  DateInputSingle,
  type DateInputSingleDetails,
  type DateInputSingleProps,
  type DateRangeSelection,
  type SingleDateSelection,
  useLocalization,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { type SyntheticEvent, useCallback, useEffect, useState } from "react";
import { fn } from "storybook/test";

export default {
  title: "Lab/Date Input",
  component: DateInputSingle,
  decorators: [withDateMock],
} as Meta<typeof DateInputSingle>;

const DateInputSingleTemplate: StoryFn<DateInputSingleProps> = (args) => {
  const { dateAdapter } = useLocalization();
  function handleDateChange(
    event: SyntheticEvent,
    date: DateFrameworkType | null | undefined,
    details: DateInputSingleDetails,
  ) {
    console.log(
      `Selected date: ${dateAdapter.isValid(date) ? dateAdapter.format(date, "DD MMM YYYY") : date}`,
    );
    const { value, errors } = details;
    if (errors?.length) {
      console.log(
        `Error(s): ${errors
          .map(({ type, message }) => `type=${type} message=${message}`)
          .join(",")}`,
      );
      if (value) {
        console.log(`Original Value: ${value}`);
      }
    }
    args?.onDateChange?.(event, date, details);
  }

  return (
    <div style={{ width: "250px" }}>
      <DateInputSingle {...args} onDateChange={handleDateChange} />
    </div>
  );
};

const DateInputRangeTemplate: StoryFn<DateInputRangeProps> = (args) => {
  const { dateAdapter } = useLocalization();

  function handleDateChange(
    event: SyntheticEvent,
    date: DateRangeSelection<Date> | null,
    details: DateInputRangeDetails,
  ) {
    const { startDate, endDate } = date || {};
    const {
      startDate: {
        value: startDateOriginalValue,
        errors: startDateErrors,
      } = {},
      endDate: { value: endDateOriginalValue, errors: endDateErrors } = {},
    } = details;
    console.log(
      `StartDate: ${dateAdapter.isValid(startDate) ? dateAdapter.format(startDate, "DD MMM YYYY") : startDate}, EndDate: ${dateAdapter.isValid(endDate) ? dateAdapter.format(endDate, "DD MMM YYYY") : endDate}`,
    );
    if (startDateErrors?.length) {
      console.log(
        `StartDate Error(s): ${startDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
      );
      if (startDateOriginalValue) {
        console.log(`StartDate Original Value: ${startDateOriginalValue}`);
      }
    }
    if (endDateErrors?.length) {
      console.log(
        `EndDate Error(s): ${endDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
      );
      if (endDateOriginalValue) {
        console.log(`EndDate Original Value: ${endDateOriginalValue}`);
      }
    }
    args?.onDateChange?.(event, date, details);
  }
  return (
    <div style={{ width: "250px" }}>
      <DateInputRange
        // biome-ignore lint/suspicious/noExplicitAny: story args
        {...(args as any)}
        onDateChange={handleDateChange}
      />
    </div>
  );
};

export const Single = DateInputSingleTemplate.bind({});
Single.args = {
  onDateValueChange: fn(),
};

export const Range = DateInputRangeTemplate.bind({});
Range.args = {
  onDateValueChange: fn(),
};

export const SingleControlled: StoryFn<DateInputSingleProps> = (args) => {
  const { dateAdapter } = useLocalization();
  const [selectedDate, setSelectedDate] = useState<
    SingleDateSelection | null | undefined
  >(args?.date ?? null);

  function handleDateChange(
    event: SyntheticEvent,
    date: DateFrameworkType | null | undefined,
    details: DateInputSingleDetails,
  ) {
    console.log(
      `Selected date: ${dateAdapter.isValid(date) ? dateAdapter.format(date, "DD MMM YYYY") : date}`,
    );
    const { value, errors } = details;
    if (errors?.length) {
      console.log(
        `Error(s): ${errors
          .map(({ type, message }) => `type=${type} message=${message}`)
          .join(",")}`,
      );
      if (value) {
        console.log(`Original Value: ${value}`);
      }
    }
    setSelectedDate(date);
    args?.onDateChange?.(event, date, details);
  }

  return (
    <StackLayout style={{ width: "400px" }}>
      <DateInputSingle
        {...args}
        date={selectedDate}
        onDateChange={handleDateChange}
      />

      <FlexLayout>
        <Button onClick={() => setSelectedDate(null)}>reset</Button>
        <Button onClick={() => setSelectedDate(dateAdapter.today())}>
          set today
        </Button>
        <Button
          onClick={() =>
            setSelectedDate(dateAdapter.add(dateAdapter.today(), { days: 1 }))
          }
        >
          set tomorrow
        </Button>
      </FlexLayout>
    </StackLayout>
  );
};

export const RangeControlled: StoryFn<DateInputRangeProps> = ({
  date,
  ...args
}) => {
  const { dateAdapter } = useLocalization();
  const [selectedDate, setSelectedDate] = useState<
    DateRangeSelection | null | undefined
  >(date ?? null);

  const handleDateChange = useCallback(
    (
      event: SyntheticEvent,
      date: DateRangeSelection | null,
      details: DateInputRangeDetails,
    ) => {
      const { startDate, endDate } = date ?? {};
      const {
        startDate: {
          value: startDateOriginalValue = undefined,
          errors: startDateErrors = undefined,
        } = {},
        endDate: {
          value: endDateOriginalValue = undefined,
          errors: endDateErrors = undefined,
        } = {},
      } = details || {};
      console.log(
        `StartDate: ${dateAdapter.isValid(startDate) ? dateAdapter.format(startDate, "DD MMM YYYY") : startDate}, EndDate: ${dateAdapter.isValid(endDate) ? dateAdapter.format(endDate, "DD MMM YYYY") : endDate}`,
      );
      setSelectedDate({
        startDate:
          startDateOriginalValue?.trim().length === 0 ? null : startDate,
        endDate: endDateOriginalValue?.trim().length === 0 ? null : endDate,
      });
      if (startDateErrors?.length) {
        console.log(
          `StartDate Error(s): ${startDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
        );
        if (startDateOriginalValue) {
          console.log(`StartDate Original Value: ${startDateOriginalValue}`);
        }
      }
      if (endDateErrors?.length) {
        console.log(
          `EndDate Error(s): ${endDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
        );
        if (endDateOriginalValue) {
          console.log(`EndDate Original Value: ${endDateOriginalValue}`);
        }
      }
      args?.onDateChange?.(event, date, details);
    },
    [args?.onDateChange, dateAdapter],
  );

  return (
    <StackLayout style={{ width: "400px" }}>
      <DateInputRange
        {...args}
        date={selectedDate}
        onDateChange={handleDateChange}
      />
      <Text>Start Date</Text>
      <StackLayout
        direction={"row"}
        style={{
          width: "100%",
        }}
        gap={1}
      >
        <FlexItem>
          <Button
            onClick={() =>
              setSelectedDate({
                ...selectedDate,
                startDate: null,
              })
            }
          >
            reset
          </Button>
        </FlexItem>
        <FlexItem>
          <Button
            onClick={() =>
              setSelectedDate({
                ...selectedDate,
                startDate: dateAdapter.today(),
              })
            }
          >
            today
          </Button>
        </FlexItem>
        <FlexItem>
          <Button
            onClick={() =>
              setSelectedDate({
                ...selectedDate,
                startDate: dateAdapter.add(dateAdapter.today(), { days: 1 }),
              })
            }
          >
            tomorrow
          </Button>
        </FlexItem>
      </StackLayout>
      <Text>End Date</Text>
      <StackLayout
        direction={{
          sm: "row",
        }}
        style={{
          width: "100%",
        }}
        gap={1}
      >
        <FlexItem>
          <Button
            onClick={() =>
              setSelectedDate({
                ...selectedDate,
                endDate: null,
              })
            }
          >
            reset
          </Button>
        </FlexItem>
        <FlexItem>
          <Button
            onClick={() =>
              setSelectedDate({
                ...selectedDate,
                endDate: dateAdapter.today(),
              })
            }
          >
            today
          </Button>
        </FlexItem>
        <FlexItem>
          <Button
            onClick={() =>
              setSelectedDate({
                ...selectedDate,
                endDate: dateAdapter.add(dateAdapter.today(), { days: 1 }),
              })
            }
          >
            tomorrow
          </Button>
        </FlexItem>
      </StackLayout>
      <Text>Both</Text>
      <StackLayout
        direction={{
          sm: "row",
        }}
        style={{
          width: "100%",
        }}
        gap={1}
      >
        <FlexItem>
          <Button
            onClick={() =>
              setSelectedDate({
                startDate: null,
                endDate: null,
              })
            }
          >
            reset
          </Button>
        </FlexItem>
        <FlexItem>
          <Button
            onClick={() =>
              setSelectedDate({
                startDate: dateAdapter.today(),
                endDate: dateAdapter.add(dateAdapter.today(), { days: 1 }),
              })
            }
          >
            set
          </Button>
        </FlexItem>
      </StackLayout>
    </StackLayout>
  );
};
// Passing a date object to a Story, containing an invalid date, will cause Storybook to throw from toISOString()
RangeControlled.parameters = {
  docs: {
    source: {
      code: "Disabled for this story, see https://github.com/storybookjs/storybook/issues/11554",
    },
  },
};

export const SingleBordered = DateInputSingleTemplate.bind({});
SingleBordered.args = {
  bordered: true,
  onDateValueChange: fn(),
};

export const RangeBordered = DateInputRangeTemplate.bind({});
RangeBordered.args = {
  bordered: true,
  onDateValueChange: fn(),
};

export const EmptyReadOnlyMarker = DateInputSingleTemplate.bind({});
EmptyReadOnlyMarker.args = {
  emptyReadOnlyMarker: "-",
  readOnly: true,
  onDateValueChange: fn(),
};

export const SingleWithTimezone: StoryFn<typeof DateInputSingle> = (args) => {
  const { dateAdapter } = useLocalization();
  const timezoneOptions =
    dateAdapter.lib !== "date-fns"
      ? [
          "default",
          "system",
          "UTC",
          "America/New_York",
          "Europe/London",
          "Asia/Shanghai",
          "Asia/Kolkata",
        ]
      : ["default"];

  const [selectedTimezone, setSelectedTimezone] = useState<string>(
    timezoneOptions[0],
  );
  const [currentTimezone, setCurrentTimezone] = useState<string>("");
  const [iso8601String, setIso8601String] = useState<string>("");
  const [localeDateString, setLocaleDateString] = useState<string>("");
  const [dateString, setDateString] = useState<string>("");
  const [error, setError] = useState<string | undefined>(undefined);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset related state when timezone changes
  useEffect(() => {
    setCurrentTimezone("");
    setIso8601String("");
    setLocaleDateString("");
    setDateString("");
    setError(undefined);
  }, [selectedTimezone]);

  const handleDateChange: DateInputSingleProps["onDateChange"] = (
    _event,
    date,
    details,
  ) => {
    const isDateUnset =
      details?.errors?.length && details.errors[0].type === "unset";
    const hasError = details?.errors?.length;

    setError(
      !isDateUnset && hasError ? details?.errors?.[0].message : undefined,
    );

    if (isDateUnset || hasError) {
      setCurrentTimezone("");
      setIso8601String("");
      setLocaleDateString("");
      setDateString("");
      return;
    }

    const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const ianaTimezone =
      selectedTimezone !== "system" && selectedTimezone !== "default"
        ? selectedTimezone
        : undefined;

    const formatDate = (date: DateFrameworkType, hasError: boolean) => {
      if (hasError) return { iso: "", locale: "", formatted: "" };
      const jsDate = dateAdapter.toJSDate(date);
      const iso = jsDate.toISOString();
      const locale = new Intl.DateTimeFormat(undefined, {
        timeZone: systemTimeZone,
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      }).format(jsDate);
      const formatted = new Intl.DateTimeFormat(undefined, {
        timeZone: ianaTimezone,
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      }).format(jsDate);
      return { iso, locale, formatted };
    };

    setCurrentTimezone(date ? dateAdapter.getTimezone(date) : "");

    const formattedDate = date
      ? formatDate(date, isDateUnset || (!isDateUnset && !!hasError))
      : null;
    setIso8601String(formattedDate?.iso ?? "");
    setLocaleDateString(formattedDate?.locale ?? "");
    setDateString(formattedDate?.formatted ?? "");
  };

  const handleTimezoneSelect = (_e: SyntheticEvent, selection: string[]) => {
    setSelectedTimezone(selection[0]);
  };

  return (
    <GridLayout style={{ minWidth: "380px" }} gap={1}>
      <GridItem colSpan={6}>
        <FormField validationStatus={error ? "error" : undefined}>
          <FormFieldLabel>Enter a date</FormFieldLabel>
          <FormFieldHelperText>{error}</FormFieldHelperText>
          <DateInputSingle
            {...args}
            timezone={selectedTimezone}
            key={selectedTimezone}
            onDateChange={handleDateChange}
          />
        </FormField>
      </GridItem>
      <GridItem colSpan={6}>
        <FormField>
          <FormFieldLabel>Enter a timezone</FormFieldLabel>
          <Dropdown
            aria-label="timezone dropdown"
            selected={[selectedTimezone]}
            onSelectionChange={handleTimezoneSelect}
          >
            {timezoneOptions.map((tz) => (
              <Option key={tz} value={tz}>
                {tz}
              </Option>
            ))}
          </Dropdown>
        </FormField>
      </GridItem>
      <GridItem colSpan={12}>
        <FormField>
          <FormFieldLabel>Current timezone</FormFieldLabel>
          <span data-testid={"timezone"}>
            {currentTimezone?.length ? currentTimezone : "-"}
          </span>
        </FormField>
      </GridItem>
      <GridItem colSpan={12}>
        <FormField>
          <FormFieldLabel>ISO 8601 Format</FormFieldLabel>
          <span data-testid={"iso-date-label"}>
            {iso8601String?.length ? iso8601String : "-"}
          </span>
        </FormField>
      </GridItem>
      <GridItem colSpan={12}>
        <FormField>
          <FormFieldLabel>Date in current timezone</FormFieldLabel>
          <span data-testid={"timezone-date-label"}>
            {dateString?.length ? dateString : "-"}
          </span>
        </FormField>
      </GridItem>
      <GridItem colSpan={12}>
        <FormField>
          <FormFieldLabel>Date in current locale</FormFieldLabel>
          <span data-testid={"locale-date-label"}>
            {localeDateString?.length ? localeDateString : "-"}
          </span>
        </FormField>
      </GridItem>
    </GridLayout>
  );
};

export const RangeWithTimezone: StoryFn<typeof DateInputRange> = (args) => {
  const { dateAdapter } = useLocalization();
  const timezoneOptions =
    dateAdapter.lib !== "date-fns"
      ? [
          "default",
          "system",
          "UTC",
          "America/New_York",
          "Europe/London",
          "Asia/Shanghai",
          "Asia/Kolkata",
        ]
      : ["default"];

  const [selectedTimezone, setSelectedTimezone] = useState<string>(
    timezoneOptions[0],
  );
  const [currentTimezone, setCurrentTimezone] = useState<string>("");
  const [startIso8601String, setStartIso8601String] = useState<string>("");
  const [startLocaleDateString, setStartLocaleDateString] =
    useState<string>("");
  const [startDateString, setStartDateString] = useState<string>("");
  const [startDateError, setStartDateError] = useState<string | undefined>(
    undefined,
  );
  const [endIso8601String, setEndIso8601String] = useState<string>("");
  const [endLocaleDateString, setEndLocaleDateString] = useState<string>("");
  const [endDateString, setEndDateString] = useState<string>("");
  const [endDateError, setEndDateError] = useState<string | undefined>(
    undefined,
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset related state when timezone changes
  useEffect(() => {
    setCurrentTimezone("");
    setStartIso8601String("");
    setStartLocaleDateString("");
    setStartDateString("");
    setStartDateError(undefined);
    setEndIso8601String("");
    setEndLocaleDateString("");
    setEndDateString("");
    setEndDateError(undefined);
  }, [selectedTimezone]);

  const handleDateChange: DateInputRangeProps["onDateChange"] = (
    _event,
    date,
    details,
  ) => {
    const { startDate, endDate } = date as DateRangeSelection;
    const isStartDateUnset =
      details.startDate?.errors?.length &&
      details.startDate.errors[0].type === "unset";
    const hasStartDateError = details.startDate?.errors?.length;
    const isEndDateUnset =
      details.endDate?.errors?.length &&
      details.endDate.errors[0].type === "unset";
    const hasEndDateError = details.endDate?.errors?.length;

    setStartDateError(
      !isStartDateUnset && hasStartDateError
        ? details.startDate?.errors?.[0].message
        : undefined,
    );
    setEndDateError(
      !isEndDateUnset && hasEndDateError
        ? details.endDate?.errors?.[0].message
        : undefined,
    );

    const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const ianaTimezone =
      selectedTimezone !== "system" && selectedTimezone !== "default"
        ? selectedTimezone
        : undefined;

    const formatDate = (date: DateFrameworkType, hasError: boolean) => {
      if (hasError) return { iso: "", locale: "", formatted: "" };
      const jsDate = dateAdapter.toJSDate(date);
      const iso = jsDate.toISOString();
      const locale = new Intl.DateTimeFormat(undefined, {
        timeZone: systemTimeZone,
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      }).format(jsDate);
      const formatted = new Intl.DateTimeFormat(undefined, {
        timeZone: ianaTimezone,
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      }).format(jsDate);
      return { iso, locale, formatted };
    };

    if (startDate && !isStartDateUnset && !hasStartDateError) {
      const start = formatDate(
        startDate,
        isStartDateUnset || (!isStartDateUnset && !!hasStartDateError),
      );
      setStartIso8601String(start.iso);
      setStartLocaleDateString(start.locale);
      setStartDateString(start.formatted);
    } else {
      setStartIso8601String("");
      setStartLocaleDateString("");
      setStartDateString("");
    }
    if (endDate && !isStartDateUnset && !hasEndDateError) {
      const end = formatDate(
        endDate,
        isEndDateUnset || (!isEndDateUnset && !!hasEndDateError),
      );
      setEndIso8601String(end.iso);
      setEndLocaleDateString(end.locale);
      setEndDateString(end.formatted);
    } else {
      setEndIso8601String("");
      setEndLocaleDateString("");
      setEndDateString("");
    }

    setCurrentTimezone(startDate ? dateAdapter.getTimezone(startDate) : "");
  };

  const handleTimezoneSelect = (_e: SyntheticEvent, selection: string[]) => {
    setSelectedTimezone(selection[0]);
  };

  const startDateHelperText = startDateError
    ? `Start Date ${startDateError}`
    : undefined;
  const endDateHelperText = endDateError
    ? `End Date ${endDateError}`
    : undefined;

  return (
    <GridLayout style={{ minWidth: "380px" }} gap={1}>
      <GridItem colSpan={6}>
        <FormField
          validationStatus={
            startDateError || endDateError ? "error" : undefined
          }
        >
          <FormFieldLabel>Enter a date range</FormFieldLabel>
          <FormFieldHelperText>
            {startDateHelperText ?? endDateHelperText}
          </FormFieldHelperText>
          <DateInputRange
            {...args}
            timezone={selectedTimezone}
            key={selectedTimezone}
            onDateChange={handleDateChange}
          />
        </FormField>
      </GridItem>
      <GridItem colSpan={6}>
        <FormField>
          <FormFieldLabel>Select a Timezone</FormFieldLabel>
          <Dropdown
            aria-label="timezone dropdown"
            selected={[selectedTimezone]}
            onSelectionChange={handleTimezoneSelect}
            style={{ minWidth: "120px", width: "min-content" }}
          >
            {timezoneOptions.map((tz) => (
              <Option key={tz} value={tz}>
                {tz}
              </Option>
            ))}
          </Dropdown>
        </FormField>
      </GridItem>
      <GridItem colSpan={12}>
        <FormField>
          <FormFieldLabel>Current timezone</FormFieldLabel>
          <span data-testid={"timezone"}>
            {currentTimezone?.length ? currentTimezone : "-"}
          </span>
        </FormField>
      </GridItem>
      <GridItem colSpan={4}>
        <FormField>
          <FormFieldLabel>Start date in ISO8601 format</FormFieldLabel>
          <span data-testid={"iso-start-date-label"}>
            {startIso8601String?.length ? startIso8601String : "-"}
          </span>
        </FormField>
      </GridItem>
      <GridItem colSpan={8}>
        <FormField>
          <FormFieldLabel>End date in ISO8601 format</FormFieldLabel>
          <span data-testid={"iso-end-date-label"}>
            {endIso8601String?.length ? endIso8601String : "-"}
          </span>
        </FormField>
      </GridItem>
      <GridItem colSpan={4}>
        <FormField>
          <FormFieldLabel>Start date in current timezone</FormFieldLabel>
          <span data-testid={"timezone-start-date-label"}>
            {startDateString?.length ? startDateString : "-"}
          </span>
        </FormField>
      </GridItem>
      <GridItem colSpan={8}>
        <FormField>
          <FormFieldLabel>End date in current timezone</FormFieldLabel>
          <span data-testid={"timezone-end-date-label"}>
            {endDateString?.length ? endDateString : "-"}
          </span>
        </FormField>
      </GridItem>
      <GridItem colSpan={4}>
        <FormField>
          <FormFieldLabel>Start date in current locale</FormFieldLabel>
          <span data-testid={"locale-start-date-label"}>
            {startLocaleDateString?.length ? startLocaleDateString : "-"}
          </span>
        </FormField>
      </GridItem>
      <GridItem colSpan={8}>
        <FormField>
          <FormFieldLabel>End date in current locale</FormFieldLabel>
          <span data-testid={"locale-end-date-label"}>
            {endLocaleDateString?.length ? endLocaleDateString : "-"}
          </span>
        </FormField>
      </GridItem>
    </GridLayout>
  );
};
