import { FlowLayout, ToggleButton } from "@salt-ds/core";
import { type ReactElement, useState } from "react";

export const TextOnly = (): ReactElement => {
  const [pinned, setPinned] = useState(false);
  const [locked, setLocked] = useState(false);

  return (
    <FlowLayout>
      <ToggleButton
        value={pinned ? "pinned" : "unpinned"}
        onChange={() => setPinned(!pinned)}
        selected={pinned}
      >
        {pinned ? "Pinned" : "Pin"}
      </ToggleButton>
      <ToggleButton value="favorite">Favorite</ToggleButton>
      <ToggleButton
        onChange={() => setLocked(!locked)}
        value={locked ? "unlocked" : "locked"}
        selected={locked}
      >
        {locked ? "Unlock" : "Lock"}
      </ToggleButton>
    </FlowLayout>
  );
};
