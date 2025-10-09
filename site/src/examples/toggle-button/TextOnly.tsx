import { FlowLayout, ToggleButton } from "@salt-ds/core";
import { type ReactElement, useState } from "react";

export const TextOnly = (): ReactElement => {
  const [pinned, setPinned] = useState(false);

  return (
    <FlowLayout>
      <ToggleButton
        value={pinned ? "pinned" : "unpinned"}
        onChange={() => setPinned(!pinned)}
        selected={pinned}
        style={{ minWidth: "9ch" }}
      >
        {pinned ? "Pinned" : "Pin"}
      </ToggleButton>
    </FlowLayout>
  );
};
