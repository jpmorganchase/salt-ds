import { Button, FlowLayout, GridLayout, H3, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Color = (): ReactElement => (
  <GridLayout
    columns="min-content auto"
    gap={3}
    style={{ alignItems: "center" }}
  >
    <H3>Accent</H3>
    <FlowLayout>
      <Button appearance="solid" color="accent">
        Solid
      </Button>
      <Button appearance="outline" color="accent">
        Outline
      </Button>
      <Button appearance="transparent" color="accent">
        Transparent
      </Button>
    </FlowLayout>
    <H3>Neutral</H3>
    <FlowLayout>
      <Button appearance="solid" color="neutral">
        Solid
      </Button>
      <Button appearance="outline" color="neutral">
        Outline
      </Button>
      <Button appearance="transparent" color="neutral">
        Transparent
      </Button>
    </FlowLayout>
    <H3>Positive</H3>
    <FlowLayout>
      <Button appearance="solid" color="positive">
        Solid
      </Button>
      <Button appearance="outline" color="positive">
        Outline
      </Button>
      <Button appearance="transparent" color="positive">
        Transparent
      </Button>
    </FlowLayout>
    <H3>Negative</H3>
    <FlowLayout>
      <Button appearance="solid" color="negative">
        Solid
      </Button>
      <Button appearance="outline" color="negative">
        Outline
      </Button>
      <Button appearance="transparent" color="negative">
        Transparent
      </Button>
    </FlowLayout>
    <H3>Warning</H3>
    <FlowLayout>
      <Button appearance="solid" color="warning">
        Solid
      </Button>
      <Button appearance="outline" color="warning">
        Outline
      </Button>
      <Button appearance="transparent" color="warning">
        Transparent
      </Button>
    </FlowLayout>
  </GridLayout>
);
