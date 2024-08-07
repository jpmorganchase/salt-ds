import { Button, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const FullWidth = (): ReactElement => (
  <StackLayout gap={6} style={{ width: "400px" }}>
    <StackLayout>
      <Button chrome="accent" appearance="filled">
        Filled
      </Button>
      <Button chrome="accent" appearance="outlined">
        Outlined
      </Button>
      <Button chrome="accent" appearance="minimal">
        Minimal
      </Button>
    </StackLayout>
    <StackLayout>
      <Button chrome="neutral" appearance="filled">
        Filled
      </Button>
      <Button chrome="neutral" appearance="outlined">
        Outlined
      </Button>
      <Button chrome="neutral" appearance="minimal">
        Minimal
      </Button>
    </StackLayout>
  </StackLayout>
);
