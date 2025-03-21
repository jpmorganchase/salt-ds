import { createContext } from "@salt-ds/core";
import type { DateFrameworkType } from "@salt-ds/date-adapters";
import { type Context, type Ref, type SyntheticEvent, useContext } from "react";
import type { DateRangeSelection, SingleDateSelection } from "../calendar";
import type {
  DateInputRangeDetails,
  DateInputSingleDetails,
} from "../date-input";

/**
 * Interface representing the base state for a DatePicker.
 */
interface DatePickerBaseState<TDate extends DateFrameworkType> {
  /**
   * The state properties of the DatePicker.
   */
  state: {
    /**
     * If `true`, the DatePicker is disabled.
     */
    disabled?: boolean;
    /**
     * If `true`, the DatePicker is read-only.
     */
    readOnly?: boolean;
    /**
     * If `true`, the DatePicker has been cancelled.
     */
    cancelled?: boolean;
    /**
     * If `true`, the apply action is enabled.
     */
    enableApply?: boolean;
    /**
     * The minimum selectable date.
     */
    minDate?: TDate;
    /**
     * The maximum selectable date.
     */
    maxDate?: TDate;
    /**
     * Reference to the container element.
     */
    containerRef: Ref<HTMLDivElement>;
  };
  /**
   * Helper functions for managing the DatePicker state.
   */
  helpers: {
    /**
     * Cancels the DatePicker action.
     * @param event - event that triggered the state change
     */
    cancel: (event?: Event) => void;
    /**
     * Sets the enableApply state.
     * @param newEnableApply - The new value for enableApply.
     */
    setEnableApply: (newEnableApply: boolean) => void;
  };
}

/**
 * Interface representing the state for a single date picker.
 */
export interface SingleDatePickerState<TDate extends DateFrameworkType>
  extends DatePickerBaseState<TDate> {
  /**
   * The state properties of the single date picker.
   */
  state: DatePickerBaseState<TDate>["state"] & {
    /**
     * The selected date.
     */
    selectedDate: SingleDateSelection<TDate> | null;
    /**
     * The default selected date.
     */
    defaultSelectedDate?: SingleDateSelection<TDate>;
  };
  /**
   * Helper functions for managing the single date picker state.
   */
  helpers: DatePickerBaseState<TDate>["helpers"] & {
    /**
     * Apply the selected single date.
     * @param event - The synthetic event.
     * @param date - The new applied date.
     */
    apply: (
      event: SyntheticEvent,
      date: SingleDateSelection<TDate> | null,
    ) => void;
    /**
     * Select a single date.
     * @param event - The synthetic event.
     * @param date - The selected date or null.
     * @param details - Details of selection, such as errors and original value.
     */
    select: (
      event: SyntheticEvent,
      date: SingleDateSelection<TDate> | null,
      details?: DateInputSingleDetails,
    ) => void;
  };
}

/**
 * Interface representing the state for a range date picker.
 */
export interface RangeDatePickerState<TDate extends DateFrameworkType>
  extends DatePickerBaseState<TDate> {
  /**
   * The state properties of the range date picker.
   */
  state: DatePickerBaseState<TDate>["state"] & {
    /**
     * The selected date range.
     */
    selectedDate: DateRangeSelection<TDate> | null;
    /**
     * The default selected date range.
     */
    defaultSelectedDate?: DateRangeSelection<TDate>;
  };
  /**
   * Helper functions for managing the range date picker state.
   */
  helpers: DatePickerBaseState<TDate>["helpers"] & {
    /**
     * Apply the selected date range.
     * @param event - The synthetic event.
     * @param date - The new applied date range
     */
    apply: (
      event: SyntheticEvent,
      date: DateRangeSelection<TDate> | null,
    ) => void;
    /**
     * Select a date range.
     * @param event - The synthetic event.
     * @param date - The selected date.
     * @param details - Details of selection, such as errors and original value.     */
    select: (
      event: SyntheticEvent,
      date: DateRangeSelection<TDate> | null,
      details?: DateInputRangeDetails,
    ) => void;
  };
}

/**
 * Type representing the state of a date picker, either single or range.
 */
export type DatePickerState<TDate extends DateFrameworkType> =
  | SingleDatePickerState<TDate>
  | RangeDatePickerState<TDate>;

/**
 * Context for single date selection.
 */
export const SingleDateSelectionContext = createContext<
  SingleDatePickerState<any> | undefined
>("SingleDateSelectionContext", undefined);

/**
 * Context for date range selection.
 */
export const DateRangeSelectionContext = createContext<
  RangeDatePickerState<any> | undefined
>("DateRangeSelectionContext", undefined);

/**
 * Props for using the date picker context.
 */
export interface UseDatePickerContextProps {
  /**
   * The selection variant, either "single" or "range".
   */
  selectionVariant: "single" | "range";
}

// Overloads

/**
 * Hook to use the date picker context for single date selection.
 * @param props - The props for the hook.
 * @returns The state of the single date picker.
 */
export function useDatePickerContext<TDate extends DateFrameworkType>(props: {
  selectionVariant: "single";
}): SingleDatePickerState<TDate>;

/**
 * Hook to use the date picker context for range date selection.
 * @param props - The props for the hook.
 * @returns The state of the range date picker.
 */
export function useDatePickerContext<TDate extends DateFrameworkType>(props: {
  selectionVariant: "range";
}): RangeDatePickerState<TDate>;

export function useDatePickerContext<TDate extends DateFrameworkType>({
  selectionVariant,
}: UseDatePickerContextProps): DatePickerState<TDate> {
  if (selectionVariant === "range") {
    const context = useContext(
      DateRangeSelectionContext as Context<
        RangeDatePickerState<TDate> | undefined
      >,
    );
    if (!context) {
      throw new Error(
        'useDatePickerSelection should be called with props { selectionVariant : "range" } inside DateRangeSelectionContext.Provider',
      );
    }
    return context;
  }
  const context = useContext(
    SingleDateSelectionContext as Context<
      SingleDatePickerState<TDate> | undefined
    >,
  );
  if (!context) {
    throw new Error(
      'useDatePickerSelection should be called with props { selectionVariant : "single" } inside SingleDateSelectionContext.Provider',
    );
  }
  return context;
}
