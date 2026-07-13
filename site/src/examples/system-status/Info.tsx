import { Text } from "@salt-ds/core";
import { SystemStatus, SystemStatusContent } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Info = (): ReactElement => (
  <SystemStatus>
    <SystemStatusContent>
      <Text color="inherit">New feature updates are available</Text>
    </SystemStatusContent>
  </SystemStatus>
);
