import { CalendarDate } from "@internationalized/date";
import {
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerRangeInput,
  DatePickerRangePanel,
  type DateRangeSelection,
  type RangeDatePickerError,
  formatDate,
  getCurrentLocale,
} from "@salt-ds/lab";
import { type ReactElement, useCallback } from "react";

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
    return true;
  }
  return !(
    date?.startDate &&
    date?.endDate &&
    date.startDate.compare(date.endDate) > 0
  );
}

export const RangeWithMinMaxDate = (): ReactElement => {
  const defaultHelperText = "Select date between 15/01/2030 and 15/01/2031";
  const errorHelperText = "Please enter an in-range date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectionChange = useCallback(
    (
      newSelectedDate: DateRangeSelection | null,
      error: RangeDatePickerError,
    ) => {
      console.log(`Selected date range: ${formatDateRange(newSelectedDate)}`);
      console.log(
        `Error: startDate: ${error.startDate} endDate: ${error.endDate}`,
      );
      const validationStatus =
        !error.startDate && !error.endDate && isValidDateRange(newSelectedDate)
          ? undefined
          : "error";
      setValidationStatus(validationStatus);
      if (validationStatus === "error") {
        setHelperText(errorHelperText);
      } else {
        setHelperText(defaultHelperText);
      }
    },
    [setValidationStatus, setHelperText],
  );

  return (
    <FormField style={{ width: "256px" }} validationStatus={validationStatus}>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        selectionVariant="range"
        minDate={new CalendarDate(2030, 1, 15)}
        maxDate={new CalendarDate(2031, 1, 15)}
        onSelectionChange={handleSelectionChange}
      >
        <DatePickerRangeInput />
        <DatePickerOverlay>
          <DatePickerRangePanel
            defaultStartVisibleMonth={new CalendarDate(2030, 1, 1)}
            defaultEndVisibleMonth={new CalendarDate(2031, 1, 1)}
            helperText={helperText}
          />
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};
