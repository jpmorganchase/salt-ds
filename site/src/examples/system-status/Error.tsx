import { SystemStatus, SystemStatusContent, Text } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Error = (): ReactElement => (
  <div style={{ width: "80%" }}>
    <SystemStatus status="error">
      <SystemStatusContent>
        <Text color="inherit">
          We're experiencing a system issue. Our team is working to resolve it.
        </Text>
      </SystemStatusContent>
    </SystemStatus>
  </div>
);
