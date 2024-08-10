import { type ReactElement, useState } from "react";
import {
  CalendarDate,
  DateValue,
  getLocalTimeZone,
  today,
} from "@internationalized/date";
import {
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleInput,
  DatePickerSinglePanel,
  type SingleDateSelection,
  createCalendarDate,
  formatDate,
  getCurrentLocale,
} from "@salt-ds/lab";

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

function isValidOffsetString(offsetString: string) {
  const offsetPattern = /^\[+-]\d+$/;
  return offsetPattern.test(offsetString);
}

export const SingleWithCustomParser = (): ReactElement => {
  const helperText =
    "Date format DD MMM YYYY (e.g. 09 Jun 2024) or +/-D (e.g. +7)";
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const [selectedDate, setSelectedDate] = useState<SingleDateSelection | null>(
    null,
  );

  return (
    <FormField style={{ width: "256px" }} validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        selectedDate={selectedDate}
        onSelectedDateChange={(newSelectedDate: SingleDateSelection | null) => {
          console.log(`Selected date: ${formatDate(newSelectedDate)}`);
          setSelectedDate(newSelectedDate);
          setValidationStatus(undefined);
        }}
      >
        <DatePickerSingleInput
          parse={(inputDate: string | undefined): DateValue | undefined => {
            const parsedDate = inputDate;
            const offsetMatch = parsedDate?.match(/^([+-]?\d+)$/);
            if (offsetMatch) {
              const offsetDays = Number.parseInt(offsetMatch[1], 10);
              let offsetDate = selectedDate
                ? selectedDate
                : today(getLocalTimeZone());
              offsetDate = offsetDate.add({ days: offsetDays });
              return new CalendarDate(
                offsetDate.year,
                offsetDate.month,
                offsetDate.day,
              );
            }
            return createCalendarDate(parsedDate);
          }}
          onDateValueChange={(newDateValue: string) => {
            const validationStatus =
              isValidShortDate(newDateValue) ||
              isValidOffsetString(newDateValue)
                ? undefined
                : "error";
            setValidationStatus(validationStatus);
          }}
        />
        <DatePickerOverlay>
          <DatePickerSinglePanel helperText={helperText} />
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};
