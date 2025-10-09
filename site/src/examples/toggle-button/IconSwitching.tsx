import { FlowLayout, ToggleButton, Tooltip } from "@salt-ds/core";
import {
  FavoriteIcon,
  FavoriteSolidIcon,
  LockedIcon,
  UnlockedIcon,
} from "@salt-ds/icons";
import { type ReactElement, useState } from "react";

export const IconSwitching = (): ReactElement => {
  const [favorite, setFavorite] = useState(false);
  const [locked, setLocked] = useState(false);

  return (
    <FlowLayout>
      <Tooltip placement="top" content="Favorite">
        <ToggleButton
          value={favorite ? "favorite" : "unfavorite"}
          aria-label={favorite ? "favorite" : "unfavorite"}
          onChange={() => setFavorite(!favorite)}
          selected={favorite}
        >
          {favorite ? (
            <FavoriteSolidIcon aria-hidden />
          ) : (
            <FavoriteIcon aria-hidden />
          )}
        </ToggleButton>
      </Tooltip>
      <Tooltip placement="top" content="Favorite">
        <ToggleButton
          value={locked ? "locked" : "unlocked"}
          aria-label={locked ? "locked" : "unlocked"}
          onChange={() => setLocked(!locked)}
          selected={locked}
        >
          {locked ? <LockedIcon aria-hidden /> : <UnlockedIcon aria-hidden />}
        </ToggleButton>
      </Tooltip>
    </FlowLayout>
  );
};
