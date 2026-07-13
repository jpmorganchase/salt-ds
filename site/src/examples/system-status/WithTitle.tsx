import {
  StackLayout,
  SystemStatus,
  SystemStatusContent,
  Text,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const WithTitle = (): ReactElement => (
  <SystemStatus status="error">
    <SystemStatusContent>
      <StackLayout gap={0.5}>
        <Text color="inherit">
          <strong>Connection interrupted</strong>
        </Text>
        <Text color="inherit">Please refresh the page.</Text>
      </StackLayout>
    </SystemStatusContent>
  </SystemStatus>
);
