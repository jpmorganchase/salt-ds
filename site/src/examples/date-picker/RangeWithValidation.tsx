import { DateFormatter, getLocalTimeZone } from "@internationalized/date";
import {
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";
import {
  type DateInputRangeValue,
  DatePicker,
  DatePickerOverlay,
  DatePickerRangeInput,
  DatePickerRangePanel,
  type DateRangeSelection,
} from "@salt-ds/lab";
import { type ChangeEvent, type ReactElement, useState } from "react";

function formatDateRange(
  dateRange: DateRangeSelection | null,
  locale = "en-US",
  options?: Intl.DateTimeFormatOptions,
): string {
  const { startDate, endDate } = dateRange || {};
  const dateFormatter = new DateFormatter(locale, options);
  const formattedStartDate = startDate
    ? dateFormatter.format(startDate.toDate(getLocalTimeZone()))
    : "N/A";
  const formattedEndDate = endDate
    ? dateFormatter.format(endDate.toDate(getLocalTimeZone()))
    : "N/A";
  return `Start date: ${formattedStartDate}, End date: ${formattedEndDate}`;
}

function isValidDate(dateString: string) {
  const datePattern = /^(\d{2})\s([A-Za-z]{3})\s(\d{4})$/i;
  const match = dateString.match(datePattern);
  if (!match) {
    return false;
  }
  const day = Number.parseInt(match[1], 10);
  const monthStr = match[2].toLowerCase(); // Convert month to lowercase
  const year = Number.parseInt(match[3], 10);
  const months = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];
  const monthIndex = months.indexOf(monthStr);
  if (monthIndex === -1) {
    return false;
  }
  const date = new Date(year, monthIndex, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === monthIndex &&
    date.getDate() === day
  );
}

const isValidDateString = (value: string | undefined) =>
  !value?.length || isValidDate(value);
export const RangeWithValidation = (): ReactElement => {
  const helperText = "Select range (DD MMM YYYY - DD MMM YYYY)";
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const [selectedDate, setSelectedDate] = useState<DateRangeSelection | null>(
    null,
  );

  return (
    <FormField style={{ width: "256px" }} validationStatus={validationStatus}>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        selectionVariant="range"
        selectedDate={selectedDate}
        onSelectedDateChange={(newSelectedDate: DateRangeSelection | null) => {
          console.log(
            `Selected date range: ${formatDateRange(newSelectedDate)}`,
          );
          setSelectedDate(newSelectedDate);
          setValidationStatus(undefined);
        }}
      >
        <DatePickerRangeInput
          onChange={(
            _e: ChangeEvent<HTMLInputElement>,
            selectedDate?: DateInputRangeValue,
          ) => {
            const startDateValue = selectedDate?.startDate;
            const endDateValue = selectedDate?.endDate;
            const validationStatus =
              isValidDateString(startDateValue) &&
              isValidDateString(endDateValue)
                ? undefined
                : "error";
            setValidationStatus(validationStatus);
          }}
        />
        <DatePickerOverlay>
          <DatePickerRangePanel helperText={helperText} />
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};
