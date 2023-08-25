import { ReactElement } from "react";
import { FlowLayout, StatusIndicator } from "@salt-ds/core";

export const Status = (): ReactElement => (
  <FlowLayout>
    <StatusIndicator status="info" />
    <StatusIndicator status="error" />
    <StatusIndicator status="warning" />
    <StatusIndicator status="success" />
  </FlowLayout>
);
