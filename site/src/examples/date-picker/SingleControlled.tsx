import {
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleInput,
  DatePickerSinglePanel,
  type SingleDateSelection,
  formatDate,
} from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

export const SingleControlled = (): ReactElement => {
  const [selectedDate, setSelectedDate] = useState<SingleDateSelection | null>(
    null,
  );
  return (
    <DatePicker
      selectionVariant={"single"}
      selectedDate={selectedDate}
      onSelectedDateChange={(newSelectedDate: SingleDateSelection | null) => {
        console.log(`Selected date: ${formatDate(newSelectedDate)}`);
        setSelectedDate(newSelectedDate);
      }}
    >
      <DatePickerSingleInput />
      <DatePickerOverlay>
        <DatePickerSinglePanel />
      </DatePickerOverlay>
    </DatePicker>
  );
};
