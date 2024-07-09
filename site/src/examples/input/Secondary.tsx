import { FlowLayout, Input } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Secondary = (): ReactElement => (
  <Input defaultValue="Value" variant="secondary" style={{ width: "256px" }} />
);
