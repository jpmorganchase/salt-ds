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
  type SingleDatePickerError,
  type SingleDateSelection,
  formatDate,
} from "@salt-ds/lab";
import React, { type ReactElement, useState } from "react";

const formatDateZhCN = (date: DateValue | null) => {
  return date
    ? new DateFormatter("zh-CN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date.toDate(getLocalTimeZone()))
    : "";
};

const parseDateZhCN = (dateString: string): DateInputSingleParserResult => {
  if (!dateString?.length) {
    return { date: null, error: false };
  }
  const dateParts = dateString.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!dateParts) {
    return { date: null, error: "invalid date" };
  }
  const [_, year, month, day] = dateParts;
  return {
    date: new CalendarDate(
      Number.parseInt(year, 10),
      Number.parseInt(month, 10),
      Number.parseInt(day, 10),
    ),
    error: false,
  };
};

export const SingleWithLocaleZhCN = (): ReactElement => {
  const locale = "zh-CN";

  const [selectedDate, setSelectedDate] = useState<SingleDateSelection | null>(
    null,
  );
  const helperText = `Locale ${locale}`;
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
    return <>{formatter.format(day.toDate(getLocalTimeZone()))}</>;
  }

  return (
    <FormField style={{ width: "256px" }} validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant={"single"}
        selectedDate={selectedDate}
        locale={locale}
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
