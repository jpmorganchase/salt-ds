import { createContext, UseFloatingUIReturn } from "@salt-ds/core";
import { useContext } from "react";
import { DateValue } from "@internationalized/date";

export interface DateInputContextValue
extends Partial<Pick<UseFloatingUIReturn, "context" | "refs">> {
  openState: boolean;
  setOpen: (newOpen: boolean) => void;
  disabled: boolean;
  startDate: DateValue | null;
  setStartDate: (newStartDate: DateValue) => void;
  inputValue: string | undefined;
  setInputValue: (inputValue: string) => void;
  endDate: DateValue | null;
  setEndDate: (newStartDate: DateValue) => void;
}

export const DateInputContext = createContext<DateInputContextValue>(
  "DateInputContext",
    {
      openState: false,
      setOpen: () => undefined,
      disabled: false,
      startDate: null,
      setStartDate: () => undefined,
      inputValue: undefined,
      setInputValue: () => undefined,
      endDate: null,
      setEndDate: () => undefined,
    }
);

export function useDateInputContext() {
  return useContext(DateInputContext);
}
