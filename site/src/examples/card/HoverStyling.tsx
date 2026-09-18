import { Card, Text } from "@salt-ds/core";
import type { CSSProperties, ReactElement } from "react";

const cardStyle = {
  alignItems: "center",
  display: "flex",
  justifyContent: "center",
  minHeight: 144,
  width: 260,
} satisfies CSSProperties;

export const HoverStyling = (): ReactElement => (
  <Card elevation="flat" hoverable style={cardStyle}>
    <Text as="p">Static card with hover styling</Text>
  </Card>
);
