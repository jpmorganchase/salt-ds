import { ToggleButton } from "@salt-ds/core";
import { FavoriteIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const ToggleButtonDefault = (): ReactElement => (
  <ToggleButton value="home">
    <FavoriteIcon aria-hidden /> Toggle button
  </ToggleButton>
);
