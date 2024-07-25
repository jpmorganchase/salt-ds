import { Button, GridLayout } from "@salt-ds/core";
import { SendIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const Disabled = (): ReactElement => (
  <GridLayout columns={3}>
    <Button appearance="solid" color="neutral" disabled>
      Solid
    </Button>
    <Button appearance="outline" color="neutral" disabled>
      Outline
    </Button>
    <Button appearance="transparent" color="neutral" disabled>
      Transparent
    </Button>
    <Button appearance="solid" color="accent" disabled>
      Solid
    </Button>
    <Button appearance="outline" color="accent" disabled>
      Outline
    </Button>
    <Button appearance="transparent" color="accent" disabled>
      Transparent
    </Button>
  </GridLayout>
);
