import {
  GridItem,
  GridLayout,
  type ResponsiveProp,
  useForkRef,
} from "@salt-ds/core";
import type { DateFrameworkType } from "@salt-ds/date-adapters";
import {
  type ComponentPropsWithoutRef,
  type FocusEventHandler,
  forwardRef,
  useMemo,
  useRef,
} from "react";
import { useLocalization } from "../localization-provider";
import {
  CalendarMonthHeader,
  type CalendarMonthHeaderProps,
} from "./CalendarMonthHeader";
import {
  CalendarWeekHeader,
  type CalendarWeekHeaderProps,
} from "./CalendarWeekHeader";
import { useCalendarContext } from "./internal/CalendarContext";
import type { CalendarDayProps } from "./internal/CalendarDay";
import { CalendarMonth } from "./internal/CalendarMonth";

/**
 * Props for the CalendarGrid component.
 */
export interface CalendarGridProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Number of columns
   */
  columns?: ResponsiveProp<number | string>;
  /**
   * Props for `CalendarWeekHeader`
   */
  CalendarWeekHeaderProps?: Partial<CalendarWeekHeaderProps>;
  /**
   * Props for `CalendarMonthHeader`
   */
  CalendarMonthHeaderProps?: Partial<CalendarMonthHeaderProps>;
  /**
   * Props for `CalendarDay`
   */
  CalendarDayProps?: Partial<CalendarDayProps>;
}

export const CalendarGrid = forwardRef<HTMLDivElement, CalendarGridProps>(
  (props: CalendarGridProps, ref: React.Ref<HTMLDivElement>) => {
    const {
      CalendarDayProps,
      CalendarWeekHeaderProps,
      CalendarMonthHeaderProps,
      columns = 1,
      onBlur,
      ...rest
    } = props;

    const { dateAdapter } = useLocalization<DateFrameworkType>();

    const {
      helpers: { setFocusedDate, setHoveredDate },
      state: { visibleMonth, numberOfVisibleMonths = 1 },
    } = useCalendarContext();
    const calendarGridRef = useRef<HTMLDivElement>(null);
    const containerRef = useForkRef(ref, calendarGridRef);

    const handleCalendarGridBlur: FocusEventHandler<HTMLDivElement> = (
      event,
    ) => {
      event.stopPropagation();
      const relatedTarget = event.relatedTarget as HTMLElement;
      if (
        calendarGridRef.current &&
        relatedTarget &&
        calendarGridRef.current.contains(relatedTarget)
      ) {
        return;
      }
      setFocusedDate(event, null);
      setHoveredDate(event, null);
      onBlur?.(event);
    };

    const visibleMonths = useMemo(
      () =>
        Array.from({ length: numberOfVisibleMonths }, (_value, index) =>
          dateAdapter.add(visibleMonth, {
            months: index,
          }),
        ),
      [dateAdapter, numberOfVisibleMonths, visibleMonth],
    );

    return (
      <GridLayout
        columns={columns}
        gap={1}
        ref={containerRef}
        onBlur={handleCalendarGridBlur}
        {...rest}
      >
        {visibleMonths.map((gridItemVisibleMonth) => (
          <GridItem
            key={`calendar-grid-item-${dateAdapter.format(gridItemVisibleMonth, "MMMM YYYY")}`}
          >
            {numberOfVisibleMonths > 1 ? (
              <CalendarMonthHeader
                {...CalendarMonthHeaderProps}
                month={gridItemVisibleMonth}
              />
            ) : null}
            <CalendarWeekHeader {...CalendarWeekHeaderProps} />
            <CalendarMonth
              date={gridItemVisibleMonth}
              CalendarDayProps={CalendarDayProps}
            />
          </GridItem>
        ))}
      </GridLayout>
    );
  },
);
