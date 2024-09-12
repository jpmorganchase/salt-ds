import { Button, FlowLayout, GridItem, GridLayout, Label } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Sentiment = (): ReactElement => (
  <GridLayout
    columns="min-content auto auto auto"
    gap={3}
    style={{ alignItems: "center" }}
  >
    <GridItem />

    <GridItem horizontalAlignment="center">
      <Label>Solid</Label>
    </GridItem>
    <GridItem horizontalAlignment="center">
      <Label>Bordered</Label>
    </GridItem>
    <GridItem horizontalAlignment="center">
      <Label>Transparent</Label>
    </GridItem>

    <Label>Positive</Label>

    <Button appearance="solid" sentiment="positive">
      Button
    </Button>
    <Button appearance="bordered" sentiment="positive">
      Button
    </Button>
    <Button appearance="transparent" sentiment="positive">
      Button
    </Button>

    <Label>Accented</Label>

    <Button appearance="solid" sentiment="accented">
      Button
    </Button>
    <Button appearance="bordered" sentiment="accented">
      Button
    </Button>
    <Button appearance="transparent" sentiment="accented">
      Button
    </Button>

    <Label>Neutral</Label>

    <Button appearance="solid" sentiment="neutral">
      Button
    </Button>
    <Button appearance="bordered" sentiment="neutral">
      Button
    </Button>
    <Button appearance="transparent" sentiment="neutral">
      Button
    </Button>

    <Label>Caution</Label>

    <Button appearance="solid" sentiment="caution">
      Button
    </Button>
    <Button appearance="bordered" sentiment="caution">
      Button
    </Button>
    <Button appearance="transparent" sentiment="caution">
      Button
    </Button>

    <Label>Negative</Label>

    <Button appearance="solid" sentiment="negative">
      Button
    </Button>
    <Button appearance="bordered" sentiment="negative">
      Button
    </Button>
    <Button appearance="transparent" sentiment="negative">
      Button
    </Button>
  </GridLayout>
);
