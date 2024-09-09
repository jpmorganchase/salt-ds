import { Button, Code, GridItem, GridLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Deprecated = (): ReactElement => (
  <GridLayout columns={2}>
    <GridItem verticalAlignment="center">
      <Code>variant="cta"</Code>
    </GridItem>
    <Button variant="cta">Solid Accented</Button>
    <GridItem verticalAlignment="center">
      <Code>variant="primary"</Code>
    </GridItem>
    <Button variant="primary">Solid Neutral</Button>
    <GridItem verticalAlignment="center">
      <Code>variant="secondary"</Code>
    </GridItem>
    <Button variant="secondary">Transparent Neutral</Button>
  </GridLayout>
);
