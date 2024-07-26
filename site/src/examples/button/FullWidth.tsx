import { Button, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const FullWidth = (): ReactElement => (
  <StackLayout gap={6} style={{ width: "400px" }}>
    <StackLayout>
      <Button color="accent" appearance="solid">
        Solid accent
      </Button>
      <Button color="accent" appearance="outline">
        Outline accent
      </Button>
      <Button color="accent" appearance="transparent">
        Transparent accent
      </Button>
    </StackLayout>
    <StackLayout>
      <Button color="neutral" appearance="solid">
        Solid neutral
      </Button>
      <Button color="neutral" appearance="outline">
        Outline neutral
      </Button>
      <Button color="neutral" appearance="transparent">
        Transparent neutral
      </Button>
    </StackLayout>
  </StackLayout>
);
