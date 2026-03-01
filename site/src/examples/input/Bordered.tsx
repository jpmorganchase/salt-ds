import { Input, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Bordered = (): ReactElement => (
  <StackLayout style={{ maxWidth: "256px" }}>
    <Input bordered defaultValue="Value" />
    <Input bordered variant="secondary" defaultValue="Value" />
    <Input bordered variant="tertiary" defaultValue="Value" />
  </StackLayout>
);
