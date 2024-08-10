import type { ReactElement } from "react";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleInput,
  DatePickerSinglePanel,
  formatDate,
} from "@salt-ds/lab";

export const Single = (): ReactElement => (
  <DatePicker
    selectionVariant="single"
    onSelectedDateChange={(newSelectedDate) =>
      console.log(`Selected date: ${formatDate(newSelectedDate)}`)
    }
  >
    <DatePickerSingleInput />
    <DatePickerOverlay>
      <DatePickerSinglePanel />
    </DatePickerOverlay>
  </DatePicker>
);
