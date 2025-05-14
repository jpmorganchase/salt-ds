import type { DateFrameworkType } from "@salt-ds/date-adapters";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleGridPanel,
  type DatePickerSingleGridPanelProps,
  DatePickerSingleInput,
  DatePickerTrigger,
  type DayStatus,
  useLocalization,
} from "@salt-ds/lab";
import { clsx } from "clsx";
import type { ComponentPropsWithRef, ReactElement } from "react";
import styles from "./singleWithCustomRendering.module.css";

export const SingleWithCustomRendering = (): ReactElement => {
  const { dateAdapter } = useLocalization();

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

  const CalendarGridProps: DatePickerSingleGridPanelProps<DateFrameworkType>["CalendarGridProps"] =
    {
      getCalendarMonthProps: () => ({ renderDayButton }),
    };

  return (
    <DatePicker selectionVariant={"single"}>
      <DatePickerTrigger>
        <DatePickerSingleInput />
      </DatePickerTrigger>
      <DatePickerOverlay>
        <DatePickerSingleGridPanel CalendarGridProps={CalendarGridProps} />
      </DatePickerOverlay>
    </DatePicker>
  );
};
