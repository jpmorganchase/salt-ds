import { TokenizedInputNext } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithCustomizedDelimiter = (): ReactElement => (
  <TokenizedInputNext style={{ width: "266px" }} delimiters={[";"]} />
);
