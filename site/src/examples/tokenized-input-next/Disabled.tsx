import { TokenizedInputNext } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Disabled = (): ReactElement => (
  <TokenizedInputNext
    style={{ width: "266px" }}
    disabled
    defaultSelected={["Value 1", "Value 2", "Value 3"]}
  />
);
