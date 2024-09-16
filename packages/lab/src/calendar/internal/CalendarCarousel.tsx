import { type DateValue, isSameMonth } from "@internationalized/date";
import { makePrefixer, useIsomorphicLayoutEffect } from "@salt-ds/core";
import { forwardRef, useEffect, useRef, useState } from "react";
import { useCalendarContext } from "./CalendarContext";
import { CalendarMonth, type CalendarMonthProps } from "./CalendarMonth";

import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import calendarCarouselCss from "./CalendarCarousel.css";
import { formatDate, monthDiff } from "./utils";

export type CalendarCarouselProps = Omit<CalendarMonthProps, "date">;

function getMonths(month: DateValue) {
  return [month.subtract({ months: 1 }), month, month.add({ months: 1 })];
}

const withBaseName = makePrefixer("saltCalendarCarousel");

export const CalendarCarousel = forwardRef<
  HTMLDivElement,
  CalendarCarouselProps
>(function CalendarCarousel(props, ref) {
  const { ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-calendar-carousel",
    css: calendarCarouselCss,
    window: targetWindow,
  });

  const {
    state: { visibleMonth, locale },
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
      <div className={withBaseName("track")} ref={containerRef}>
        {months.map((date, index) => (
          <div
            key={formatDate(date, locale)}
            className={withBaseName("slide")}
            style={{
              transform: `translateX(${diffIndex(date, baseIndex) * -101}%)`,
            }}
            aria-hidden={index !== 1 ? "true" : undefined}
          >
            <CalendarMonth {...rest} date={date} />
          </div>
        ))}
      </div>
    </div>
  );
});
