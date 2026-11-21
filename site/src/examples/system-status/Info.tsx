import { Text } from "@salt-ds/core";
import { SystemStatus, SystemStatusContent } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Info = (): ReactElement => (
  <SystemStatus>
    <SystemStatusContent>
      <Text color="inherit">
        All users will sign in through the company portal on their next visit.
      </Text>
    </SystemStatusContent>
  </SystemStatus>
);
