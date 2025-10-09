import { FlowLayout, ToggleButton } from "@salt-ds/core";
import type { ReactElement } from "react";

export const ToggleButtonDefault = (): ReactElement => (
  <FlowLayout>
    <ToggleButton defaultSelected value="toggle">
      Toggle
    </ToggleButton>
    <ToggleButton defaultSelected value="toggle" sentiment="accented">
      Toggle
    </ToggleButton>
  </FlowLayout>
);
