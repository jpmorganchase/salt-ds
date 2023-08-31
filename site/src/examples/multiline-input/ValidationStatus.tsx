import { ReactElement } from "react";
import { MultilineInput } from "@salt-ds/core";

export const ValidationStatus = (): ReactElement => (
  <MultilineInput value="Value" disabled style={{ maxWidth: "256px" }} />
);
