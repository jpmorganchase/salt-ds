import { ReactElement } from "react";
import { MultilineInput } from "@salt-ds/core";

export const Secondary = (): ReactElement => (
  <MultilineInput
    variant="secondary"
    value="Value"
    style={{ maxWidth: "256px" }}
  />
);
