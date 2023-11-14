import { ReactElement } from "react";
import { CircularProgress } from "@salt-ds/lab";

export const Circular = (): ReactElement => (
  <CircularProgress aria-label="Download" value={38} />
);
