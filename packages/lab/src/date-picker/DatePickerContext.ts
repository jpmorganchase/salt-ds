import type { DateValue } from "@internationalized/date";
import { createContext } from "@salt-ds/core";
import { useContext } from "react";
import type { DateRangeSelection, SingleDateSelection } from "../calendar";
import type { DateInputRangeError, DateInputSingleError } from "../date-input";

/**
 * Interface representing the base state for a DatePicker.
 */
interface DatePickerBaseState {
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
    minDate?: DateValue;
    /**
     * The maximum selectable date.
     */
    maxDate?: DateValue;
    /**
     * Reference to the container element.
     */
    containerRef: React.Ref<HTMLDivElement>;
    /**
     * The locale used for date formatting.
     */
    locale?: string;
    /**
     * The time zone used for date formatting.
     */
    timeZone?: string;
  };
  /**
   * Helper functions for managing the DatePicker state.
   */
  helpers: {
    /**
     * Cancels the DatePicker action.
     */
    cancel: () => void;
    /**
     * Sets the enableApply state.
     * @param newEnableApply - The new value for enableApply.
     */
    setEnableApply: (newEnableApply: boolean) => void;
  };
}

/**
 * Type representing a single date picker error.
 */
export type SingleDatePickerError = DateInputSingleError;

/**
 * Type representing a range date picker error.
 */
export type RangeDatePickerError = DateInputRangeError;

/**
 * Interface representing the state for a single date picker.
 */
export interface SingleDatePickerState extends DatePickerBaseState {
  /**
   * The state properties of the single date picker.
   */
  state: DatePickerBaseState["state"] & {
    /**
     * The selected date.
     */
    selectedDate: SingleDateSelection | null;
    /**
     * The default selected date.
     */
    defaultSelectedDate?: SingleDateSelection;
  };
  /**
   * Helper functions for managing the single date picker state.
   */
  helpers: DatePickerBaseState["helpers"] & {
    /**
     * Applies the selected date.
     * @param newDate - The new selected date.
     * @param error - The error encountered during selection, if any.
     */
    apply: (
      newDate: SingleDateSelection | null,
      error: SingleDatePickerError,
    ) => void;
    /**
     * Sets the selected date.
     * @param newDate - The new selected date.
     * @param error - The error encountered during selection, if any.
     */
    setSelectedDate: (
      newDate: SingleDateSelection | null,
      error: string | false,
    ) => void;
  };
}

/**
 * Interface representing the state for a range date picker.
 */
export interface RangeDatePickerState extends DatePickerBaseState {
  /**
   * The state properties of the range date picker.
   */
  state: DatePickerBaseState["state"] & {
    /**
     * The selected date range.
     */
    selectedDate: DateRangeSelection | null;
    /**
     * The default selected date range.
     */
    defaultSelectedDate?: DateRangeSelection;
  };
  /**
   * Helper functions for managing the range date picker state.
   */
  helpers: DatePickerBaseState["helpers"] & {
    /**
     * Applies the selected date range.
     * @param newDate - The new selected date range.
     * @param error - The error encountered during selection, if any.
     */
    apply: (
      newDate: DateRangeSelection | null,
      error: RangeDatePickerError,
    ) => void;
    /**
     * Sets the selected date range.
     * @param newDate - The new selected date range.
     * @param error - The error encountered during selection, if any.
     */
    setSelectedDate: (
      newDate: DateRangeSelection | null,
      error: { startDate: string | false; endDate: string | false },
    ) => void;
  };
}

/**
 * Type representing the state of a date picker, either single or range.
 */
export type DatePickerState = SingleDatePickerState | RangeDatePickerState;

/**
 * Context for single date selection.
 */
export const SingleDateSelectionContext = createContext<
  SingleDatePickerState | undefined
>("SingleDateSelectionContext", undefined);

/**
 * Context for date range selection.
 */
export const DateRangeSelectionContext = createContext<
  RangeDatePickerState | undefined
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
export function useDatePickerContext(props: {
  selectionVariant: "single";
}): SingleDatePickerState;

/**
 * Hook to use the date picker context for range date selection.
 * @param props - The props for the hook.
 * @returns The state of the range date picker.
 */
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
