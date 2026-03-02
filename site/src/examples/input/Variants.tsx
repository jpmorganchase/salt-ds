import { Input, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Variants = (): ReactElement => (
  <StackLayout style={{ width: "256px" }}>
    <Input variant="primary" defaultValue="Primary" />
    <Input variant="secondary" defaultValue="Secondary" />
    <Input variant="tertiary" defaultValue="Tertiary" />
  </StackLayout>
);
