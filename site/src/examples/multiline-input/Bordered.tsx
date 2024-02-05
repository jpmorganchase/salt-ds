import { ReactElement } from "react";
import { MultilineInput } from "@salt-ds/core";

export const Bordered = (): ReactElement => (
  <MultilineInput bordered defaultValue="Value" style={{ maxWidth: "256px" }} />
);
