import { Button, Code, GridItem, GridLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Deprecated = (): ReactElement => (
  <GridLayout columns={2}>
    <GridItem verticalAlignment="center">
      <Code>variant="cta"</Code>
    </GridItem>
    <GridItem>
      <Button sentiment="accented">Solid Accented</Button>
    </GridItem>
    <GridItem verticalAlignment="center">
      <Code>variant="primary"</Code>
    </GridItem>
    <GridItem>
      <Button sentiment="neutral">Solid Neutral</Button>
    </GridItem>
    <GridItem verticalAlignment="center">
      <Code>variant="secondary"</Code>
    </GridItem>
    <GridItem>
      <Button appearance="transparent">Transparent Neutral</Button>
    </GridItem>
  </GridLayout>
);
