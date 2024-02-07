import { ReactElement } from "react";
import { CircularProgress } from "@salt-ds/core";

export const Circular = (): ReactElement => (
  <CircularProgress aria-label="Download" value={38} />
);
