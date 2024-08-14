import { DatePicker } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Bordered = (): ReactElement => (
  <DatePicker bordered style={{ width: "200px" }} />
);
