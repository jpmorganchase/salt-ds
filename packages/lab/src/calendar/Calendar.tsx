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

export type CalendarProps = useCalendarProps & {
  className?: string;
  renderDayContents?: CalendarCarouselProps["renderDayContents"];
  hideYearDropdown?: CalendarNavigationProps["hideYearDropdown"];
  TooltipProps?: CalendarCarouselProps["TooltipProps"];
  hideOutOfRangeDates?: CalendarCarouselProps["hideOutOfRangeDates"];
};

const withBaseName = makePrefixer("saltCalendar");

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  function Calendar(props, ref) {
    const {
      className,
      renderDayContents,
      hideYearDropdown,
      TooltipProps,
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-calendar",
      css: calendarCss,
      window: targetWindow,
    });

    const { state, helpers } = useCalendar({ hideYearDropdown, ...rest });

    const { setCalendarFocused } = helpers;

    const handleFocus = useCallback(() => {
      setCalendarFocused(true);
    }, [setCalendarFocused]);

    const handleBlur = useCallback(() => {
      setCalendarFocused(false);
    }, [setCalendarFocused]);

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
          ref={ref}
        >
          <CalendarNavigation hideYearDropdown={hideYearDropdown} />
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
