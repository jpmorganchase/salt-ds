import { ReactElement } from "react";
import { DatePicker } from "@salt-ds/lab";

export const Range = (): ReactElement => (
  <DatePicker selectionVariant="range" style={{ width: "250px" }} />
);
