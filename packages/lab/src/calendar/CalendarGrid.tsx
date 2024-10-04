import { type DateValue, isSameMonth } from "@internationalized/date";
import { makePrefixer, useIsomorphicLayoutEffect } from "@salt-ds/core";
import {
  type ComponentPropsWithoutRef,
  type FocusEventHandler,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useCalendarContext } from "./internal/CalendarContext";
import {
  CalendarMonth,
  type CalendarMonthProps,
} from "./internal/CalendarMonth";

import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import calendarGridCss from "./CalendarGrid.css";
import { formatDate, monthDiff } from "./internal/utils";

export interface CalendarGridProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Props getter to pass to each CalendarMonth element
   */
  getCalendarMonthProps?: (date: DateValue) => Omit<CalendarMonthProps, "date">;
}

function getMonths(month: DateValue) {
  return [month.subtract({ months: 1 }), month, month.add({ months: 1 })];
}

const withBaseName = makePrefixer("saltCalendarGrid");

export const CalendarGrid = forwardRef<
  HTMLDivElement,
  CalendarGridProps
>(function CalendarGrid(props, ref) {
  const {
    onFocus,
    onBlur,
    getCalendarMonthProps = () => undefined,
    ...rest
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-calendar-grid",
    css: calendarGridCss,
    window: targetWindow,
  });

  const {
    state: { visibleMonth, locale },
    helpers: { setCalendarFocused },
  } = useCalendarContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const diffIndex = (a: DateValue, b: DateValue) => monthDiff(a, b);

  const { current: baseIndex } = useRef(visibleMonth);

  useIsomorphicLayoutEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.transform = `translate3d(${
        diffIndex(baseIndex, visibleMonth) * -101 // needs to be higher than 100% so the next month doesn't show on the edges
      }%, 0, 0)`;
    }
  });

  const [months, setMonths] = useState(() => getMonths(visibleMonth));

  // biome-ignore lint/correctness/useExhaustiveDependencies: uses formatData to change visibleMonth into string
  useEffect(() => {
    setMonths((oldMonths) => {
      const newMonths = getMonths(visibleMonth).filter((month) => {
        return !oldMonths.find((oldMonth) => isSameMonth(oldMonth, month));
      });

      return oldMonths.concat(newMonths);
    });
    setMonths(getMonths(visibleMonth));
    return undefined;
  }, [formatDate(visibleMonth, locale)]);

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
            key={formatDate(date, locale)}
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
});
