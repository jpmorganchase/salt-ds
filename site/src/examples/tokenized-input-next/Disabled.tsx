import { ReactElement } from "react";
import { TokenizedInputNext } from "@salt-ds/lab";

export const Disabled = (): ReactElement => (
  <TokenizedInputNext
    disabled
    defaultSelected={["Value 1", "Value 2", "Value 3"]}
  />
);
