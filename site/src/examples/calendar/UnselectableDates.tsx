import { ReactElement } from "react";
import { Calendar } from "@salt-ds/lab";

const isDayUnselectable = (day: { day: number }) => {
  if (day.day === 1) return "Cut off day";
};

export const UnselectableDates = (): ReactElement => (
  <Calendar selectionVariant="default" isDayUnselectable={isDayUnselectable} />
);
