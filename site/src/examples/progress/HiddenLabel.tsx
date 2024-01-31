import { ReactElement } from "react";
import { CircularProgress } from "@salt-ds/lab";

export const HiddenLabel = (): ReactElement => (
  <CircularProgress aria-label="Download" value={38} hideLabel />
);
