import { Button, FlowLayout, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Disabled = (): ReactElement => (
  <StackLayout gap={3}>
    <FlowLayout>
      <Button appearance="solid" color="accent" disabled>
        Solid
      </Button>
      <Button appearance="bordered" color="accent" disabled>
        Bordered
      </Button>
      <Button appearance="transparent" color="accent" disabled>
        Transparent
      </Button>
    </FlowLayout>
    <FlowLayout>
      <Button appearance="solid" color="neutral" disabled>
        Solid
      </Button>
      <Button appearance="bordered" color="neutral" disabled>
        Bordered
      </Button>
      <Button appearance="transparent" color="neutral" disabled>
        Transparent
      </Button>
    </FlowLayout>
  </StackLayout>
);
