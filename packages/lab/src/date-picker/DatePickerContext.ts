import { useContext } from "react";
import { createContext, UseFloatingUIReturn } from "@salt-ds/core";
import { RangeSelectionValueType, SingleSelectionValueType } from "../calendar";
import { useDatePicker } from "./useDatePicker";
import {DateValue} from "@internationalized/date";

export interface DatePickerState<
  SelectionVariantType = SingleSelectionValueType | RangeSelectionValueType
> {
  state: Omit<
    ReturnType<typeof useDatePicker>["state"],
    "floatingUIResult" | "selectedDate" | "minDate" | "maxDate"
  > & {
    floatingUIResult?: UseFloatingUIReturn;
    selectedDate?: SelectionVariantType | null;
    minDate?: DateValue,
    maxDate?: DateValue,
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
        maxDate: undefined
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
    }
  );
}

export const DatePickerContext = createDatePickerContext<
  SingleSelectionValueType | RangeSelectionValueType
>();

export function useDatePickerContext<SelectionVariantType>() {
  return useContext(
    DatePickerContext
  ) as unknown as DatePickerState<SelectionVariantType>;
}
