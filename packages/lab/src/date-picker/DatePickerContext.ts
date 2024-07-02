import type { DateValue } from "@internationalized/date";
import { type UseFloatingUIReturn, createContext } from "@salt-ds/core";
import { useContext } from "react";
import type {
  RangeSelectionValueType,
  SingleSelectionValueType,
} from "../calendar";

export interface DatePickerContextValue<SelectionVariantType>
  extends Partial<Pick<UseFloatingUIReturn, "context">> {
  openState: boolean;
  setOpen: (newOpen: boolean) => void;
  disabled: boolean;
  //
  selectedDate: SelectionVariantType | undefined;
  defaultSelectedDate: SelectionVariantType | undefined;
  setSelectedDate: (newStartDate: SelectionVariantType | undefined) => void;
  startVisibleMonth: DateValue | undefined;
  setStartVisibleMonth: (newStartDate: DateValue | undefined) => void;
  endVisibleMonth: DateValue | undefined;
  setEndVisibleMonth: (newStartDate: DateValue | undefined) => void;
  selectionVariant: "default" | "range";
  getPanelPosition: () => Record<string, unknown>;
}

export const DatePickerContext = createContext<
  DatePickerContextValue<SingleSelectionValueType | RangeSelectionValueType>
>("DatePickerContext", {
  openState: false,
  setOpen: () => undefined,
  disabled: false,
  selectedDate: undefined,
  defaultSelectedDate: undefined,
  setSelectedDate: () => undefined,
  startVisibleMonth: undefined,
  setStartVisibleMonth: () => undefined,
  endVisibleMonth: undefined,
  setEndVisibleMonth: () => undefined,
  selectionVariant: "default",
  getPanelPosition: () => ({}),
});

export function useDatePickerContext() {
  return useContext(DatePickerContext);
}
