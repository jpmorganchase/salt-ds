import { Progress } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Indeterminate = (): ReactElement => (
  <div style={{ width: 320 }}>
    <Progress label="Loading accounts" />
  </div>
);
