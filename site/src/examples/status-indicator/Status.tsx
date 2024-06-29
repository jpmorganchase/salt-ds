import { FlowLayout, StatusIndicator } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Status = (): ReactElement => (
  <FlowLayout>
    <StatusIndicator status="info" />
    <StatusIndicator status="error" />
    <StatusIndicator status="warning" />
    <StatusIndicator status="success" />
  </FlowLayout>
);
