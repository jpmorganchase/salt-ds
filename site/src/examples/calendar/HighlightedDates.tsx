import { Calendar } from "@salt-ds/lab";
import type { ReactElement } from "react";

const isDayHighlighted = (day: { day: number }) => {
  if (day.day === 1) return "Cut off day";
};

export const HighlightedDates = (): ReactElement => (
  <Calendar selectionVariant="default" isDayHighlighted={isDayHighlighted} />
);
