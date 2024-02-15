import { ReactElement } from "react";
import { Calendar } from "@salt-ds/lab";

const isDayUnselectable = (day: { day: number }) => {
  if (day.day === 1) return "Closed on the first of every month";
};

export const UnselectableDates = (): ReactElement => (
  <Calendar selectionVariant="default" isDayUnselectable={isDayUnselectable} />
);
