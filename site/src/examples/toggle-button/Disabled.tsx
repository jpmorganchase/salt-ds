import { ToggleButton } from "@salt-ds/core";
import { HomeIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const Disabled = (): ReactElement => (
  <ToggleButton value="home" disabled>
    <HomeIcon aria-hidden /> Home
  </ToggleButton>
);
