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
  type DateInputRangeValue,
  DatePicker,
  DatePickerOverlay,
  DatePickerRangeInput,
  DatePickerRangePanel,
  type DateRangeSelection,
  formatDate,
  getCurrentLocale,
} from "@salt-ds/lab";
import React, { type ReactElement, useState } from "react";

function formatDateRange(
  dateRange: DateRangeSelection | null,
  locale = getCurrentLocale(),
): string {
  const { startDate, endDate } = dateRange || {};
  const formattedStartDate = startDate ? formatDate(startDate, locale) : "N/A";
  const formattedEndDate = endDate ? formatDate(endDate, locale) : "N/A";
  return `Start date: ${formattedStartDate}, End date: ${formattedEndDate}`;
}

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

const parseDateStringEsES = (
  dateString: string | undefined,
): DateValue | undefined => {
  if (!dateString) {
    return undefined;
  }
  const dateParts = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!dateParts) {
    return undefined;
  }
  const [, day, month, year] = dateParts;
  return new CalendarDate(
    Number.parseInt(year, 10),
    Number.parseInt(month, 10),
    Number.parseInt(day, 10),
  );
};

const formatDateStringEsES = (
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

export const RangeWithLocaleES = (): ReactElement => {
  const [selectedDate, setSelectedDate] = useState<DateRangeSelection | null>(
    null,
  );
  const helperText = "Date format DD/MM/YYYY";
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant={"range"}
        selectedDate={selectedDate}
        locale={"es-ES"}
        timeZone={"Europe/Madrid"}
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
              isValidNumericDate(newDateValue?.startDate, "DD/MM/YYYY") &&
              isValidNumericDate(newDateValue?.endDate, "DD/MM/YYYY")
                ? undefined
                : "error";
            setValidationStatus(validationStatus);
          }}
          formatDate={formatDateStringEsES}
          parse={parseDateStringEsES}
          placeholder={"DD/MM/YYYY"}
        />
        <DatePickerOverlay>
          <DatePickerRangePanel />
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};
