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
  DateInputSingle,
  type DateInputSingleProps,
  LocalizationProvider,
  useLocalization,
} from "@salt-ds/lab";
import {
  type ReactElement,
  type SyntheticEvent,
  useEffect,
  useState,
} from "react";

const Single = ({
  selectedTimezone,
}: {
  selectedTimezone: Timezone;
}): ReactElement => {
  const { dateAdapter } = useLocalization();

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

  return (
    <GridLayout gap={1}>
      <GridItem colSpan={12}>
        <FormField validationStatus={error ? "error" : undefined}>
          <FormFieldLabel>Enter a date</FormFieldLabel>
          <FormFieldHelperText>{error}</FormFieldHelperText>
          <DateInputSingle
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

export const SingleWithTimezone = (): ReactElement => {
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
        <Single key={dateAdapterName} selectedTimezone={selectedTimezone} />
      </LocalizationProvider>
    </StackLayout>
  );
};
