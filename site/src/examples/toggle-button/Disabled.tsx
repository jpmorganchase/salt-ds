import { ReactElement } from "react";
import { ToggleButton } from "@salt-ds/core";
import { HomeIcon } from "@salt-ds/icons";

export const Disabled = (): ReactElement => (
  <ToggleButton value="home" disabled>
    <HomeIcon aria-hidden /> Home
  </ToggleButton>
);
