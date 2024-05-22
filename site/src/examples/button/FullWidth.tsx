import { ReactElement } from "react";
import { Button, StackLayout } from "@salt-ds/core";

export const FullWidth = (): ReactElement => (
  <StackLayout style={{ width: "400px" }}>
    <Button variant="primary">Primary full width Button</Button>
    <Button variant="secondary">Secondary full width Button</Button>
    <Button variant="cta">Cta full width button</Button>
  </StackLayout>
);
