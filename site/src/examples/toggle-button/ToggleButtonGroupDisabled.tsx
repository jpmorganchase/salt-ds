import { StackLayout, ToggleButton, ToggleButtonGroup } from "@salt-ds/core";
import type { ReactElement } from "react";

export const ToggleButtonGroupDisabled = (): ReactElement => (
  <StackLayout align="center">
    <ToggleButtonGroup disabled>
      <ToggleButton value="0" disabled>
        Disabled
      </ToggleButton>
      <ToggleButton value="1">Disabled</ToggleButton>
      <ToggleButton value="2">Disabled</ToggleButton>
    </ToggleButtonGroup>
    <ToggleButtonGroup defaultValue="0" disabled>
      <ToggleButton value="0" disabled>
        Selected disabled
      </ToggleButton>
      <ToggleButton value="1">Disabled</ToggleButton>
      <ToggleButton value="2">Disabled</ToggleButton>
    </ToggleButtonGroup>
  </StackLayout>
);
