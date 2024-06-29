import { MultilineInput } from "@salt-ds/core";
import type { ReactElement } from "react";

export const NumberOfRows = (): ReactElement => (
  <MultilineInput defaultValue="Value" rows={4} style={{ maxWidth: "256px" }} />
);
