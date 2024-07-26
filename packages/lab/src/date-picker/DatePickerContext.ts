import type { DateValue } from "@internationalized/date";
import { type UseFloatingUIReturn, createContext } from "@salt-ds/core";
import { useContext } from "react";
import type {
  DateRangeSelection,
  SingleDateSelection,
} from "../calendar";
import type { useDatePicker } from "./useDatePicker";

export interface DatePickerState<
  SelectionVariantType = SingleDateSelection | DateRangeSelection,
> {
  state: Omit<
    ReturnType<typeof useDatePicker>["state"],
    "floatingUIResult" | "selectedDate" | "minDate" | "maxDate"
  > & {
    floatingUIResult?: UseFloatingUIReturn;
    selectedDate?: SelectionVariantType | null;
    minDate?: DateValue;
    maxDate?: DateValue;
  };
  helpers: Omit<
    ReturnType<typeof useDatePicker>["helpers"],
    "getFloatingProps"
  > & {
    getFloatingProps?: ReturnType<
      typeof useDatePicker
    >["helpers"]["getFloatingProps"];
  };
}

function createDatePickerContext<SelectionVariantType>() {
  return createContext<DatePickerState<SelectionVariantType>>(
    "DatePickerContext",
    {
      state: {
        selectionVariant: "single",
        selectedDate: undefined,
        focusedInput: null,
        open: false,
        readOnly: false,
        disabled: false,
        autoApplyDisabled: false,
        containerRef: null,
        minDate: undefined,
        maxDate: undefined,
      },
      helpers: {
        setFocusedInput: () => undefined,
        setOpen: () => undefined,
        setSelectedDate: () => undefined,
        getReferenceProps: () => ({}),
        apply: () => undefined,
        cancel: () => undefined,
        setAutoApplyDisabled: () => undefined,
      },
    },
  );
}

export const DatePickerContext = createDatePickerContext<
  SingleDateSelection | DateRangeSelection
>();

export function useDatePickerContext<SelectionVariantType>() {
  return useContext(
    DatePickerContext,
  ) as unknown as DatePickerState<SelectionVariantType>;
}
