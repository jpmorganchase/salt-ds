import { ReactElement } from "react";
import { Text, Tooltip } from "@salt-ds/core";

export const Truncation = (): ReactElement => (
  <div style={{ width: 150 }}>
    <Tooltip content="This text is truncated because it is long.">
      <Text maxRows={1} tabIndex={0}>
        This text is truncated because it is long.
      </Text>
    </Tooltip>
  </div>
);
