import { FlowLayout, ToggleButton, Tooltip } from "@salt-ds/core";
import {
  FavoriteIcon,
  FavoriteSolidIcon,
  LockedIcon,
  PinIcon,
  UnlockedIcon,
} from "@salt-ds/icons";
import { type ReactElement, useState } from "react";

export const IconOnly = (): ReactElement => {
  const [favorite, setFavorite] = useState(false);
  const [locked, setLocked] = useState(false);

  return (
    <FlowLayout>
      <ToggleButton value="pin" aria-label="pin">
        <PinIcon aria-hidden />
      </ToggleButton>
      <Tooltip placement="top" content="Favorite">
        <ToggleButton
          value={favorite ? "favorite" : "unfavorite"}
          aria-label={favorite ? "favorite" : "unfavorite"}
          onChange={() => setFavorite(!favorite)}
          selected={favorite}
        >
          {favorite ? <FavoriteSolidIcon /> : <FavoriteIcon />}
        </ToggleButton>
      </Tooltip>
      <ToggleButton
        value={locked ? "locked" : "unlocked"}
        aria-label={locked ? "locked" : "unlocked"}
        onChange={() => setLocked(!locked)}
        selected={locked}
      >
        {locked ? <LockedIcon /> : <UnlockedIcon />}
      </ToggleButton>
    </FlowLayout>
  );
};
