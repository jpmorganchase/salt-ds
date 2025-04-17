import { type ResponsiveProp, makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  forwardRef,
} from "react";
import { CalendarContext } from "./internal/CalendarContext";
import {
  type UseCalendarMultiSelectProps,
  type UseCalendarOffsetProps,
  type UseCalendarRangeProps,
  type UseCalendarSingleProps,
  useCalendar,
} from "./useCalendar";

import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import type { DateFrameworkType } from "@salt-ds/date-adapters";
import { useLocalization } from "../localization-provider";
import calendarCss from "./Calendar.css";

/**
 * Base props for the Calendar component.
 */
export interface CalendarBaseProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content to be rendered inside the Calendar.
   */
  children: ReactNode;
  /**
   * If `true`, hides dates that are out of the selectable range.
   */
  hideOutOfRangeDates?: boolean;
  /**
   * Locale for date formatting
   */
  // biome-ignore lint/suspicious/noExplicitAny: locale is date framework dependent
  locale?: any;
  /**
   * Number of visible months, maximum 12, defaults to 1
   */
  numberOfVisibleMonths?: ResponsiveProp<
    1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  >;
}

/**
 * Props for the Calendar component with single date selection.
 * @template TDate - The type of the date object.
 */
export interface CalendarSingleProps<TDate extends DateFrameworkType>
  extends CalendarBaseProps,
    UseCalendarSingleProps<TDate> {
  /**
   * The selection variant, set to "single".
   */
  selectionVariant: "single";
}

/**
 * Props for the Calendar component with date range selection.
 * @template TDate - The type of the date object.
 */
export interface CalendarRangeProps<TDate extends DateFrameworkType>
  extends CalendarBaseProps,
    UseCalendarRangeProps<TDate> {
  /**
   * The selection variant, set to "range".
   */
  selectionVariant: "range";
}

/**
 * Props for the Calendar component with multi-select date selection.
 * @template TDate - The type of the date object.
 */
export interface CalendarMultiSelectProps<TDate extends DateFrameworkType>
  extends CalendarBaseProps,
    UseCalendarMultiSelectProps<TDate> {
  /**
   * The selection variant, set to "multiselect".
   */
  selectionVariant: "multiselect";
}

/**
 * Props for the Calendar component with offset date selection.
 * @template TDate - The type of the date object.
 */
export interface CalendarOffsetProps<TDate extends DateFrameworkType>
  extends CalendarBaseProps,
    UseCalendarOffsetProps<TDate> {
  /**
   * The selection variant, set to "offset".
   */
  selectionVariant: "offset";
}

/**
 * Type representing the props for the Calendar component with various selection variants.
 * @template TDate - The type of the date object.
 */
export type CalendarProps<TDate extends DateFrameworkType> =
  | CalendarSingleProps<TDate>
  | CalendarRangeProps<TDate>
  | CalendarMultiSelectProps<TDate>
  | CalendarOffsetProps<TDate>;

const withBaseName = makePrefixer("saltCalendar");

export const Calendar = forwardRef<
  HTMLDivElement,
  CalendarProps<DateFrameworkType>
>(
  <TDate extends DateFrameworkType>(
    props: CalendarProps<TDate>,
    ref: React.Ref<HTMLDivElement>,
  ) => {
    const targetWindow = useWindow();
    const { dateAdapter } = useLocalization<TDate>();
    useComponentCssInjection({
      testId: "salt-calendar",
      css: calendarCss,
      window: targetWindow,
    });
    const {
      children,
      className,
      selectedDate,
      defaultSelectedDate,
      visibleMonth: visibleMonthProp,
      defaultVisibleMonth,
      onSelectionChange,
      onVisibleMonthChange,
      hideOutOfRangeDates,
      isDayUnselectable,
      isDayHighlighted,
      isDayDisabled,
      locale,
      minDate,
      maxDate,
      numberOfVisibleMonths = 1,
      selectionVariant,
      onHoveredDateChange,
      hoveredDate,
      ...propsRest
    } = props;
    let startDateOffset: CalendarOffsetProps<TDate>["startDateOffset"];
    let endDateOffset: CalendarOffsetProps<TDate>["startDateOffset"];
    let rest: Partial<typeof props>;
    if (selectionVariant === "offset") {
      ({ startDateOffset, endDateOffset, ...rest } =
        propsRest as CalendarOffsetProps<TDate>);
    } else {
      rest = propsRest;
    }
    // biome-ignore lint/suspicious/noExplicitAny: type guard
    const useCalendarProps: any = {
      selectedDate,
      defaultSelectedDate,
      visibleMonth: visibleMonthProp,
      defaultVisibleMonth,
      onSelectionChange,
      onVisibleMonthChange,
      isDayUnselectable,
      isDayHighlighted,
      isDayDisabled,
      locale,
      minDate,
      maxDate,
      numberOfVisibleMonths,
      selectionVariant,
      onHoveredDateChange,
      hideOutOfRangeDates,
      hoveredDate,
      startDateOffset,
      endDateOffset,
    };
    const { state, helpers } = useCalendar<TDate>(useCalendarProps);
    const calendarLabel = dateAdapter.format(
      state.visibleMonth,
      "MMMM YYYY",
      locale,
    );

    return (
      <CalendarContext.Provider
        value={{
          state,
          helpers,
        }}
      >
        <div
          className={clsx(withBaseName(), className)}
          role="application"
          aria-label={calendarLabel}
          ref={ref}
          {...rest}
        >
          {children}
        </div>
      </CalendarContext.Provider>
    );
  },
);
