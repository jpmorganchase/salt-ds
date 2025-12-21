import {
  Dropdown,
  type DropdownProps,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  GridItem,
  GridLayout,
  Option,
  StackLayout,
} from "@salt-ds/core";
import type { DateFrameworkType, Timezone } from "@salt-ds/date-adapters";
import { AdapterDateFns } from "@salt-ds/date-adapters/date-fns";
import { AdapterDayjs } from "@salt-ds/date-adapters/dayjs";
import { AdapterLuxon } from "@salt-ds/date-adapters/luxon";
import { AdapterMoment } from "@salt-ds/date-adapters/moment";
import {
  DateInputRange,
  type DateInputRangeProps,
  type DateRangeSelection,
  LocalizationProvider,
  useLocalization,
} from "@salt-ds/lab";
import {
  type ReactElement,
  type SyntheticEvent,
  useEffect,
  useState,
} from "react";

const Range = ({
  selectedTimezone,
}: {
  selectedTimezone: Timezone;
}): ReactElement => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();

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
    const { startDate, endDate } =
      date as DateRangeSelection<DateFrameworkType>;
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

    if (!isStartDateUnset && !hasStartDateError && startDate) {
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
    if (!isStartDateUnset && !hasEndDateError && endDate) {
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

  const startDateHelperText = startDateError
    ? `Start Date ${startDateError}`
    : undefined;
  const endDateHelperText = endDateError
    ? `End Date ${endDateError}`
    : undefined;

  return (
    <GridLayout gap={1}>
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
            timezone={selectedTimezone}
            key={selectedTimezone}
            onDateChange={handleDateChange}
          />
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
      <GridItem colSpan={6}>
        <FormField>
          <FormFieldLabel>Start date in ISO8601 format</FormFieldLabel>
          <span data-testid={"iso-start-date-label"}>
            {startIso8601String?.length ? startIso8601String : "-"}
          </span>
        </FormField>
      </GridItem>
      <GridItem colSpan={6}>
        <FormField>
          <FormFieldLabel>End date in ISO8601 format</FormFieldLabel>
          <span data-testid={"iso-end-date-label"}>
            {endIso8601String?.length ? endIso8601String : "-"}
          </span>
        </FormField>
      </GridItem>
      <GridItem colSpan={6}>
        <FormField>
          <FormFieldLabel>Start date in current timezone</FormFieldLabel>
          <span data-testid={"timezone-start-date-label"}>
            {startDateString?.length ? startDateString : "-"}
          </span>
        </FormField>
      </GridItem>
      <GridItem colSpan={6}>
        <FormField>
          <FormFieldLabel>End date in current timezone</FormFieldLabel>
          <span data-testid={"timezone-end-date-label"}>
            {endDateString?.length ? endDateString : "-"}
          </span>
        </FormField>
      </GridItem>
      <GridItem colSpan={6}>
        <FormField>
          <FormFieldLabel>Start date in current locale</FormFieldLabel>
          <span data-testid={"locale-start-date-label"}>
            {startLocaleDateString?.length ? startLocaleDateString : "-"}
          </span>
        </FormField>
      </GridItem>
      <GridItem colSpan={6}>
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

export const RangeWithTimezone = (): ReactElement => {
  // biome-ignore lint/suspicious/noExplicitAny: Date framework adapter
  const dateAdapterMap: Record<string, any> = {
    moment: AdapterMoment,
    dayjs: AdapterDayjs,
    "date-fns": AdapterDateFns,
    luxon: AdapterLuxon,
  };
  const validAdapters = Object.keys(dateAdapterMap);
  const [dateAdapterName, setDateAdapterName] = useState<string>("luxon");

  const timezoneOptions =
    dateAdapterName !== "date-fns"
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

  const handleAdapterChange: DropdownProps["onSelectionChange"] = (
    _event,
    newSelected,
  ) => {
    setDateAdapterName(newSelected[0] ?? "date-fns");
  };

  const handleTimezoneChange = (_e: SyntheticEvent, selection: string[]) => {
    setSelectedTimezone(selection[0]);
  };

  return (
    <StackLayout direction={"column"} style={{ maxWidth: "380px" }}>
      <StackLayout direction={"row"}>
        <FormField style={{ width: "120px" }}>
          <FormFieldLabel>Select Date adapter</FormFieldLabel>
          <Dropdown
            selected={[dateAdapterName]}
            onSelectionChange={handleAdapterChange}
          >
            {validAdapters.map((adapter) => (
              <Option value={adapter} key={adapter} />
            ))}
          </Dropdown>
        </FormField>
        <FormField style={{ width: "120px" }}>
          <FormFieldLabel>Select a Timezone</FormFieldLabel>
          <Dropdown
            aria-label="timezone dropdown"
            selected={[selectedTimezone]}
            onSelectionChange={handleTimezoneChange}
            style={{ minWidth: "120px", width: "min-content" }}
          >
            {timezoneOptions.map((tz) => (
              <Option key={tz} value={tz}>
                {tz}
              </Option>
            ))}
          </Dropdown>
        </FormField>
      </StackLayout>
      <LocalizationProvider DateAdapter={dateAdapterMap[dateAdapterName]}>
        <Range key={dateAdapterName} selectedTimezone={selectedTimezone} />
      </LocalizationProvider>
    </StackLayout>
  );
};
