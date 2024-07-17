import type { ReactElement } from "react";
import { Text } from "@salt-ds/core";
import { SystemStatus, SystemStatusContent } from "@salt-ds/lab";

export const Success = (): ReactElement => (
  <div style={{ width: "80%" }}>
    <SystemStatus status="success">
      <SystemStatusContent>
        <Text color="inherit">Your operation was completed successfully.</Text>
      </SystemStatusContent>
    </SystemStatus>
  </div>
);
