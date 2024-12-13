import {
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleInput,
  DatePickerSinglePanel,
  DatePickerTrigger,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

export const UncontrolledOpenOnFocus = (): ReactElement => {
  return (
    <DatePicker openOnFocus selectionVariant={"single"}>
      <DatePickerTrigger>
        <DatePickerSingleInput />
      </DatePickerTrigger>
      <DatePickerOverlay>
        <DatePickerSinglePanel />
      </DatePickerOverlay>
    </DatePicker>
  );
};
