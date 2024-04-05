import { ReactElement } from "react";
import { DateInput } from "@salt-ds/lab";

export const Primary = (): ReactElement => (
  <DateInput defaultValue="01 Jan 2000" style={{ width: "256px" }} />
);
