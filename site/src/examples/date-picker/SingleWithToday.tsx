import { getLocalTimeZone, today } from "@internationalized/date";
import {
  Button,
  FlexItem,
  FlexLayout,
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleInput,
  DatePickerSinglePanel,
  type DatePickerState,
  type SingleDateSelection,
  formatDate,
  useDatePickerContext,
} from "@salt-ds/lab";
import React, { type ReactElement } from "react";

const TodayButton = () => {
  const {
    helpers: { setSelectedDate },
  } = useDatePickerContext({
    selectionVariant: "single",
  }) as DatePickerState<SingleDateSelection>;

  return (
    <Button
      style={{ width: "100%" }}
      onClick={() => setSelectedDate(today(getLocalTimeZone()))}
    >
      Today
    </Button>
  );
};

export const SingleWithToday = (): ReactElement => {
  const helperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  return (
    <FormField style={{ width: "256px" }}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        onSelectedDateChange={(newSelectedDate) => {
          console.log(`Selected date range: ${formatDate(newSelectedDate)}`);
        }}
      >
        <DatePickerSingleInput />
        <DatePickerOverlay>
          <FlexLayout gap={0} direction="column">
            <FlexItem>
              <DatePickerSinglePanel />
            </FlexItem>
            <FlexItem>
              <TodayButton />
            </FlexItem>
          </FlexLayout>
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};
