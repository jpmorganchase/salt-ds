import { makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  forwardRef,
  useCallback,
} from "react";
import {
  CalendarCarousel,
  type CalendarCarouselProps,
} from "./internal/CalendarCarousel";
import { CalendarContext } from "./internal/CalendarContext";
import { CalendarWeekHeader } from "./internal/CalendarWeekHeader";
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
  children?: ReactNode;

  /**
   * Additional class names to apply to the Calendar.
   */
  className?: string;

  /**
   * Function to render the contents of a day.
   */
  renderDayContents?: CalendarCarouselProps["renderDayContents"];

  /**
   * Props for the tooltip component.
   */
  TooltipProps?: CalendarCarouselProps["TooltipProps"];

  /**
   * If `true`, hides dates that are out of the selectable range.
   */
  hideOutOfRangeDates?: CalendarCarouselProps["hideOutOfRangeDates"];
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
    const { children, className, renderDayContents, TooltipProps, ...rest } =
      props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-calendar",
      css: calendarCss,
      window: targetWindow,
    });

    const { state, helpers } = useCalendar({
      ...rest,
    });

    const { setCalendarFocused } = helpers;

    const handleFocus = useCallback(() => {
      setCalendarFocused(true);
    }, [setCalendarFocused]);

    const handleBlur = useCallback(() => {
      setCalendarFocused(false);
    }, [setCalendarFocused]);

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
        >
          {children ?? null}
          <CalendarWeekHeader locale={state.locale} />
          <CalendarCarousel
            onFocus={handleFocus}
            onBlur={handleBlur}
            renderDayContents={renderDayContents}
            TooltipProps={TooltipProps}
          />
        </div>
      </CalendarContext.Provider>
    );
  },
);
