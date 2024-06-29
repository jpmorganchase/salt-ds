import { Input } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Disabled = (): ReactElement => (
  <Input defaultValue="Value" disabled style={{ width: "256px" }} />
);
