import { ReactElement } from "react";
import { Calendar } from "@salt-ds/lab";

export const HiddenOutOfRangeDates = (): ReactElement => (
  <Calendar selectionVariant="default" hideOutOfRangeDates />
);
