import { ReactElement } from "react";
import { SystemStatus, SystemStatusContent, Text } from "@salt-ds/core";

export const Warning = (): ReactElement => (
  <div style={{ width: "80%" }}>
    <SystemStatus status="warning">
      <SystemStatusContent>
        <Text color="inherit">
          The system will be down for scheduled maintenance starting Friday,
          June 21 from 11:00PM EST – 1:00AM EST Saturday, June 22
        </Text>
      </SystemStatusContent>
    </SystemStatus>
  </div>
);
