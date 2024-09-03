import {
  CalendarDate,
  DateFormatter,
  type DateValue,
} from "@internationalized/date";
import {
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";
import {
  type DateInputRangeParserResult,
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
  options?: Intl.DateTimeFormatOptions,
): string {
  const { startDate, endDate } = dateRange || {};
  const formattedStartDate = startDate
    ? formatDate(startDate, locale, options)
    : startDate;
  const formattedEndDate = endDate
    ? formatDate(endDate, locale, options)
    : endDate;
  return `Start date: ${formattedStartDate}, End date: ${formattedEndDate}`;
}

function isValidDateRange(date: DateRangeSelection | null) {
  if (date?.startDate === null || date?.endDate === null) {
    return false;
  }
  return !(
    date?.startDate &&
    date?.endDate &&
    date.startDate.compare(date.endDate) > 0
  );
}

export const RangeWithLocaleEsES = (): ReactElement => {
  const locale = "es-ES";
  const timeZone = "Europe/Madrid";

  const [selectedDate, setSelectedDate] = useState<DateRangeSelection | null>(
    null,
  );
  const helperText = `Locale ${locale} - Time Zone ${timeZone}`;
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );

  const parseDateEsES = (
    dateString: string | undefined,
  ): DateInputRangeParserResult => {
    if (!dateString) {
      return { date: null, error: false };
    }
    const dateParts = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!dateParts) {
      return { date: null, error: "invalid date" };
    }
    const [, day, month, year] = dateParts;
    return {
      date: new CalendarDate(
        Number.parseInt(year, 10),
        Number.parseInt(month, 10),
        Number.parseInt(day, 10),
      ),
      error: false,
    };
  };

  const formatDateEsES = (date: DateValue | null) => {
    return date
      ? new DateFormatter(locale, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          timeZone,
        }).format(date.toDate(timeZone))
      : "";
  };

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant={"range"}
        selectedDate={selectedDate}
        locale={locale}
        timeZone={timeZone}
        onSelectedDateChange={(newSelectedDate, error) => {
          console.log(
            `Selected date range: ${formatDateRange(newSelectedDate, locale, {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              timeZone,
            })}`,
          );
          setSelectedDate(newSelectedDate);
          const validationStatus =
            !error.startDate &&
            !error.endDate &&
            isValidDateRange(newSelectedDate)
              ? undefined
              : "error";
          setValidationStatus(validationStatus);
        }}
      >
        <DatePickerRangeInput
          format={formatDateEsES}
          parse={parseDateEsES}
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
