import { Input, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Variants = (): ReactElement => (
  <StackLayout style={{ width: "256px" }}>
    <Input defaultValue="Value" variant="primary" />
    <Input defaultValue="Value" variant="secondary" />
    <Input defaultValue="Value" variant="tertiary" />
  </StackLayout>
);
