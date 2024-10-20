import {
  type DateValue,
  getLocalTimeZone,
  today,
} from "@internationalized/date";
import { DateInputSingle, formatDate } from "@salt-ds/lab";
import type { ReactElement, SyntheticEvent } from "react";

export const SingleBordered = (): ReactElement => {
  const handleDateChange = (
    _event: SyntheticEvent,
    newSelectedDate: DateValue | null,
    _error: string | boolean,
  ) => {
    console.log(`Selected date: ${formatDate(newSelectedDate)}`);
  };

  return (
    <div style={{ width: "250px" }}>
      <DateInputSingle
        defaultDate={today(getLocalTimeZone())}
        onDateChange={handleDateChange}
        bordered
      />
    </div>
  );
};
