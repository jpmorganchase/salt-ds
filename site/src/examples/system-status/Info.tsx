import { ReactElement } from "react";
import { Text } from "@salt-ds/core";
import { SystemStatus, SystemStatusContent } from "@salt-ds/lab";

export const Info = (): ReactElement => (
  <div style={{ width: "80%" }}>
    <SystemStatus>
      <SystemStatusContent>
        <Text color="inherit">New feature updates are available</Text>
      </SystemStatusContent>
    </SystemStatus>
  </div>
);
