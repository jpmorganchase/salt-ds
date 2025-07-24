import type { DateFrameworkType } from "@salt-ds/date-adapters";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  type renderCalendarDayProps,
  useLocalization,
} from "@salt-ds/lab";
import { clsx } from "clsx";
import type { ReactElement } from "react";
import styles from "./customDayRendering.module.css";

export const CustomDayRendering = (): ReactElement => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();

  function renderDayButton({
    className,
    date,
    status,
    ...rest
  }: renderCalendarDayProps<DateFrameworkType>): ReactElement {
    return (
      <button
        {...rest}
        className={clsx([
          {
            [styles.buttonWithDot]: !status.outOfRange,
            [styles.today]: status.today,
          },
          className,
        ])}
      >
        <span className={clsx({ [styles.dot]: !status.outOfRange })}>
          {dateAdapter.format(date, "D")}
        </span>
      </button>
    );
  }

  return (
    <Calendar selectionVariant={"single"} hideOutOfRangeDates>
      <CalendarNavigation />
      <CalendarGrid CalendarDayProps={{ render: renderDayButton }} />
    </Calendar>
  );
};
