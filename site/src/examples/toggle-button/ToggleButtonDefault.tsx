import { ReactElement } from "react";
import { ToggleButton } from "@salt-ds/core";
import { HomeIcon } from "@salt-ds/icons";

export const ToggleButtonDefault = (): ReactElement => (
  <ToggleButton value="home">
    <HomeIcon aria-hidden /> Home
  </ToggleButton>
);
