import { MultilineInput } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Disabled = (): ReactElement => (
  <MultilineInput value="Value" disabled style={{ maxWidth: "256px" }} />
);
