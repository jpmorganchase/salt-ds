import { type ChangeEvent, ReactElement, useState } from "react";
import { DateFormatter, getLocalTimeZone } from "@internationalized/date";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleInput,
  DatePickerSinglePanel,
  type SingleDateSelection,
} from "@salt-ds/lab";
import {
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";

function formatDate(
  dateValue: SingleDateSelection | null,
  locale = "en-US",
  options?: Intl.DateTimeFormatOptions,
): string {
  const dateFormatter = new DateFormatter(locale, options);
  return dateValue
    ? dateFormatter.format(dateValue.toDate(getLocalTimeZone()))
    : "N/A";
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

export const SingleWithValidation = (): ReactElement => {
  const helperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const [selectedDate, setSelectedDate] =
    useState<SingleDateSelection | null>(null);

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        selectedDate={selectedDate}
        onSelectedDateChange={(
          newSelectedDate: SingleDateSelection | null,
        ) => {
          console.log(`Selected date: ${formatDate(newSelectedDate)}`);
          setSelectedDate(newSelectedDate);
          setValidationStatus(undefined);
        }}
      >
        <DatePickerSingleInput
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const newInputValue = event.target.value;
            const validationStatus = isValidDateString(newInputValue)
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
