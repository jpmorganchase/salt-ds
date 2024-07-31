import { Button, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const FullWidth = (): ReactElement => (
  <StackLayout gap={6} style={{ width: "400px" }}>
    <StackLayout>
      <Button color="accent" appearance="solid">
        Solid
      </Button>
      <Button color="accent" appearance="outline">
        Outline
      </Button>
      <Button color="accent" appearance="transparent">
        Transparent
      </Button>
    </StackLayout>
    <StackLayout>
      <Button color="neutral" appearance="solid">
        Solid
      </Button>
      <Button color="neutral" appearance="outline">
        Outline
      </Button>
      <Button color="neutral" appearance="transparent">
        Transparent
      </Button>
    </StackLayout>
  </StackLayout>
);
