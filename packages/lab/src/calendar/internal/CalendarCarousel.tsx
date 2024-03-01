import { forwardRef, useEffect, useRef, useState } from "react";
import { DateValue, isSameMonth } from "@internationalized/date";
import { CalendarMonth, CalendarMonthProps } from "./CalendarMonth";
import { makePrefixer, useIsomorphicLayoutEffect } from "@salt-ds/core";
import { useCalendarContext } from "./CalendarContext";

import calendarCarouselCss from "./CalendarCarousel.css";
import { formatDate, monthDiff } from "./utils";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

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
    state: { visibleMonth },
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

  useEffect(() => {
    setMonths((oldMonths) => {
      const newMonths = getMonths(visibleMonth).filter((month) => {
        return !oldMonths.find((oldMonth) => isSameMonth(oldMonth, month));
      });

      return oldMonths.concat(newMonths);
    });
    setMonths(getMonths(visibleMonth));
    return undefined;
  }, [formatDate(visibleMonth)]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={withBaseName()}
      style={{
        overflowX: "hidden",
        position: "relative",
      }}
      ref={ref}
    >
      <div className={withBaseName("track")} ref={containerRef}>
        {months.map((date, index) => (
          <div
            key={formatDate(date)}
            className={withBaseName("slide")}
            style={{
              transform: `translateX(${diffIndex(date, baseIndex) * -101}%)`,
            }}
            aria-hidden={index !== 1 ? "true" : undefined}
          >
            <CalendarMonth isVisible={index === 1} {...rest} date={date} />
          </div>
        ))}
      </div>
    </div>
  );
});
