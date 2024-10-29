import {
  CalendarDate,
  type DateValue,
  getLocalTimeZone,
  today,
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
  getCurrentLocale,
  parseCalendarDate,
} from "@salt-ds/lab";
import { type ReactElement, useCallback, useState } from "react";

function formatSingleDate(
  date: DateValue | null | undefined,
  locale = getCurrentLocale(),
  options?: Intl.DateTimeFormatOptions,
) {
  if (date) {
    return formatDate(date, locale, options);
  }
  return date;
}

export const SingleWithCustomParser = (): ReactElement => {
  const defaultHelperText =
    "Date format DD MMM YYYY (e.g. 09 Jun 2024) or +/-D (e.g. +7)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const [selectedDate, setSelectedDate] = useState<
    SingleDateSelection | null | undefined
  >(null);
  const handleSelectionChange = useCallback(
    (
      newSelectedDate: SingleDateSelection | null | undefined,
      error: SingleDatePickerError,
    ) => {
      console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
      console.log(`Error: ${error}`);
      setSelectedDate(newSelectedDate);
      if (error) {
        setHelperText(errorHelperText);
      } else {
        setHelperText(defaultHelperText);
      }
      setValidationStatus(error ? "error" : undefined);
    },
    [setValidationStatus, setSelectedDate, setHelperText],
  );
  const customParser = useCallback(
    (inputDate: string): DateInputSingleParserResult => {
      if (!inputDate?.length) {
        return { date: null, error: false };
      }
      const parsedDate = inputDate;
      const offsetMatch = parsedDate?.match(/^([+-]?\d+)$/);
      if (offsetMatch) {
        const offsetDays = Number.parseInt(offsetMatch[1], 10);
        let offsetDate = selectedDate
          ? selectedDate
          : today(getLocalTimeZone());
        offsetDate = offsetDate.add({ days: offsetDays });
        return {
          date: new CalendarDate(
            offsetDate.year,
            offsetDate.month,
            offsetDate.day,
          ),
          error: false,
        };
      }
      return parseCalendarDate(parsedDate || "");
    },
    [selectedDate],
  );

  return (
    <FormField style={{ width: "256px" }} validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        onSelectionChange={handleSelectionChange}
        selectedDate={selectedDate}
      >
        <DatePickerSingleInput parse={customParser} />
        <DatePickerOverlay>
          <DatePickerSinglePanel helperText={helperText} />
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};
