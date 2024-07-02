import { ReactElement } from "react";
import { SystemStatus, SystemStatusContent, Text } from "@salt-ds/core";

export const Success = (): ReactElement => (
  <div style={{ width: "80%" }}>
    <SystemStatus status="success">
      <SystemStatusContent>
        <Text color="inherit">Your operation was completed successfully.</Text>
      </SystemStatusContent>
    </SystemStatus>
  </div>
);
