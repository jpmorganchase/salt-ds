import { type DateValue, getDayOfWeek } from "@internationalized/date";
import { Calendar } from "@salt-ds/lab";
import type { ReactElement } from "react";

const currentLocale = navigator.languages[0];
const isDayDisabled = (date: DateValue) =>
  getDayOfWeek(date, currentLocale) >= 5;

export const DisabledDates = (): ReactElement => (
  <Calendar selectionVariant="default" isDayDisabled={isDayDisabled} />
);
