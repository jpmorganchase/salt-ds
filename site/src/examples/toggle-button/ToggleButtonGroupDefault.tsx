import { ReactElement } from "react";
import { ToggleButtonGroup, ToggleButton } from "@salt-ds/core";
import { AppSwitcherIcon, FolderClosedIcon, VisibleIcon } from "@salt-ds/icons";

export const ToggleButtonGroupDefault = (): ReactElement => (
  <ToggleButtonGroup>
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
