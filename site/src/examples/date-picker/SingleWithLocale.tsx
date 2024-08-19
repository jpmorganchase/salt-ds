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
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleInput,
  DatePickerSinglePanel,
  type SingleDateSelection,
  getCurrentLocale,
} from "@salt-ds/lab";
import React, { type ReactElement, useState } from "react";

function validateNumericDate(dateString: string, format: string): boolean {
  let regex, day, month, year;

  if (format === "MM/DD/YYYY") {
    regex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    if (!regex.test(dateString)) {
      return false;
    }
    const parts = dateString.split("/");
    month = Number.parseInt(parts[0], 10);
    day = Number.parseInt(parts[1], 10);
    year = Number.parseInt(parts[2], 10);
  } else if (format === "DD/MM/YYYY") {
    regex = /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/\d{4}$/;
    if (!regex.test(dateString)) {
      return false;
    }
    const parts = dateString.split("/");
    day = Number.parseInt(parts[0], 10);
    month = Number.parseInt(parts[1], 10);
    year = Number.parseInt(parts[2], 10);
  } else {
    // Unsupported format
    return false;
  }

  if (month < 1 || month > 12 || year < 1000 || year > 9999) {
    return false;
  }
  const daysInMonth = new Date(year, month, 0).getDate();
  return !(day < 1 || day > daysInMonth);
}

const isValidNumericDate = (
  dateValue: string | undefined,
  format = "DD/MM/YYYY",
) => !dateValue?.length || validateNumericDate(dateValue, format);

const parseDateStringEnUS = (
  dateString: string | undefined,
): DateValue | undefined => {
  if (!dateString) {
    return undefined;
  }
  const dateParts = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!dateParts) {
    return undefined;
  }
  const [, month, day, year] = dateParts;
  return new CalendarDate(
    Number.parseInt(year, 10),
    Number.parseInt(month, 10),
    Number.parseInt(day, 10),
  );
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
        onSelectedDateChange={(newSelectedDate: SingleDateSelection | null) => {
          console.log(
            `Selected date: ${formatDateStringEnUS(newSelectedDate, "en-US", { timeZone: "America/New_York" })}`,
          );
          setSelectedDate(newSelectedDate);
        }}
      >
        <DatePickerSingleInput
          onDateValueChange={(newDateValue: string) => {
            const validationStatus = isValidNumericDate(
              newDateValue,
              "MM/DD/YYYY",
            )
              ? undefined
              : "error";
            setValidationStatus(validationStatus);
          }}
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
