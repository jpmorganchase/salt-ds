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
  type DateInputSingleParserResult,
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleInput,
  DatePickerSinglePanel, formatDate, SingleDatePickerError,
  type SingleDateSelection,
} from "@salt-ds/lab";
import React, { type ReactElement, useState } from "react";

export const SingleWithLocaleZhCN = (): ReactElement => {
  const locale = "zh-CN";
  const timeZone = "Asia/Shanghai";
  const formatDateZhCN = (date: DateValue | null) => {
    return date
      ? new DateFormatter(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date.toDate(timeZone))
      : "";
  };

  const parseDateZhCN = (dateString: string): DateInputSingleParserResult => {
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

  const [selectedDate, setSelectedDate] = useState<SingleDateSelection | null>(
    null,
  );
  const helperText = `Locale ${locale} - Time Zone ${timeZone}`;
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const formatMonth = (date: DateValue) =>
    formatDate(date, locale, {
      month: "long",
      day: undefined,
      year: undefined,
    });

  function renderDayContents(day: DateValue) {
    const formatter = new DateFormatter("en-US", { day: "numeric" });
    return <>{formatter.format(day.toDate(timeZone))}</>;
  }

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant={"single"}
        selectedDate={selectedDate}
        locale={locale}
        timeZone={timeZone}
        onSelectedDateChange={(
          newSelectedDate: SingleDateSelection | null,
          error: SingleDatePickerError,
        ) => {
          console.log(
            `Selected date: ${formatDateZhCN(newSelectedDate ?? null)}`,
          );
          setSelectedDate(newSelectedDate);
          setValidationStatus(error ? "error" : undefined);
        }}
      >
        <DatePickerSingleInput
          format={formatDateZhCN}
          parse={parseDateZhCN}
          placeholder={"YYYY/MM/DD"}
        />
        <DatePickerOverlay>
          <DatePickerSinglePanel
            CalendarProps={{ renderDayContents }}
            CalendarNavigationProps={{ formatMonth }}
          />
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};
