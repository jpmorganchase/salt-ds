import { Button, FlowLayout, H3, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Chrome = (): ReactElement => (
  <StackLayout gap={6}>
    <StackLayout>
      <H3>Accent</H3>
      <FlowLayout>
        <Button appearance="filled" chrome="accent">
          Filled
        </Button>
        <Button appearance="outlined" chrome="accent">
          Outlined
        </Button>
        <Button appearance="minimal" chrome="accent">
          Minimal
        </Button>
      </FlowLayout>
    </StackLayout>
    <StackLayout>
      <H3>Neutral</H3>
      <FlowLayout>
        <Button appearance="filled" chrome="neutral">
          Filled
        </Button>
        <Button appearance="outlined" chrome="neutral">
          Outlined
        </Button>
        <Button appearance="minimal" chrome="neutral">
          Minimal
        </Button>
      </FlowLayout>
    </StackLayout>
  </StackLayout>
);
