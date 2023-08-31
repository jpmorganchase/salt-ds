import { ReactElement } from "react";
import { MultilineInput } from "@salt-ds/core";

export const Placeholder = (): ReactElement => (
  <MultilineInput placeholder="Enter a value" style={{ maxWidth: "256px" }} />
);
