import { ToggleButtonGroup, ToggleButton } from "@salt-ds/core";
import type { ReactElement } from "react";

export const ToggleButtonGroupSentiment = (): ReactElement => (
  <ToggleButtonGroup defaultValue="accented">
    <ToggleButton value="accented" sentiment="accented">
      Accented
    </ToggleButton>
    <ToggleButton value="positive" sentiment="positive">
      Positive
    </ToggleButton>
    <ToggleButton value="negative" sentiment="negative">
      Negative
    </ToggleButton>
    <ToggleButton value="caution" sentiment="caution">
      Caution
    </ToggleButton>
  </ToggleButtonGroup>
);
