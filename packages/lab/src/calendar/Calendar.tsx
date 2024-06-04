import { forwardRef, useCallback } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import {
  CalendarNavigation,
  CalendarNavigationProps,
} from "./internal/CalendarNavigation";
import { CalendarWeekHeader } from "./internal/CalendarWeekHeader";
import {
  CalendarCarousel,
  CalendarCarouselProps,
} from "./internal/CalendarCarousel";
import { CalendarContext } from "./internal/CalendarContext";
import { useCalendar, useCalendarProps } from "./useCalendar";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import calendarCss from "./Calendar.css";
import { DateFormatter, getLocalTimeZone } from "@internationalized/date";
import { getCurrentLocale } from "./internal/utils";

export type CalendarProps = useCalendarProps & {
  className?: string;
  renderDayContents?: CalendarCarouselProps["renderDayContents"];
  hideYearDropdown?: CalendarNavigationProps["hideYearDropdown"];
  TooltipProps?: CalendarCarouselProps["TooltipProps"];
  hideOutOfRangeDates?: CalendarCarouselProps["hideOutOfRangeDates"];
  isCompact?: boolean;
};

const withBaseName = makePrefixer("saltCalendar");

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  function Calendar(props, ref) {
    const {
      className,
      renderDayContents,
      hideYearDropdown,
      TooltipProps,
      isCompact,
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
      isCompact,
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
            hideYearDropdown={hideYearDropdown}
            isCompact={isCompact}
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
  }
);
