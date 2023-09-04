import { ReactElement } from "react";
import { MultilineInput } from "@salt-ds/core";

export const Disabled = (): ReactElement => (
  <MultilineInput value="Value" disabled style={{ maxWidth: "256px" }} />
);
