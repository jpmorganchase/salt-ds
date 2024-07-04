import { Calendar } from "@salt-ds/lab";
import type { ReactElement } from "react";

const isDayUnselectable = (day: { day: number }) => {
  if (day.day === 1) return "Cut off day";
};

export const UnselectableDates = (): ReactElement => (
  <Calendar selectionVariant="single" isDayUnselectable={isDayUnselectable} />
);
