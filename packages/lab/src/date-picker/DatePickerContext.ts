import { createContext } from "@salt-ds/core";
import { useContext } from "react";
import { DateValue } from "@internationalized/date";

export interface DatePickerContextValue {
  // TODO: add the floating ui context?
  openState: boolean;
  setOpen: (newOpen: boolean) => void;
  disabled: boolean;
  startDate: DateValue | undefined;
  setStartDate: (newStartDate: DateValue) => void;
  endDate: DateValue | undefined;
  setEndDate: (newEndDate: DateValue) => void;
  selectionVariant: "default" | "range";
}

export const DatePickerContext = createContext<DatePickerContextValue>(
  "DatePickerContext",
  {
    openState: false,
    setOpen: () => undefined,
    disabled: false,
    startDate: undefined,
    setStartDate: () => undefined,
    endDate: undefined,
    setEndDate: () => undefined,
    selectionVariant: "default",
  }
);

export function useDatePickerContext() {
  return useContext(DatePickerContext);
}
