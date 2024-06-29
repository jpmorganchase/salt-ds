import { CircularProgress } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Circular = (): ReactElement => (
  <CircularProgress aria-label="Download" value={38} />
);
