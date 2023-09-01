import { ReactElement } from "react";
import { MultilineInput } from "@salt-ds/core";

export const Primary = (): ReactElement => (
  <MultilineInput value="Value" style={{ maxWidth: "256px" }} />
);
