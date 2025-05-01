import { ToggleButton, ToggleButtonGroup } from "@salt-ds/core";
import type { ReactElement } from "react";

export const ToggleButtonGroupReadOnly = (): ReactElement => (
  <ToggleButtonGroup defaultValue="0" readOnly>
    <ToggleButton value="0">Selected readonly</ToggleButton>
    <ToggleButton value="1">Unselected readonly</ToggleButton>
    <ToggleButton value="2">Unselected readonly</ToggleButton>
  </ToggleButtonGroup>
);
