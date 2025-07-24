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
 * @template TDate - The type of the date object.
 */
export interface CalendarGridProps<TDate extends DateFrameworkType>
  extends ComponentPropsWithoutRef<"div"> {
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
  CalendarMonthHeaderProps?: Partial<CalendarMonthHeaderProps<TDate>>;
  /**
   * Props for `CalendarDay`
   */
  CalendarDayProps?: Partial<CalendarDayProps<TDate>>;
}

export const CalendarGrid = forwardRef<
  HTMLDivElement,
  CalendarGridProps<DateFrameworkType>
>(
  <TDate extends DateFrameworkType>(
    props: CalendarGridProps<TDate>,
    ref: React.Ref<HTMLDivElement>,
  ) => {
    const {
      CalendarDayProps,
      CalendarWeekHeaderProps,
      CalendarMonthHeaderProps,
      columns = 1,
      onBlur,
      ...rest
    } = props;

    const { dateAdapter } = useLocalization<TDate>();

    const {
      helpers: { setFocusedDate, setHoveredDate },
      state: { visibleMonth, numberOfVisibleMonths = 1 },
    } = useCalendarContext<TDate>();
    const calendarGridRef = useRef<HTMLDivElement>(null);
    const containerRef = useForkRef(ref, calendarGridRef);

    const handleCalendarGridBlur: FocusEventHandler<HTMLDivElement> = (
      event,
    ) => {
      event.stopPropagation();
      setTimeout(() => {
        if (calendarGridRef?.current?.contains(document.activeElement)) {
          return;
        }
        setFocusedDate(event, null);
        setHoveredDate(event, null);
      }, 0);
      onBlur?.(event);
    };

    return (
      <GridLayout
        columns={columns}
        gap={1}
        ref={containerRef}
        onBlur={handleCalendarGridBlur}
        {...rest}
      >
        {Array.from({ length: numberOfVisibleMonths }, (_value, index) => {
          const gridItemVisibleMonth: TDate = dateAdapter.add(visibleMonth, {
            months: index,
          });
          return (
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
          );
        })}
      </GridLayout>
    );
  },
);
