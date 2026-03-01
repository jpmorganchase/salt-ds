import { MultilineInput } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Basic = (): ReactElement => (
  <MultilineInput defaultValue="Value" style={{ maxWidth: "256px" }} />
);
