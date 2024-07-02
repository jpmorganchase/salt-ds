import { ReactElement } from "react";
import {
  SystemStatus,
  SystemStatusContent,
  Button,
  StackLayout,
  Text,
} from "@salt-ds/core";

export const Error = (): ReactElement => (
  <div style={{ width: "80%" }}>
    <SystemStatus status="error">
      <SystemStatusContent>
        <Text color="inherit">System failure. Please try again.</Text>
      </SystemStatusContent>
    </SystemStatus>
  </div>
);
