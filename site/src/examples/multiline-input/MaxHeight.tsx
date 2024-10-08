import { MultilineInput } from "@salt-ds/core";
import type { ReactElement } from "react";

export const MaxHeight = (): ReactElement => (
  <MultilineInput
    defaultValue="Value"
    style={{ maxWidth: "256px", maxHeight: "256px" }}
  />
);
