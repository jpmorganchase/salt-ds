import { GridItem, GridLayout, type ResponsiveProp } from "@salt-ds/core";
import {
  type ComponentPropsWithoutRef,
  type FocusEventHandler,
  forwardRef,
  useCallback,
} from "react";
import { useCalendarContext } from "./internal/CalendarContext";
import {
  CalendarMonth,
  type CalendarMonthProps,
} from "./internal/CalendarMonth";

import type { DateFrameworkType } from "@salt-ds/date-adapters";
import { useLocalization } from "../localization-provider";
import { CalendarMonthHeader } from "./CalendarMonthHeader";
import { CalendarWeekHeader } from "./CalendarWeekHeader";

/**
 * Props for the CalendarGrid component.
 */
export interface CalendarGridProps<TDate extends DateFrameworkType>
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * Number of columns
   */
  columns?: ResponsiveProp<number | string>;
  /**
   * Props getter to pass to each CalendarMonth element
   */
  getCalendarMonthProps?: (
    date: TDate,
  ) => Omit<CalendarMonthProps<TDate>, "date">;
}

export const CalendarGrid = forwardRef<HTMLDivElement, CalendarGridProps<any>>(
  <TDate extends DateFrameworkType>(
    props: CalendarGridProps<TDate>,
    ref: React.Ref<HTMLDivElement>,
  ) => {
    const {
      columns,
      onFocus,
      onBlur,
      getCalendarMonthProps = () => undefined,
      ...rest
    } = props;

    const { dateAdapter } = useLocalization<TDate>();

    const {
      state: { visibleMonth, numberOfVisibleMonths = 1 },
      helpers: { setCalendarFocused },
    } = useCalendarContext<TDate>();

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
      <GridLayout
        columns={columns}
        gap={0}
        onBlur={handleBlur}
        onFocus={handleFocus}
        ref={ref}
        {...rest}
      >
        {Array.from({ length: numberOfVisibleMonths }, (_value, index) => {
          const gridItemVisibleMonth: TDate = dateAdapter.add(visibleMonth, {
            months: index,
          });
          return (
            <GridItem key={`calendar-grid-item-${index}`}>
              {numberOfVisibleMonths > 1 ? (
                <CalendarMonthHeader month={gridItemVisibleMonth} />
              ) : null}
              <CalendarWeekHeader />
              <CalendarMonth
                {...getCalendarMonthProps(gridItemVisibleMonth)}
                date={gridItemVisibleMonth}
              />
            </GridItem>
          );
        })}
      </GridLayout>
    );
  },
);
