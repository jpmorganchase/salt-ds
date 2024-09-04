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
} from "@salt-ds/lab";
import React, { type ReactElement, useState } from "react";

const parseDateEnUS = (dateString: string): DateInputSingleParserResult => {
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

const formatDateEnUS = (date: DateValue | null) => {
  return date
    ? new DateFormatter("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date.toDate(getLocalTimeZone()))
    : "";
};

export const SingleWithLocaleEnUS = (): ReactElement => {
  const locale = "en-US";

  const [selectedDate, setSelectedDate] = useState<SingleDateSelection | null>(
    null,
  );
  const helperText = `Locale ${locale}`;
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );

  return (
    <FormField style={{ width: "256px" }} validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant={"single"}
        selectedDate={selectedDate}
        locale={locale}
        onSelectedDateChange={(newSelectedDate, error) => {
          console.log(`Selected date: ${formatDateEnUS(newSelectedDate)}`);
          setValidationStatus(error ? "error" : undefined);
          setSelectedDate(newSelectedDate);
        }}
      >
        <DatePickerSingleInput
          format={formatDateEnUS}
          parse={parseDateEnUS}
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
