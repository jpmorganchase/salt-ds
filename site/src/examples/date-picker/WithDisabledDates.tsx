import { ReactElement } from "react";
import { DatePicker } from "@salt-ds/lab";
import { DateValue, getDayOfWeek } from "@internationalized/date";

const currentLocale = navigator.languages[0];
const isDayDisabled = (date: DateValue) =>
  getDayOfWeek(date, currentLocale) >= 5;
export const WithDisabledDates = (): ReactElement => (
  <DatePicker
    style={{ width: "200px" }}
    CalendarProps={{ isDayDisabled: isDayDisabled }}
  />
);
