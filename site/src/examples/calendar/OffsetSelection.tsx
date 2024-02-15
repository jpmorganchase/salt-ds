import { ReactElement } from "react";
import { Calendar } from "@salt-ds/lab";

export const OffsetSelection = (): ReactElement => (
  <Calendar
    selectionVariant="offset"
    endDateOffset={(date) => date.add({ days: 2 })}
  />
);
