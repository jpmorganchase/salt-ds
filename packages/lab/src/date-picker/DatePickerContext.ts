import type { DateValue } from "@internationalized/date";
import { createContext } from "@salt-ds/core";
import { useContext } from "react";
import type { DateRangeSelection, SingleDateSelection } from "../calendar";
import type { DateInputRangeError, DateInputSingleError } from "../date-input";

interface DatePickerBaseState {
  state: {
    disabled?: boolean;
    readOnly?: boolean;
    cancelled?: boolean;
    autoApplyDisabled?: boolean;
    minDate?: DateValue;
    maxDate?: DateValue;
    containerRef: React.Ref<HTMLDivElement>;
    locale?: string;
    timeZone?: string;
  };
  helpers: {
    cancel: () => void;
    setAutoApplyDisabled: (newAutoApplyDisabled: boolean) => void;
  };
}

export type SingleDatePickerError = DateInputSingleError;
export type RangeDatePickerError = DateInputRangeError;

export interface SingleDatePickerState extends DatePickerBaseState {
  state: DatePickerBaseState["state"] & {
    selectedDate: SingleDateSelection | null;
    defaultSelectedDate?: SingleDateSelection;
  };
  helpers: DatePickerBaseState["helpers"] & {
    apply: (
      newDate: SingleDateSelection | null,
      error: SingleDatePickerError,
    ) => void;
    setSelectedDate: (
      newDate: SingleDateSelection | null,
      error: string | false,
    ) => void;
  };
}

export interface RangeDatePickerState extends DatePickerBaseState {
  state: DatePickerBaseState["state"] & {
    selectedDate: DateRangeSelection | null;
    defaultSelectedDate?: DateRangeSelection;
  };
  helpers: DatePickerBaseState["helpers"] & {
    apply: (
      newDate: DateRangeSelection | null,
      error: RangeDatePickerError,
    ) => void;
    setSelectedDate: (
      newDate: DateRangeSelection | null,
      error: { startDate: string | false; endDate: string | false },
    ) => void;
  };
}

export type DatePickerState = SingleDatePickerState | RangeDatePickerState;

export const SingleDateSelectionContext = createContext<
  SingleDatePickerState | undefined
>("SingleDateSelectionContext", undefined);

export const DateRangeSelectionContext = createContext<
  RangeDatePickerState | undefined
>("DateRangeSelectionContext", undefined);

export interface UseDatePickerContextProps {
  selectionVariant: "single" | "range";
}

// Overloads
export function useDatePickerContext(props: {
  selectionVariant: "single";
}): SingleDatePickerState;
export function useDatePickerContext(props: {
  selectionVariant: "range";
}): RangeDatePickerState;
export function useDatePickerContext({
  selectionVariant,
}: UseDatePickerContextProps): DatePickerState {
  if (selectionVariant === "range") {
    const context = useContext(DateRangeSelectionContext);
    if (!context) {
      throw new Error(
        'useDatePickerSelection should be called with props { selectionVariant : "range" } inside DateRangeSelectionContext.Provider',
      );
    }
    return context;
  }
  const context = useContext(SingleDateSelectionContext);
  if (!context) {
    throw new Error(
      'useDatePickerSelection should be called with props { selectionVariant : "single" } inside SingleDateSelectionContext.Provider',
    );
  }
  return context;
}
