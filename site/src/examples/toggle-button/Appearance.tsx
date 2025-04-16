import { StackLayout, ToggleButton } from "@salt-ds/core";
import { AppSwitcherIcon, FolderClosedIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const Appearance = (): ReactElement => (
  <StackLayout>
    <ToggleButton value="active" appearance="bordered" selected>
      <AppSwitcherIcon /> Active
    </ToggleButton>
    <ToggleButton value="archived" appearance="solid" selected>
      <FolderClosedIcon /> Archived
    </ToggleButton>
  </StackLayout>
);
