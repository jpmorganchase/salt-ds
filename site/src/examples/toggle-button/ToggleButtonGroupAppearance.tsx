import { StackLayout, ToggleButton, ToggleButtonGroup } from "@salt-ds/core";
import type { ReactElement } from "react";

export const ToggleButtonGroupAppearance = (): ReactElement => (
  <StackLayout align="center">
    <ToggleButtonGroup defaultValue="0">
      <ToggleButton value="0">Solid</ToggleButton>
      <ToggleButton value="1">Solid</ToggleButton>
      <ToggleButton value="2">Solid</ToggleButton>
    </ToggleButtonGroup>
    <ToggleButtonGroup defaultValue="0" appearance="bordered">
      <ToggleButton value="0">Bordered</ToggleButton>
      <ToggleButton value="1">Bordered</ToggleButton>
      <ToggleButton value="2">Bordered</ToggleButton>
    </ToggleButtonGroup>
  </StackLayout>
);
