import { Button, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const FullWidth = (): ReactElement => (
  <StackLayout style={{ width: "400px" }}>
    <Button variant="primary">Primary full width Button</Button>
    <Button variant="secondary">Secondary full width Button</Button>
    <Button variant="cta">Cta full width Button</Button>
  </StackLayout>
);
