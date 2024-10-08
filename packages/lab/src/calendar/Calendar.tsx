import { makePrefixer } from "@salt-ds/core";
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

import { DateFormatter } from "@internationalized/date";
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
}

/**
 * Props for the Calendar component with single date selection.
 */
export interface CalendarSingleProps
  extends CalendarBaseProps,
    UseCalendarSingleProps {
  /**
   * The selection variant, set to "single".
   */
  selectionVariant: "single";
}

/**
 * Props for the Calendar component with date range selection.
 */
export interface CalendarRangeProps
  extends CalendarBaseProps,
    UseCalendarRangeProps {
  /**
   * The selection variant, set to "range".
   */
  selectionVariant: "range";
}

/**
 * Props for the Calendar component with multi-select date selection.
 */
export interface CalendarMultiSelectProps
  extends CalendarBaseProps,
    UseCalendarMultiSelectProps {
  /**
   * The selection variant, set to "multiselect".
   */
  selectionVariant: "multiselect";
}

/**
 * Props for the Calendar component with offset date selection.
 */
export interface CalendarOffsetProps
  extends CalendarBaseProps,
    UseCalendarOffsetProps {
  /**
   * The selection variant, set to "offset".
   */
  selectionVariant: "offset";
}

/**
 * Type representing the props for the Calendar component with various selection variants.
 */
export type CalendarProps =
  | CalendarSingleProps
  | CalendarRangeProps
  | CalendarMultiSelectProps
  | CalendarOffsetProps;

const withBaseName = makePrefixer("saltCalendar");

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  function Calendar(props, ref) {
    const targetWindow = useWindow();
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
      timeZone,
      locale,
      defaultVisibleMonth,
      onSelectionChange,
      onVisibleMonthChange,
      hideOutOfRangeDates,
      isDayUnselectable,
      isDayHighlighted,
      isDayDisabled,
      minDate,
      maxDate,
      selectionVariant,
      onHoveredDateChange,
      hoveredDate,
      ...propsRest
    } = props;
    let startDateOffset: CalendarOffsetProps["startDateOffset"];
    let endDateOffset: CalendarOffsetProps["startDateOffset"];
    let rest: Partial<typeof props>;
    if (selectionVariant === "offset") {
      ({ startDateOffset, endDateOffset, ...rest } =
        propsRest as CalendarOffsetProps);
    } else {
      rest = propsRest;
    }
    // biome-ignore lint/suspicious/noExplicitAny: type guard
    const useCalendarProps: any = {
      selectedDate,
      defaultSelectedDate,
      visibleMonth: visibleMonthProp,
      timeZone,
      locale,
      defaultVisibleMonth,
      onSelectionChange,
      onVisibleMonthChange,
      isDayUnselectable,
      isDayHighlighted,
      isDayDisabled,
      minDate,
      maxDate,
      selectionVariant,
      onHoveredDateChange,
      hideOutOfRangeDates,
      hoveredDate,
      startDateOffset,
      endDateOffset,
    };
    const { state, helpers } = useCalendar(useCalendarProps);
    const calendarLabel = new DateFormatter(state.locale, {
      month: "long",
      year: "numeric",
    }).format(state.visibleMonth.toDate(state.timeZone));

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
