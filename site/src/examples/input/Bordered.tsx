import { ReactElement } from "react";
import { Input, FlowLayout } from "@salt-ds/core";

export const Bordered = (): ReactElement => (
  <FlowLayout style={{ maxWidth: "256px" }}>
    <Input bordered defaultValue="Value" />
    <Input bordered variant="secondary" defaultValue="Value" />
  </FlowLayout>
);
