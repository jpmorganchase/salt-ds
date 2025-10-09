import { ToggleButton, Tooltip } from "@salt-ds/core";
import { SyncIcon } from "@salt-ds/icons";
import { type ReactElement, useState } from "react";

export const IconOnly = (): ReactElement => {
  const [sync, setSync] = useState(false);

  return (
    <Tooltip
      content={sync ? "Disable syncing" : "Enable syncing"}
      placement="top"
    >
      <ToggleButton
        value="sync"
        aria-label={sync ? "Disable syncing" : "Enable syncing"}
        onChange={() => setSync(!sync)}
        selected={sync}
      >
        <SyncIcon aria-hidden />
      </ToggleButton>
    </Tooltip>
  );
};
