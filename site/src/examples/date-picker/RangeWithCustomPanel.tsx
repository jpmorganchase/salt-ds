import { getLocalTimeZone, today } from "@internationalized/date";
import {
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerRangeInput,
  type DateRangeSelection,
  formatDate,
  getCurrentLocale,
} from "@salt-ds/lab";
import { CustomDatePickerPanel } from "@salt-ds/lab/stories/date-picker/CustomDatePickerPanel";
import React, { type ReactElement, useCallback, useState } from "react";

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

export const RangeWithCustomPanel = (): ReactElement => {
  const defaultHelperText =
    "Select range DD MMM YYYY - DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectionChange = useCallback(
    (
      newSelectedDate: DateRangeSelection | null,
      error: { startDate: string | false; endDate: string | false },
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
        onSelectionChange={handleSelectionChange}
      >
        <DatePickerRangeInput />
        <DatePickerOverlay>
          <CustomDatePickerPanel
            selectionVariant="range"
            helperText={helperText}
          />
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};
