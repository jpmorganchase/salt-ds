import { ToggleButton, ToggleButtonGroup } from "@salt-ds/core";
import { AppSwitcherIcon, FolderClosedIcon, VisibleIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const ToggleButtonGroupVertical = (): ReactElement => (
  <ToggleButtonGroup orientation="vertical">
    <ToggleButton value="all">
      <AppSwitcherIcon aria-hidden />
      All
    </ToggleButton>
    <ToggleButton value="active">
      <VisibleIcon aria-hidden />
      Active
    </ToggleButton>
    <ToggleButton disabled value="search">
      <FolderClosedIcon aria-hidden />
      Archived
    </ToggleButton>
  </ToggleButtonGroup>
);
