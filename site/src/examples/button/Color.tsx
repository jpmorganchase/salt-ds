import { Button, FlowLayout, H3, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Color = (): ReactElement => (
  <StackLayout gap={6}>
    <StackLayout>
      <H3>Accent</H3>
      <FlowLayout>
        <Button appearance="solid" color="accent">
          Solid
        </Button>
        <Button appearance="bordered" color="accent">
          Bordered
        </Button>
        <Button appearance="transparent" color="accent">
          Transparent
        </Button>
      </FlowLayout>
    </StackLayout>
    <StackLayout>
      <H3>Neutral</H3>
      <FlowLayout>
        <Button appearance="solid" color="neutral">
          Solid
        </Button>
        <Button appearance="bordered" color="neutral">
          Bordered
        </Button>
        <Button appearance="transparent" color="neutral">
          Transparent
        </Button>
      </FlowLayout>
    </StackLayout>
  </StackLayout>
);
