import {
  DateFormatter,
  type DateValue,
  getLocalTimeZone,
} from "@internationalized/date";
import { DatePicker } from "@salt-ds/lab";
import type { ReactElement } from "react";

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
      style={{ width: "200px" }}
      dateFormatter={customDateFormatter}
      placeholder={"YYYY-MM-DD"}
    />
  );
};
