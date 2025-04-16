import { ToggleButton, ToggleButtonGroup } from "@salt-ds/core";
import type { ReactElement } from "react";

export const ToggleButtonGroupAppearance = (): ReactElement => (
  <ToggleButtonGroup defaultValue="all" appearance="bordered">
    <ToggleButton value="all">All</ToggleButton>
    <ToggleButton value="active">Active</ToggleButton>
    <ToggleButton value="archived">Archived</ToggleButton>
    <ToggleButton value="saved">Saved</ToggleButton>
  </ToggleButtonGroup>
);
