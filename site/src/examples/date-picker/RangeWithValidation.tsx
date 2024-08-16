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
  formatDate,
  getCurrentLocale,
} from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

function formatDateRange(
  dateRange: DateRangeSelection | null,
  locale = getCurrentLocale(),
): string {
  const { startDate, endDate } = dateRange || {};
  const formattedStartDate = startDate ? formatDate(startDate, locale) : "N/A";
  const formattedEndDate = endDate ? formatDate(endDate, locale) : "N/A";
  return `Start date: ${formattedStartDate}, End date: ${formattedEndDate}`;
}

function validateShortDate(
  dateString: string,
  locale: string = getCurrentLocale(),
) {
  // Regular expression to match the expected date format (e.g., "01 May 1970")
  const datePattern = /^(\d{2}) (\w{3}) (\d{4})$/;
  const match = dateString.match(datePattern);

  // Check if the date string matches the expected format
  if (!match) {
    return false;
  }

  const [, dayStr, monthStr, yearStr] = match;
  const day = Number.parseInt(dayStr, 10);
  const monthInput = monthStr.toLowerCase();
  const year = Number.parseInt(yearStr, 10);

  // Function to get month names in the specified locale
  function getMonthNames() {
    const formatter = new Intl.DateTimeFormat(locale, { month: "short" });
    const months = [];
    for (let month = 0; month < 12; month++) {
      const date = new Date(2021, month, 1);
      months.push(formatter.format(date).toLowerCase());
    }
    return months;
  }

  const months = getMonthNames();
  const monthIndex = months.indexOf(monthInput);

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

const isValidShortDate = (
  dateValue: string | undefined,
  locale = getCurrentLocale(),
) => !dateValue?.length || validateShortDate(dateValue, locale);

function isValidDateRange(date: DateRangeSelection | null) {
  if (
    date?.startDate &&
    date?.endDate &&
    date.startDate.compare(date.endDate) > 0
  ) {
    return false;
  }
  return true;
}

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
          const validationStatus = isValidDateRange(newSelectedDate)
            ? undefined
            : "error";
          setValidationStatus(validationStatus);
        }}
      >
        <DatePickerRangeInput
          onDateValueChange={(newDateValue?: DateInputRangeValue) => {
            const validationStatus =
              isValidShortDate(newDateValue?.startDate) &&
              isValidShortDate(newDateValue?.endDate)
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
