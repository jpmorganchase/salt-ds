import { Text } from "@salt-ds/core";
import { SystemStatus, SystemStatusContent } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Info = (): ReactElement => (
  <SystemStatus>
    <SystemStatusContent>
      <Text color="inherit">
        New features are available. Refresh the page to start using them.
      </Text>
    </SystemStatusContent>
  </SystemStatus>
);
