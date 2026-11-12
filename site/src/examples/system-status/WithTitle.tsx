import { StackLayout, Text } from "@salt-ds/core";
import { SystemStatus, SystemStatusContent } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithTitle = (): ReactElement => (
  <SystemStatus status="error">
    <SystemStatusContent>
      <StackLayout gap={0.5}>
        <Text color="inherit" fontWeight="bolder">
          Connection interrupted
        </Text>
        <Text color="inherit">Please refresh the page.</Text>
      </StackLayout>
    </SystemStatusContent>
  </SystemStatus>
);
