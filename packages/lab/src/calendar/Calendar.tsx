import { forwardRef } from "react";
import classnames from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
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

import "./Calendar.css";

export type CalendarProps = useCalendarProps & {
  className?: string;
  renderDayContents?: CalendarCarouselProps["renderDayContents"];
  hideYearDropdown?: CalendarNavigationProps["hideYearDropdown"];
  TooltipProps?: CalendarCarouselProps["TooltipProps"];
  hideOutOfRangeDates?: CalendarCarouselProps["hideOutOfRangeDates"];
};

const withBaseName = makePrefixer("uitkCalendar");

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  function Calendar(props, ref) {
    const {
      className,
      renderDayContents,
      hideYearDropdown,
      TooltipProps,
      ...rest
    } = props;

    const { state, helpers } = useCalendar({ ...rest });

    return (
      <CalendarContext.Provider
        value={{
          state,
          helpers,
        }}
      >
        <div
          className={classnames(withBaseName(), className)}
          role="application"
          ref={ref}
        >
          <CalendarNavigation hideYearDropdown={hideYearDropdown} />
          <CalendarWeekHeader />
          <CalendarCarousel
            renderDayContents={renderDayContents}
            TooltipProps={TooltipProps}
          />
        </div>
      </CalendarContext.Provider>
    );
  }
);
