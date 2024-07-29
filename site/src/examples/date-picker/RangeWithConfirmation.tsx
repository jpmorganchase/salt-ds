import React, { ReactElement } from "react";
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
  today,
} from "@internationalized/date";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerFooter,
  DatePickerRangeInput,
  type DateRangeSelection, DatePickerRangePanel,
} from "@salt-ds/lab";
import {
  Divider,
  FlexItem,
  FlexLayout,
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";

function formatDateRange(
  dateRange: DateRangeSelection | null,
  locale = "en-US",
  options?: Intl.DateTimeFormatOptions,
): string {
  const { startDate, endDate } = dateRange || {};
  const dateFormatter = new DateFormatter(locale, options);
  const formattedStartDate = startDate
    ? dateFormatter.format(startDate.toDate(getLocalTimeZone()))
    : "N/A";
  const formattedEndDate = endDate
    ? dateFormatter.format(endDate.toDate(getLocalTimeZone()))
    : "N/A";
  return `Start date: ${formattedStartDate}, End date: ${formattedEndDate}`;
}

export const RangeWithConfirmation = (): ReactElement => {
  const helperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const minDate = today(getLocalTimeZone());
  return (
    <FormField>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        selectionVariant="range"
        minDate={minDate}
        maxDate={minDate.add({ years: 50 })}
        onSelectedDateChange={(newSelectedDate) => {
          console.log(
            `Selected date range: ${formatDateRange(newSelectedDate)}`,
          );
        }}
      >
        <DatePickerRangeInput />
        <DatePickerOverlay>
          <FlexLayout gap={0} direction="column">
            <FlexItem>
              <DatePickerRangePanel helperText={helperText} />
              <Divider variant="tertiary" />
            </FlexItem>
            <FlexItem>
              <DatePickerFooter selectionVariant="range" />
            </FlexItem>
          </FlexLayout>
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};
