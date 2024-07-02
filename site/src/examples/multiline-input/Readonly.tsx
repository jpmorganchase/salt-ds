import { MultilineInput } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Readonly = (): ReactElement => (
  <MultilineInput readOnly value="Value" style={{ maxWidth: "256px" }} />
);
