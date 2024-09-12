import { Button, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const FullWidth = (): ReactElement => (
  <StackLayout style={{ width: "400px" }}>
    <Button sentiment="accented" appearance="solid">
      Solid
    </Button>
    <Button sentiment="accented" appearance="bordered">
      Bordered
    </Button>
    <Button sentiment="accented" appearance="transparent">
      Transparent
    </Button>
  </StackLayout>
);
