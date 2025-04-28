import { FlexLayout, ToggleButton } from "@salt-ds/core";
import { AppSwitcherIcon, FolderClosedIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const ReadOnly = (): ReactElement => (
  <FlexLayout>
    <ToggleButton value="readonly" readOnly>
      <AppSwitcherIcon aria-hidden /> Active
    </ToggleButton>
    <ToggleButton selected value="readonly" readOnly>
      <FolderClosedIcon aria-hidden /> Archived
    </ToggleButton>
  </FlexLayout>
);
