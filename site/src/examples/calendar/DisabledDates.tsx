import { ReactElement } from "react";
import { Calendar } from "@salt-ds/lab";
import { DateValue, getDayOfWeek } from "@internationalized/date";

const currentLocale = navigator.languages[0];
const isDayDisabled = (date: DateValue) =>
  getDayOfWeek(date, currentLocale) >= 5;

export const DisabledDates = (): ReactElement => (
  <Calendar selectionVariant="default" isDayDisabled={isDayDisabled} />
);
