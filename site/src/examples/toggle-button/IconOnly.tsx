import { FlowLayout, ToggleButton, Tooltip } from "@salt-ds/core";
import {
  LockedIcon,
  FavoriteSolidIcon,
  PinIcon,
  UnlockedIcon,
} from "@salt-ds/icons";
import { useState, type ReactElement } from "react";

export const IconOnly = (): ReactElement => {
  const [selected, setSelected] = useState(false);

  return (
    <FlowLayout>
      <ToggleButton value="pin" aria-label="pin">
        <PinIcon aria-hidden />
      </ToggleButton>
      <Tooltip placement="top" content="Favorite">
        <ToggleButton value="favorite">
          <FavoriteSolidIcon aria-hidden />
        </ToggleButton>
      </Tooltip>
      <ToggleButton
        value={selected ? "unlocked" : "locked"}
        aria-label={selected ? "unlocked" : "locked"}
        onChange={() => setSelected(!selected)}
        selected={selected}
      >
        {selected ? <UnlockedIcon /> : <LockedIcon />}
      </ToggleButton>
    </FlowLayout>
  );
};
