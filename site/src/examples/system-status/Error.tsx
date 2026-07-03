import { SystemStatus, SystemStatusContent, Text } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Error = (): ReactElement => (
  <div style={{ width: "80%" }}>
    <SystemStatus status="error">
      <SystemStatusContent>
        <Text color="inherit">System failure. Please try again.</Text>
      </SystemStatusContent>
    </SystemStatus>
  </div>
);
