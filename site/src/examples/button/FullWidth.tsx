import { Button, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const FullWidth = (): ReactElement => (
  <StackLayout style={{ width: "400px" }}>
    <Button color="neutral" appearance="solid">
      Solid neutral full width Button
    </Button>
    <Button color="neutral" appearance="outline">
      Outline neutral full width Button
    </Button>
    <Button color="neutral" appearance="transparent">
      Transparent neutral full width Button
    </Button>
    <Button color="accent" appearance="solid">
      Solid accent full width Button
    </Button>
    <Button color="accent" appearance="outline">
      Outline accent full width Button
    </Button>
    <Button color="accent" appearance="transparent">
      Transparent accent full width Button
    </Button>
  </StackLayout>
);
