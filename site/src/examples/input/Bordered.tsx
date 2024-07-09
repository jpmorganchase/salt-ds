import { FlowLayout, Input } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Bordered = (): ReactElement => (
  <FlowLayout style={{ maxWidth: "256px" }}>
    <Input bordered defaultValue="Value" />
    <Input bordered variant="secondary" defaultValue="Value" />
  </FlowLayout>
);
