import { ReactElement } from "react";
import {
  SystemStatus,
  SystemStatusContent,
  StackLayout,
  Text,
} from "@salt-ds/core";

export const Info = (): ReactElement => (
  <div style={{ width: "80%" }}>
    <SystemStatus>
      <SystemStatusContent>
        <Text color="inherit">New feature updates are available</Text>
      </SystemStatusContent>
    </SystemStatus>
  </div>
);
