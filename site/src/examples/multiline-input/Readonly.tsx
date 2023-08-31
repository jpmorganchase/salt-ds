import { ReactElement } from "react";
import { MultilineInput } from "@salt-ds/core";

export const Readonly = (): ReactElement => (
  <MultilineInput readOnly value="Value" style={{ maxWidth: "256px" }} />
);
