import type { DateFrameworkType } from "@salt-ds/date-adapters";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleGridPanel,
  type DatePickerSingleGridPanelProps,
  DatePickerSingleInput,
  DatePickerTrigger,
  type renderCalendarDayProps,
  useLocalization,
} from "@salt-ds/lab";
import { clsx } from "clsx";
import type { ReactElement } from "react";
import styles from "./singleWithCustomRendering.module.css";

export const SingleWithCustomRendering = (): ReactElement => {
  const { dateAdapter } = useLocalization();

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
      CalendarDayProps: { render: renderDayButton },
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
