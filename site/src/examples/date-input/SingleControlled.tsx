import {
  type DateValue,
  getLocalTimeZone,
  today,
} from "@internationalized/date";
import {
  DateInputSingle,
  type SingleDateSelection,
  formatDate,
} from "@salt-ds/lab";
import { type ReactElement, type SyntheticEvent, useState } from "react";

export const SingleControlled = (): ReactElement => {
  const [selectedDate, setSelectedDate] = useState<SingleDateSelection | null>(
    today(getLocalTimeZone()),
  );

  const handleDateChange =
    () => (_event: SyntheticEvent, newSelectedDate: DateValue | null) => {
      console.log(`Selected date: ${formatDate(newSelectedDate)}`);
      setSelectedDate(newSelectedDate);
    };
  const handleDateValueChange = () => (newDateValue: string) => {
    console.log(`Date value: ${newDateValue}`);
  };
  return (
    <div style={{ width: "250px" }}>
      <DateInputSingle
        date={selectedDate}
        onDateChange={handleDateChange}
        onDateValueChange={handleDateValueChange}
      />
    </div>
  );
};
