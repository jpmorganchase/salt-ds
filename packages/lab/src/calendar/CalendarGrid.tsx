import { makePrefixer, useIsomorphicLayoutEffect } from "@salt-ds/core";
import {
  type ComponentPropsWithoutRef,
  type FocusEventHandler,
  forwardRef,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useCalendarContext } from "./internal/CalendarContext";
import {
  CalendarMonth,
  type CalendarMonthProps,
} from "./internal/CalendarMonth";

import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { type DateFrameworkType, useLocalization } from "../date-adapters";
import calendarGridCss from "./CalendarGrid.css";
import { monthDiff } from "./internal/utils";

/**
 * Props for the CalendarGrid component.
 */
export interface CalendarGridProps<TDate extends DateFrameworkType>
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * Props getter to pass to each CalendarMonth element
   */
  getCalendarMonthProps?: (
    date: TDate,
  ) => Omit<CalendarMonthProps<TDate>, "date">;
}

const withBaseName = makePrefixer("saltCalendarGrid");

export const CalendarGrid = forwardRef<HTMLDivElement, CalendarGridProps<any>>(
  <TDate extends DateFrameworkType>(
    props: CalendarGridProps<TDate>,
    ref: React.Ref<HTMLDivElement>,
  ) => {
    const {
      onFocus,
      onBlur,
      getCalendarMonthProps = () => undefined,
      ...rest
    } = props;

    const { dateAdapter } = useLocalization<TDate>();

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-calendar-grid",
      css: calendarGridCss,
      window: targetWindow,
    });

    const {
      state: { visibleMonth, locale },
      helpers: { setCalendarFocused },
    } = useCalendarContext<TDate>();
    const containerRef = useRef<HTMLDivElement>(null);
    const diffIndex = (a: TDate, b: TDate) =>
      monthDiff<TDate>(dateAdapter, a, b);

    const { current: baseIndex } = useRef(visibleMonth);

    useIsomorphicLayoutEffect(() => {
      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${
          diffIndex(baseIndex, visibleMonth) * -101 // needs to be higher than 100% so the next month doesn't show on the edges
        }%, 0, 0)`;
      }
    });

    const getMonths = useCallback(
      (month: TDate) => {
        return [
          dateAdapter.subtract(month, { months: 1 }),
          month,
          dateAdapter.add(month, { months: 1 }),
        ];
      },
      [dateAdapter.subtract],
    );

    const handleFocus: FocusEventHandler<HTMLDivElement> = useCallback(
      (event) => {
        setCalendarFocused(true);
        onFocus?.(event);
      },
      [setCalendarFocused, onFocus],
    );

    const handleBlur: FocusEventHandler<HTMLDivElement> = useCallback(
      (event) => {
        setCalendarFocused(false);
        onBlur?.(event);
      },
      [setCalendarFocused, onBlur],
    );

    const months = useMemo(() => {
      return getMonths(visibleMonth);
    }, [dateAdapter.format(visibleMonth)]);

    return (
      <div
        className={withBaseName()}
        tabIndex={-1} // https://bugzilla.mozilla.org/show_bug.cgi?id=1069739
        style={{
          overflowX: "hidden",
          position: "relative",
        }}
        ref={ref}
      >
        <div
          className={withBaseName("grid")}
          ref={containerRef}
          onBlur={handleBlur}
          onFocus={handleFocus}
          {...rest}
        >
          {months.map((date, index) => (
            <div
              key={dateAdapter.format(date, locale)}
              className={withBaseName("slide")}
              style={{
                transform: `translateX(${diffIndex(date, baseIndex) * -101}%)`,
              }}
              aria-hidden={index !== 1 ? "true" : undefined}
            >
              <CalendarMonth {...getCalendarMonthProps(date)} date={date} />
            </div>
          ))}
        </div>
      </div>
    );
  },
);
