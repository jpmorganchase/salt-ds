import { SystemStatus, SystemStatusContent, Text } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Info = (): ReactElement => (
  <div style={{ width: "80%" }}>
    <SystemStatus>
      <SystemStatusContent>
        <Text color="inherit">New feature updates are available</Text>
      </SystemStatusContent>
    </SystemStatus>
  </div>
);
