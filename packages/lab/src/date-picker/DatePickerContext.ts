import { createContext, UseFloatingUIReturn } from "@salt-ds/core";
import { useContext } from "react";
import { DateValue } from "@internationalized/date";

export interface DatePickerContextValue
  extends Partial<Pick<UseFloatingUIReturn, "context">> {
  openState: boolean;
  setOpen: (newOpen: boolean) => void;
  disabled: boolean;
  //start date values
  startDate: DateValue | undefined;
  defaultStartDate: DateValue | undefined;
  setStartDate: (newStartDate: DateValue | undefined) => void;
  startVisibleMonth: DateValue | undefined;
  setStartVisibleMonth: (newStartDate: DateValue | undefined) => void;
  // end date values for range picker
  endDate: DateValue | undefined;
  endVisibleMonth: DateValue | undefined;
  setEndVisibleMonth: (newStartDate: DateValue | undefined) => void;
  defaultEndDate: DateValue | undefined;
  setEndDate: (newEndDate: DateValue | undefined) => void;
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
    startVisibleMonth: undefined,
    setStartVisibleMonth: () => undefined,
    endDate: undefined,
    defaultEndDate: undefined,
    setEndDate: () => undefined,
    endVisibleMonth: undefined,
    setEndVisibleMonth: () => undefined,
    selectionVariant: "default",
    getPanelPosition: () => ({}),
  }
);

export function useDatePickerContext() {
  return useContext(DatePickerContext);
}
