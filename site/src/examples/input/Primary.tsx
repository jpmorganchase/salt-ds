import { Input } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Primary = (): ReactElement => (
  <Input defaultValue="Value" style={{ width: "256px" }} />
);
