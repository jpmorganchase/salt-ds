import { FlowLayout, ToggleButton } from "@salt-ds/core";
import type { ReactElement } from "react";

export const AppearanceBordered = (): ReactElement => (
  <ToggleButton value="bordered" appearance="bordered">
    Toggle
  </ToggleButton>
);
