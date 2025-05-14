import type { DateFrameworkType } from "@salt-ds/date-adapters";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  type DayStatus,
  useLocalization,
} from "@salt-ds/lab";
import { clsx } from "clsx";
import type { ComponentPropsWithRef, ReactElement } from "react";
import styles from "./customDayRendering.module.css";

export const CustomDayRendering = (): ReactElement => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();

  function renderDayButton(
    date: DateFrameworkType,
    { className, ...props }: ComponentPropsWithRef<"button">,
    status: DayStatus,
  ): ReactElement | null {
    return (
      <button
        {...props}
        className={clsx([
          { [styles.buttonWithDot]: !status.outOfRange },
          className,
        ])}
      >
        <span className={clsx({ [styles.dot]: !status.outOfRange })}>
          {dateAdapter.format(date, "D")}
        </span>
        {status.today ? <span className={styles.today} /> : null}
      </button>
    );
  }

  return (
    <Calendar selectionVariant={"single"} hideOutOfRangeDates>
      <CalendarNavigation />
      <CalendarGrid
        getCalendarMonthProps={(_date: DateFrameworkType) => ({
          renderDayButton,
        })}
      />
    </Calendar>
  );
};
