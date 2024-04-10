import { createContext } from "@salt-ds/core";
import { useContext } from "react";
import { DateValue } from "@internationalized/date";

export interface DatePickerContextValue {
  // TODO: add the floating ui context?
  openState: boolean;
  setOpen: (newOpen: boolean) => void;
  disabled: boolean;
  startDate: DateValue | null;
  setStartDate: (newStartDate: DateValue) => void;
  endDate: DateValue | null;
  setEndDate: (newStartDate: DateValue) => void;
  selectionVariant: "default" | "range";
}

export const DatePickerContext = createContext<DatePickerContextValue>(
  "DatePickerContext",
  {
    openState: false,
    setOpen: () => undefined,
    disabled: false,
    startDate: null,
    setStartDate: () => undefined,
    endDate: null,
    setEndDate: () => undefined,
    selectionVariant: "default",
  }
);

export function useDatePickerContext() {
  return useContext(DatePickerContext);
}
