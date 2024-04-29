import { ReactElement } from "react";
import { DateInput } from "@salt-ds/lab";
import {
  DateFormatter,
  DateValue,
  getLocalTimeZone,
} from "@internationalized/date";
import { getCurrentLocale } from "@salt-ds/lab/src/calendar/internal/utils";

export const CustomFormatter = (): ReactElement => {
  const formatter = (date: DateValue | undefined): string => {
    return date
      ? new DateFormatter(getCurrentLocale(), {
          year: "numeric",
        }).format(date.toDate(getLocalTimeZone()))
      : "";
  };

  return (
    <DateInput
      placeholder="yyyy"
      dateFormatter={formatter}
      style={{ width: "256px" }}
    />
  );
};
