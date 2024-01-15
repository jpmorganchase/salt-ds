import { ReactElement } from "react";
import { TokenizedInputNext } from "@salt-ds/lab";

export const WithCustomizedDelimiter = (): ReactElement => (
  <TokenizedInputNext style={{ width: "266px" }} delimiters={[";"]} />
);
