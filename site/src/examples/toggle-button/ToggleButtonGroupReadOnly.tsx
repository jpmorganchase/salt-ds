import { ToggleButton, ToggleButtonGroup } from "@salt-ds/core";
import { HomeIcon, NotificationIcon, UserIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const ToggleButtonGroupReadOnly = (): ReactElement => (
  <ToggleButtonGroup defaultValue="home" readOnly>
    <ToggleButton value="home" disabled>
      <HomeIcon aria-hidden /> Home
    </ToggleButton>
    <ToggleButton value="profile">
      <UserIcon aria-hidden /> Profile
    </ToggleButton>
    <ToggleButton value="notifications">
      <NotificationIcon aria-hidden /> Notifications
    </ToggleButton>
  </ToggleButtonGroup>
);
