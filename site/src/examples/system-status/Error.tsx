import { Text } from "@salt-ds/core";
import { SystemStatus, SystemStatusContent } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Error = (): ReactElement => (
  <div role="alert" style={{ width: "100%" }}>
    <SystemStatus status="error">
      <SystemStatusContent>
        <Text color="inherit">
          Some services are unavailable. Refresh the page to try again.
        </Text>
      </SystemStatusContent>
    </SystemStatus>
  </div>
);
