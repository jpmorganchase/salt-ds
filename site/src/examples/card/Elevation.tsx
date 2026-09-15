import { Card, GridLayout, Text } from "@salt-ds/core";
import type { CSSProperties, ReactElement } from "react";

const cardStyle = {
  alignItems: "center",
  display: "flex",
  justifyContent: "center",
  minHeight: 144,
} satisfies CSSProperties;

export const Elevation = (): ReactElement => (
  <GridLayout
    columns="repeat(auto-fit, minmax(220px, 1fr))"
    style={{ width: "100%" }}
  >
    <Card elevation="flat" style={cardStyle}>
      <Text as="p">Flat</Text>
    </Card>
    <Card elevation="raised" style={cardStyle}>
      <Text as="p">Raised</Text>
    </Card>
  </GridLayout>
);
