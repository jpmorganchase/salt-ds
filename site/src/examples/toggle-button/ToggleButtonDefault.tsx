import { FlowLayout, ToggleButton, Tooltip } from "@salt-ds/core";
import { LikeIcon, LikeSolidIcon } from "@salt-ds/icons";
import { type ReactElement, useState } from "react";

export const ToggleButtonDefault = (): ReactElement => {
  const [liked, setLiked] = useState(false);

  return (
    <FlowLayout>
      <Tooltip content="Like" placement="top">
        <ToggleButton
          aria-label={liked ? "Like" : "Unlike"}
          selected={liked}
          onChange={() => setLiked((old) => !old)}
          value="toggle"
        >
          {liked ? <LikeSolidIcon aria-hidden /> : <LikeIcon aria-hidden />}
        </ToggleButton>
      </Tooltip>
    </FlowLayout>
  );
};
