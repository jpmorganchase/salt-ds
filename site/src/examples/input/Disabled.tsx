import { ReactElement } from "react";
import { Input } from "@salt-ds/core";

export const Disabled = (): ReactElement => (
  <Input defaultValue="Value" disabled style={{ width: "256px" }} />
);
