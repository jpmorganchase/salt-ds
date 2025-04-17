import { StackLayout, ToggleButton } from "@salt-ds/core";
import { LockedIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const Disabled = (): ReactElement => (
  <StackLayout>
    <ToggleButton value="disabled" disabled>
      <LockedIcon aria-hidden /> Disabled
    </ToggleButton>
    <ToggleButton selected value="disabled" disabled>
      <LockedIcon aria-hidden /> Disabled
    </ToggleButton>
  </StackLayout>
);
