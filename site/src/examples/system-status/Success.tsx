import { Text } from "@salt-ds/core";
import { SystemStatus, SystemStatusContent } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Success = (): ReactElement => (
  <div role="status" style={{ width: "100%" }}>
    <SystemStatus status="success">
      <SystemStatusContent>
        <Text color="inherit">Your operation was completed successfully.</Text>
      </SystemStatusContent>
    </SystemStatus>
  </div>
);
