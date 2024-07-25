import { Button, GridLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Color = (): ReactElement => (
  <GridLayout columns={3}>
    <Button appearance="solid" color="neutral">
      Solid
    </Button>
    <Button appearance="outline" color="neutral">
      Outline
    </Button>
    <Button appearance="transparent" color="neutral">
      Transparent
    </Button>
    <Button appearance="solid" color="accent">
      Solid
    </Button>
    <Button appearance="outline" color="accent">
      Outline
    </Button>
    <Button appearance="transparent" color="accent">
      Transparent
    </Button>
  </GridLayout>
);
