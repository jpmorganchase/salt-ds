import { Calendar } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const HiddenOutOfRangeDates = (): ReactElement => (
  <Calendar selectionVariant="single" hideOutOfRangeDates />
);
