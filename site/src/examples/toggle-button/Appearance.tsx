import { FlexLayout, ToggleButton } from "@salt-ds/core";
import { AppSwitcherIcon, FolderClosedIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const Appearance = (): ReactElement => (
  <FlexLayout>
    <ToggleButton value="active" appearance="bordered" selected>
      <AppSwitcherIcon aria-hidden /> Active
    </ToggleButton>
    <ToggleButton value="archived" appearance="solid" selected>
      <FolderClosedIcon aria-hidden /> Archived
    </ToggleButton>
  </FlexLayout>
);
