import {
  CalendarDate,
  DateFormatter,
  type DateValue,
  getLocalTimeZone,
} from "@internationalized/date";
import {
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";
import {
  type DateInputSingleParserResult,
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleInput,
  DatePickerSinglePanel,
  type SingleDateSelection,
  getCurrentLocale,
} from "@salt-ds/lab";
import React, { type ReactElement, useState } from "react";

const parseDateStringEnUS = (
  dateString: string,
): DateInputSingleParserResult => {
  if (!dateString?.length) {
    return { date: null, error: false };
  }
  const dateParts = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!dateParts) {
    return { date: null, error: "invalid date" };
  }
  const [, month, day, year] = dateParts;
  return {
    date: new CalendarDate(
      Number.parseInt(year, 10),
      Number.parseInt(month, 10),
      Number.parseInt(day, 10),
    ),
    error: false,
  };
};

const formatDateStringEnUS = (
  date: DateValue | null | undefined,
  locale?: string,
  options?: Intl.DateTimeFormatOptions,
) => {
  const preferredLocale = locale || getCurrentLocale();
  const preferredTimeZone = options?.timeZone || getLocalTimeZone();
  return date
    ? new DateFormatter(preferredLocale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        ...options,
        timeZone: preferredTimeZone,
      }).format(date.toDate(preferredTimeZone))
    : "";
};

export const SingleWithLocale = (): ReactElement => {
  const [selectedDate, setSelectedDate] = useState<SingleDateSelection | null>(
    null,
  );
  const helperText = "Date format MM/DD/YYYY";
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );

  return (
    <FormField style={{ width: "250px" }} validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant={"single"}
        selectedDate={selectedDate}
        locale={"en-US"}
        timeZone={"America/New_York"}
        onSelectedDateChange={(newSelectedDate, error) => {
          console.log(
            `Selected date: ${formatDateStringEnUS(newSelectedDate, "en-US", { timeZone: "America/New_York" })}`,
          );
          setValidationStatus(error ? "error" : undefined);
          setSelectedDate(newSelectedDate);
        }}
      >
        <DatePickerSingleInput
          formatDate={formatDateStringEnUS}
          parse={parseDateStringEnUS}
          placeholder={"MM/DD/YYYY"}
        />
        <DatePickerOverlay>
          <DatePickerSinglePanel />
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};
