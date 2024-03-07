import { ReactElement } from "react";
import { Calendar } from "@salt-ds/lab";

const isDayHighlighted = (day: { day: number }) => {
  if (day.day === 1) return "Cut off day";
};

export const HighlightedDates = (): ReactElement => (
  <Calendar selectionVariant="default" isDayHighlighted={isDayHighlighted} />
);
