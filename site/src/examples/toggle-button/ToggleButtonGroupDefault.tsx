import { ToggleButton, ToggleButtonGroup } from "@salt-ds/core";
import {
  UrgencyHighIcon,
  UrgencyLowIcon,
  UrgencyMediumIcon,
} from "@salt-ds/icons";
import type { ReactElement } from "react";

export const ToggleButtonGroupDefault = (): ReactElement => (
  <ToggleButtonGroup>
    <ToggleButton value="high">
      <UrgencyHighIcon aria-hidden />
      High
    </ToggleButton>
    <ToggleButton value="medium">
      <UrgencyMediumIcon aria-hidden />
      Medium
    </ToggleButton>
    <ToggleButton value="low">
      <UrgencyLowIcon aria-hidden />
      Low
    </ToggleButton>
  </ToggleButtonGroup>
);
