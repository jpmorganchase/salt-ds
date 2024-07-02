import { MultilineInput } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Bordered = (): ReactElement => (
  <MultilineInput bordered defaultValue="Value" style={{ maxWidth: "256px" }} />
);
