import {
  SystemStatus,
  SystemStatusContent,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { ReactElement } from "react";

export const WithTitle = (): ReactElement => (
  <div style={{ width: "80%" }}>
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
  </div>
);
