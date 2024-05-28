import { ReactElement } from "react";
import { LinearProgress } from "@salt-ds/core";

export const LinearIndeterminate = (): ReactElement => (
  <LinearProgress aria-label="Download" variant="indeterminate" />
);
