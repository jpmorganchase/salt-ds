import { forwardRef, useEffect, useRef, useState } from "react";
import {
  DateValue,
  getLocalTimeZone,
  isSameMonth,
  today,
} from "@internationalized/date";
import { CalendarMonth, CalendarMonthProps } from "./CalendarMonth";
import {
  makePrefixer,
  useIsomorphicLayoutEffect,
  usePrevious,
} from "@salt-ds/core";
import { useCalendarContext } from "./CalendarContext";

import calendarCarouselCss from "./CalendarCarousel.css";
import { formatDate, monthDiff } from "./utils";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

export type CalendarCarouselProps = Omit<CalendarMonthProps, "date">;

function getMonths(month: DateValue) {
  return [month.subtract({ months: 1 }), month, month.add({ months: 1 })];
}

function usePreviousMonth(visibleMonth: DateValue) {
  const previous = usePrevious(visibleMonth, [formatDate(visibleMonth)]);
  return previous ?? today(getLocalTimeZone());
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
  const previousVisibleMonth = usePreviousMonth(visibleMonth);

  useIsomorphicLayoutEffect(() => {
    if (Math.abs(diffIndex(visibleMonth, previousVisibleMonth)) > 1) {
      containerRef.current?.classList.remove(withBaseName("shouldAnimate"));
    } else {
      containerRef.current?.classList.add(withBaseName("shouldAnimate"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formatDate(visibleMonth), formatDate(previousVisibleMonth)]);

  useIsomorphicLayoutEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.transform = `translate3d(${
        diffIndex(baseIndex, visibleMonth) * -100
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
    const finishTransition = () => {
      setMonths(getMonths(visibleMonth));
    };
    const container = containerRef.current;

    if (
      container &&
      parseFloat(window.getComputedStyle(container).transitionDuration) > 0
    ) {
      container?.addEventListener("transitionend", finishTransition);

      return () => {
        container?.removeEventListener("transitionend", finishTransition);
      };
    } else {
      finishTransition();
    }

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
              transform: `translateX(${diffIndex(date, baseIndex) * -100}%)`,
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
