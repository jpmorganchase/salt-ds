import { ToggleButton } from "@salt-ds/core";
import { FolderClosedIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const Appearance = (): ReactElement => (
  <ToggleButton value="archived" appearance="bordered">
    <FolderClosedIcon aria-hidden /> Archived
  </ToggleButton>
);
