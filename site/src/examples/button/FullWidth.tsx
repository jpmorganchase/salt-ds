import { ReactElement } from "react";
import { Button, StackLayout } from "@salt-ds/core";
import { SendIcon } from "@salt-ds/icons";

export const FullWidth = (): ReactElement => (
  <StackLayout style={{ width: "400px" }}>
    <Button variant="primary" style={{ width: "100%" }}>
      Primary FullWidth Button
    </Button>
    <Button variant="secondary" style={{ width: "100%" }}>
      Secondary FullWidth Button
    </Button>
    <Button variant="cta" style={{ width: "100%" }}>
      Send <SendIcon aria-hidden />
    </Button>
  </StackLayout>
);
