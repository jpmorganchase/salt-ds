import { MultilineInput } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Placeholder = (): ReactElement => (
  <MultilineInput placeholder="Enter a value" style={{ maxWidth: "256px" }} />
);
