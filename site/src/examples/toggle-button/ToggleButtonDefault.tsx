import { ToggleButton } from "@salt-ds/core";
import { HomeIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const ToggleButtonDefault = (): ReactElement => (
  <ToggleButton value="home">
    <HomeIcon aria-hidden /> Home
  </ToggleButton>
);
