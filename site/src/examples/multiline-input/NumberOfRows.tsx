import { ReactElement } from "react";
import { MultilineInput } from "@salt-ds/core";

export const NumberOfRows = (): ReactElement => (
  <MultilineInput value="Value" rows={4} style={{ maxWidth: "256px" }} />
);
