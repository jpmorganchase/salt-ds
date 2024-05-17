import { ReactElement } from "react";
import { Button, StackLayout } from "@salt-ds/core";

export const FullWidth = (): ReactElement => (
  <StackLayout style={{ width: "400px" }}>
    <Button variant="primary" style={{ width: "100%" }}>
      Primary full width Button
    </Button>
    <Button variant="secondary" style={{ width: "100%" }}>
      Secondary full width Button
    </Button>
    <Button variant="cta" style={{ width: "100%" }}>
      Cta full width button
    </Button>
  </StackLayout>
);
