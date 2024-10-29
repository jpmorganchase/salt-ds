import {
  type DateValue,
  getLocalTimeZone,
  today,
} from "@internationalized/date";
import {
  DateInputSingle,
  type DateInputSingleError,
  type SingleDateSelection,
  formatDate,
} from "@salt-ds/lab";
import { type ReactElement, type SyntheticEvent, useState } from "react";

export const SingleControlled = (): ReactElement => {
  const [selectedDate, setSelectedDate] = useState<
    SingleDateSelection | null | undefined
  >(today(getLocalTimeZone()));

  const handleDateChange = (
    _event: SyntheticEvent,
    newSelectedDate: DateValue | null | undefined,
    _error: DateInputSingleError,
  ) => {
    console.log(`Selected date: ${formatDate(newSelectedDate)}`);
    setSelectedDate(newSelectedDate);
  };
  return (
    <div style={{ width: "250px" }}>
      <DateInputSingle date={selectedDate} onDateChange={handleDateChange} />
    </div>
  );
};
