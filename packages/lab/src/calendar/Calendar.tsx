import { makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import { forwardRef, useCallback } from "react";
import {
  CalendarCarousel,
  type CalendarCarouselProps,
} from "./internal/CalendarCarousel";
import { CalendarContext } from "./internal/CalendarContext";
import {
  CalendarNavigation,
  type CalendarNavigationProps,
} from "./internal/CalendarNavigation";
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

import { DateFormatter, getLocalTimeZone } from "@internationalized/date";
import calendarCss from "./Calendar.css";
import { getCurrentLocale } from "./internal/utils";

export type CalendarBaseProps = {
  className?: string;
  renderDayContents?: CalendarCarouselProps["renderDayContents"];
  hideYearDropdown?: CalendarNavigationProps["hideYearDropdown"];
  borderedDropdown?: CalendarNavigationProps["borderedDropdown"];
  TooltipProps?: CalendarCarouselProps["TooltipProps"];
  hideOutOfRangeDates?: CalendarCarouselProps["hideOutOfRangeDates"];
};
export interface CalendarSingleProps
  extends CalendarBaseProps,
    UseCalendarSingleProps {
  selectionVariant: "single";
}
export interface CalendarRangeProps
  extends CalendarBaseProps,
    UseCalendarRangeProps {
  selectionVariant: "range";
}
export interface CalendarMultiSelectProps
  extends CalendarBaseProps,
    UseCalendarMultiSelectProps {
  selectionVariant: "multiselect";
}
export interface CalendarOffsetProps
  extends CalendarBaseProps,
    UseCalendarOffsetProps {
  selectionVariant: "offset";
}

export type CalendarProps =
  | CalendarSingleProps
  | CalendarRangeProps
  | CalendarMultiSelectProps
  | CalendarOffsetProps;

const withBaseName = makePrefixer("saltCalendar");

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  function Calendar(props, ref) {
    const {
      className,
      renderDayContents,
      hideYearDropdown,
      TooltipProps,
      borderedDropdown,
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-calendar",
      css: calendarCss,
      window: targetWindow,
    });

    const { state, helpers } = useCalendar({
      hideYearDropdown,
      ...rest,
    });

    const { setCalendarFocused } = helpers;

    const handleFocus = useCallback(() => {
      setCalendarFocused(true);
    }, [setCalendarFocused]);

    const handleBlur = useCallback(() => {
      setCalendarFocused(false);
    }, [setCalendarFocused]);

    const calendarLabel = new DateFormatter(getCurrentLocale(), {
      month: "long",
      year: "numeric",
    }).format(state.visibleMonth.toDate(getLocalTimeZone()));
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
          <CalendarNavigation
            borderedDropdown={borderedDropdown}
            hideYearDropdown={hideYearDropdown}
          />
          <CalendarWeekHeader />
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
