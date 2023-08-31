import { ReactElement } from "react";
import { MultilineInput } from "@salt-ds/core";

export const Bordered = (): ReactElement => (
  <MultilineInput bordered value="Value" style={{ maxWidth: "256px" }} />
);
