import { createContext, UseFloatingUIReturn } from "@salt-ds/core";
import { useContext } from "react";
import { DateValue } from "@internationalized/date";

export interface DatePickerContextValue
  extends Partial<Pick<UseFloatingUIReturn, "context">> {
  openState: boolean;
  setOpen: (newOpen: boolean) => void;
  disabled: boolean;
  startDate: DateValue | undefined;
  defaultStartDate: DateValue | undefined;
  setStartDate: (newStartDate: DateValue) => void;
  endDate: DateValue | undefined;
  defaultEndDate: DateValue | undefined;
  setEndDate: (newEndDate: DateValue) => void;
  selectionVariant: "default" | "range";
  getPanelPosition: () => Record<string, unknown>;
}

export const DatePickerContext = createContext<DatePickerContextValue>(
  "DatePickerContext",
  {
    openState: false,
    setOpen: () => undefined,
    disabled: false,
    startDate: undefined,
    defaultStartDate: undefined,
    setStartDate: () => undefined,
    endDate: undefined,
    setEndDate: () => undefined,
    defaultEndDate: undefined,
    selectionVariant: "default",
    getPanelPosition: () => ({}),
  }
);

export function useDatePickerContext() {
  return useContext(DatePickerContext);
}
