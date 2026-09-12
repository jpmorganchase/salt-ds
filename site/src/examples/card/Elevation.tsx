import { Card, GridLayout } from "@salt-ds/core";
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
    <Card borderColor="default" elevation="flat" style={cardStyle}>
      Flat
    </Card>
    <Card borderColor="default" elevation="raised" style={cardStyle}>
      Raised
    </Card>
  </GridLayout>
);
