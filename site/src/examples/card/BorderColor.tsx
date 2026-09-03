import { Card, GridLayout } from "@salt-ds/core";
import type { CSSProperties, ReactElement } from "react";

const cardStyle = {
  alignItems: "center",
  display: "flex",
  justifyContent: "center",
  minHeight: 144,
} satisfies CSSProperties;

export const BorderColor = (): ReactElement => (
  <GridLayout
    columns="repeat(auto-fit, minmax(120px, 1fr))"
    style={{ width: "100%" }}
  >
    <Card
      borderColor="strong"
      elevation="flat"
      style={cardStyle}
      variant="secondary"
    >
      Strong
    </Card>
    <Card
      borderColor="default"
      elevation="flat"
      style={cardStyle}
      variant="secondary"
    >
      Default
    </Card>
    <Card
      borderColor="subtle"
      elevation="flat"
      style={cardStyle}
      variant="secondary"
    >
      Subtle
    </Card>
    <Card
      borderColor="none"
      elevation="flat"
      style={cardStyle}
      variant="secondary"
    >
      None
    </Card>
  </GridLayout>
);
