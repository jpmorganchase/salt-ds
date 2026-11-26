import { StackLayout, Text } from "@salt-ds/core";
import { SystemStatus, SystemStatusContent } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithTitle = (): ReactElement => (
  <SystemStatus status="error">
    <SystemStatusContent>
      <StackLayout gap={0.5}>
        <Text color="inherit" fontWeight="bolder">
          Service outage
        </Text>
        <Text color="inherit">
          Some services are unavailable. We're working to restore them.
        </Text>
      </StackLayout>
    </SystemStatusContent>
  </SystemStatus>
);
