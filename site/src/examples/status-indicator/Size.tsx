import { ReactElement } from "react";
import { FlowLayout, StatusIndicator } from "@salt-ds/core";

export const Size = (): ReactElement => (
  <FlowLayout>
    <StatusIndicator status="info" size={1} />
    <StatusIndicator status="info" size={2} />
    <StatusIndicator status="info" size={3} />
    <StatusIndicator status="info" size={4} />
  </FlowLayout>
);
