import type { DateValue } from "@internationalized/date";
import { createContext } from "@salt-ds/core";
import { useContext } from "react";
import type { DateRangeSelection, SingleDateSelection } from "../calendar";

interface DatePickerBaseState {
  state: {
    disabled?: boolean;
    readOnly?: boolean;
    cancelled?: boolean;
    focusedValue?: "start" | "end" | null;
    defaultFocusedValue?: DatePickerBaseState["state"]["focusedValue"];
    autoApplyDisabled?: boolean;
    minDate?: DateValue;
    maxDate?: DateValue;
    containerRef: React.Ref<HTMLDivElement>;
    locale?: string;
    timeZone?: string;
  };
  helpers: {
    cancel: () => void;
    setFocusedValue: (newFocusedValue: "start" | "end" | null) => void;
    setAutoApplyDisabled: (newAutoApplyDisabled: boolean) => void;
  };
}

export interface DatePickerState<T = SingleDateSelection | DateRangeSelection>
  extends DatePickerBaseState {
  state: DatePickerBaseState["state"] & {
    selectedDate: T | null;
    defaultSelectedDate?: T;
    onSelectedDateChange?: (newDate: T | null) => void;
  };
  helpers: DatePickerBaseState["helpers"] & {
    apply: (newDate: T | null) => void;
    setSelectedDate: (newDate: T | null) => void;
  };
}

export const SingleDateSelectionContext = createContext<
  DatePickerState<SingleDateSelection> | undefined
>("SingleDateSelectionContext", undefined);

export const DateRangeSelectionContext = createContext<
  DatePickerState<DateRangeSelection> | undefined
>("DateRangeSelectionContext", undefined);

export interface UseDatePickerContextProps {
  selectionVariant: "single" | "range";
}

// Overloads
export function useDatePickerContext(props: {
  selectionVariant: "single";
}): DatePickerState<SingleDateSelection>;
export function useDatePickerContext(props: {
  selectionVariant: "range";
}): DatePickerState<DateRangeSelection>;
export function useDatePickerContext({
  selectionVariant,
}: UseDatePickerContextProps) {
  if (selectionVariant === "range") {
    const context = useContext(DateRangeSelectionContext);
    if (!context) {
      throw new Error(
        'useDatePickerSelection should be called with props { selectionVariant : "range" } inside DateRangeSelectionContext.Provider',
      );
    }
    return context;
  } else if (selectionVariant === "single") {
    const context = useContext(SingleDateSelectionContext);
    if (!context) {
      throw new Error(
        'useDatePickerSelection should be called with props { selectionVariant : "single" } inside SingleDateSelectionContext.Provider',
      );
    }
    return context;
  }
  throw new Error("Invalid selectionVariant");
}
