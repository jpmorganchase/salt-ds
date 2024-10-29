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
import { type ReactElement, useCallback, useState } from "react";

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
  if (!date?.startDate || !date?.endDate) {
    return true;
  }
  return !(
    date?.startDate &&
    date?.endDate &&
    date.startDate.compare(date.endDate) > 0
  );
}

export const RangeWithInitialError = (): ReactElement => {
  const defaultHelperText =
    "Select range DD MMM YYYY - DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(errorHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    "error",
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
      if (validationStatus === "error") {
        setHelperText(errorHelperText);
      } else {
        setHelperText(defaultHelperText);
      }
      setValidationStatus(validationStatus);
    },
    [setValidationStatus, setHelperText],
  );

  return (
    <FormField style={{ width: "256px" }} validationStatus={validationStatus}>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        selectionVariant="range"
        defaultSelectedDate={{
          startDate: new CalendarDate(2024, 6, 9),
          endDate: null,
        }}
        onSelectionChange={handleSelectionChange}
      >
        <DatePickerRangeInput
          defaultValue={{ startDate: "09 Jun 2024", endDate: "bad date" }}
        />
        <DatePickerOverlay>
          <DatePickerRangePanel
            helperText={helperText}
            defaultStartVisibleMonth={new CalendarDate(2024, 6, 1)}
          />
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};
