import { createContext } from "@salt-ds/core";
import type { DateFrameworkType, Timezone } from "@salt-ds/date-adapters";
import { type Context, type Ref, type SyntheticEvent, useContext } from "react";
import type { DateRangeSelection, SingleDateSelection } from "../calendar";
import type {
  DateInputRangeDetails,
  DateInputSingleDetails,
} from "../date-input";

/**
 * Interface representing the base state for a DatePicker.
 * @template TDate - The type of the date object.
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
    /**
     * Specifies the timezone behavior:
     * - If undefined, the timezone will be derived from the passed date, or from `defaultSelectedDate`/`selectedDate`.
     * - If set to "default", the default timezone of the date library will be used.
     * - If set to "system", the local system's timezone will be applied.
     * - If set to "UTC", the time will be returned in UTC.
     * - If set to a valid IANA timezone identifier, the time will be returned for that specific timezone.
     */
    timezone?: Timezone;
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
     * Function to determine if a day is highlighted.
     * @param date - The date to check.
     * @returns A string reason if the day is highlighted, otherwise `false` or `undefined`.
     */
    isDayHighlighted?: (date: TDate) => string | false | undefined;
    /**
     * Function to determine if a day is unselectable.
     * @param date - The date to check.
     * @returns A string reason if the day is unselectable, otherwise `false` or `undefined`.
     */
    isDayUnselectable?: (date: TDate) => string | false | undefined;
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
  SingleDatePickerState<DateFrameworkType> | undefined
>("SingleDateSelectionContext", undefined);

/**
 * Context for date range selection.
 */
export const DateRangeSelectionContext = createContext<
  RangeDatePickerState<DateFrameworkType> | undefined
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

export function useDatePickerContext<TDate extends DateFrameworkType>({
  selectionVariant,
}: UseDatePickerContextProps): DatePickerState<TDate> {
  const rangeContext = useContext(
    DateRangeSelectionContext as Context<
      RangeDatePickerState<TDate> | undefined
    >,
  );

  const singleContext = useContext(
    SingleDateSelectionContext as Context<
      SingleDatePickerState<TDate> | undefined
    >,
  );

  if (selectionVariant === "range") {
    if (!rangeContext) {
      throw new Error(
        'useDatePickerSelection should be called with props { selectionVariant : "range" } inside DateRangeSelectionContext.Provider',
      );
    }
    return rangeContext;
  }

  if (!singleContext) {
    throw new Error(
      'useDatePickerSelection should be called with props { selectionVariant : "single" } inside SingleDateSelectionContext.Provider',
    );
  }
  return singleContext;
}
