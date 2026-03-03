import { Input, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Bordered = (): ReactElement => (
  <StackLayout style={{ maxWidth: "256px" }}>
    <Input bordered variant="primary" defaultValue="Primary" />
    <Input bordered variant="secondary" defaultValue="Secondary" />
    <Input bordered variant="tertiary" defaultValue="Tertiary" />
  </StackLayout>
);
