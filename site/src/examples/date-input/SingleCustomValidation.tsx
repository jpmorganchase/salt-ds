import {
  type DateValue,
  getLocalTimeZone,
  today,
} from "@internationalized/date";
import {DateInputSingle, DateInputSingleError, formatDate} from "@salt-ds/lab";
import type { ReactElement, SyntheticEvent } from "react";

const customValidator = (
  date: DateValue | null | undefined,
  error: DateInputSingleError,
): DateInputSingleError => {
  return error ? { ...error, message: "custom error" } : error;
};

export const Single = (): ReactElement => {
  const handleDateChange = (
    _event: SyntheticEvent,
    newSelectedDate: DateValue | null | undefined,
    error: DateInputSingleError,
  ) => {
    console.log(`Selected date: ${formatDate(newSelectedDate)}`);
    if (error) {
      console.log(`Error: ${error.message}`);
    }
  };
  return (
    <div style={{ width: "250px" }}>
      <DateInputSingle
        defaultDate={today(getLocalTimeZone())}
        onDateChange={handleDateChange}
        validate={customValidator}
      />
    </div>
  );
};
