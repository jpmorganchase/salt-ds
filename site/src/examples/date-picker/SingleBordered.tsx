import {
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleInput,
  DatePickerSinglePanel,
  formatDate,
} from "@salt-ds/lab";
import React, { type ReactElement } from "react";

export const SingleBordered = (): ReactElement => (
  <DatePicker
    selectionVariant="single"
    onSelectedDateChange={(newSelectedDate) => {
      console.log(`Selected date: ${formatDate(newSelectedDate)}`);
    }}
  >
    <DatePickerSingleInput bordered />
    <DatePickerOverlay>
      <DatePickerSinglePanel
        NavigationProps={{
          MonthDropdownProps: { bordered: true },
          YearDropdownProps: { bordered: true },
        }}
      />
    </DatePickerOverlay>
  </DatePicker>
);
