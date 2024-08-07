import { Button, FlowLayout, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Disabled = (): ReactElement => (
  <StackLayout gap={3}>
    <FlowLayout>
      <Button appearance="filled" chrome="accent" disabled>
        Filled
      </Button>
      <Button appearance="outlined" chrome="accent" disabled>
        Outlined
      </Button>
      <Button appearance="minimal" chrome="accent" disabled>
        Minimal
      </Button>
    </FlowLayout>
    <FlowLayout>
      <Button appearance="filled" chrome="neutral" disabled>
        Filled
      </Button>
      <Button appearance="outlined" chrome="neutral" disabled>
        Outlined
      </Button>
      <Button appearance="minimal" chrome="neutral" disabled>
        Minimal
      </Button>
    </FlowLayout>
  </StackLayout>
);
