import { StackLayout, ToggleButton } from "@salt-ds/core";
import { AppSwitcherIcon, FolderClosedIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const Appearance = (): ReactElement => (
  <StackLayout>
    <ToggleButton value="bordered" appearance="bordered" selected>
      <AppSwitcherIcon /> Active
    </ToggleButton>
    <ToggleButton value="solid" appearance="solid" selected>
      <FolderClosedIcon /> Archived
    </ToggleButton>
  </StackLayout>
);
