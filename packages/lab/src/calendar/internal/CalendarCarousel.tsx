import { forwardRef, useRef, useEffect, useState } from "react";
import dayjs from "./dayjs";
import { CalendarMonth, CalendarMonthProps } from "./CalendarMonth";
import {
  makePrefixer,
  useIsomorphicLayoutEffect,
} from "@jpmorganchase/uitk-core";
import { usePrevious } from "../../utils";
import { useCalendarContext } from "./CalendarContext";

import "./CalendarCarousel.css";

export type CalendarCarouselProps = Omit<CalendarMonthProps, "date">;

function getMonths(month: Date | undefined) {
  return [
    dayjs(month)
      .startOf("month")
      .subtract(1, "month")
      .startOf("month")
      .format("L"),
    dayjs(month).startOf("month").format("L"),
    dayjs(month).startOf("month").add(1, "month").startOf("month").format("L"),
  ];
}

const withBaseName = makePrefixer("uitkCalendarCarousel");

export const CalendarCarousel = forwardRef<
  HTMLDivElement,
  CalendarCarouselProps
>(function CalendarCarousel(props, ref) {
  const { ...rest } = props;

  const {
    state: { visibleMonth },
  } = useCalendarContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const diffIndex = (a: Date | undefined, b: Date | undefined) =>
    dayjs(a).diff(dayjs(b), "month");

  const previousMonth = usePrevious(visibleMonth, [
    dayjs(visibleMonth).format("L"),
  ]);
  const { current: baseIndex } = useRef(visibleMonth);

  useIsomorphicLayoutEffect(() => {
    if (Math.abs(diffIndex(visibleMonth, previousMonth)) > 1) {
      containerRef.current?.classList.remove(withBaseName("shouldAnimate"));
    } else {
      containerRef.current?.classList.add(withBaseName("shouldAnimate"));
    }
  }, [dayjs(visibleMonth).format("L"), dayjs(previousMonth).format("L")]);

  useIsomorphicLayoutEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.transform = `translate3d(${
        diffIndex(baseIndex, visibleMonth) * 100
      }%, 0, 0)`;
    }
  });

  const [months, setMonths] = useState(() => getMonths(visibleMonth));

  useEffect(() => {
    setMonths((oldMonths) => {
      const newMonths = getMonths(visibleMonth);
      const monthSet = new Set(oldMonths.concat(newMonths));

      return Array.from(monthSet);
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
  }, [dayjs(visibleMonth).format("L")]); // eslint-disable-line react-hooks/exhaustive-deps

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
            key={dayjs(date).format("L")}
            className={withBaseName("slide")}
            style={{
              transform: `translateX(${
                diffIndex(dayjs(date).toDate(), baseIndex) * 100
              }%)`,
            }}
            aria-hidden={index !== 1 ? "true" : undefined}
          >
            <CalendarMonth
              isVisible={index === 1}
              {...rest}
              date={dayjs(date).toDate()}
            />
          </div>
        ))}
      </div>
    </div>
  );
});
