import { StackLayout, ToggleButton, ToggleButtonGroup } from "@salt-ds/core";
import type { ReactElement } from "react";

export const ToggleButtonGroupSentiment = (): ReactElement => (
  <StackLayout align="center">
    <ToggleButtonGroup defaultValue="0" sentiment="accented">
      <ToggleButton value="0">Accented group</ToggleButton>
      <ToggleButton value="1">Accented group</ToggleButton>
    </ToggleButtonGroup>
    <ToggleButtonGroup defaultValue="0">
      <ToggleButton value="0" sentiment="positive">
        Positive button
      </ToggleButton>
      <ToggleButton value="1" sentiment="caution">
        Caution button
      </ToggleButton>
      <ToggleButton value="2" sentiment="negative">
        Negative button
      </ToggleButton>
    </ToggleButtonGroup>
  </StackLayout>
);
