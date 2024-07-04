import { ReactElement } from "react";
import { DatePicker, DatePickerSinglePanel } from "@salt-ds/lab";
import {
  DateFormatter,
  DateValue,
  getLocalTimeZone,
} from "@internationalized/date";

export const CustomFormatter = (): ReactElement => {
  const customDateFormatter = (date: DateValue | undefined): string => {
    return date
      ? new DateFormatter("fr-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(date.toDate(getLocalTimeZone()))
      : "";
  };

  return (
    <DatePicker
      selectionVariant="single"
      style={{ width: "200px" }}
      dateFormatter={customDateFormatter}
      placeholder={"YYYY-MM-DD"}
    >
      <DatePickerSinglePanel />
    </DatePicker>
  );
};
