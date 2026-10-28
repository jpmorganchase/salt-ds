import { Card, GridLayout, H3, Text } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Elevation = (): ReactElement => (
  // Stands in for the page: in an app, set this background on `body`.
  <div
    style={{
      background: "var(--salt-container-secondary-background)",
      padding: "var(--salt-spacing-300)",
      width: "100%",
    }}
  >
    <GridLayout columns={2} gap={3}>
      <Card>
        <H3>Open orders</H3>
        <Text>42</Text>
      </Card>
      <Card>
        <H3>Settled today</H3>
        <Text>128</Text>
      </Card>
    </GridLayout>
  </div>
);
