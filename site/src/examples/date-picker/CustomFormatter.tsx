import { ReactElement } from "react";
import { DatePicker } from "@salt-ds/lab";

export const CustomFormatter = (): ReactElement => (
  <DatePicker
    style={{ width: "200px" }}
    dateFormatter={(date) => date?.toLocaleString() ?? ""}
    placeholder="YYYY-MM-DD"
  />
);
