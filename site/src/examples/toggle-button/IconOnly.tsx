import { ReactElement } from "react";
import { ToggleButton, Tooltip } from "@salt-ds/core";
import { FavoriteSolidIcon } from "@salt-ds/icons";

export const IconOnly = (): ReactElement => (
  <Tooltip content="Favorite">
    <ToggleButton value="favorite" aria-label="favorite">
      <FavoriteSolidIcon />
    </ToggleButton>
  </Tooltip>
);
