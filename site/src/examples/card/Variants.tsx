import { ReactElement } from "react";
import { Card, StackLayout, Text } from "@salt-ds/core";

export const Variants = (): ReactElement => {
  const cardStyle = {
    width: "260px",
    height: "144px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  return (
    <StackLayout direction="row">
      <Card variant="primary" style={cardStyle}>
        <Text style={{ margin: "auto" }}>Primary</Text>
      </Card>
      <Card variant="secondary" style={cardStyle}>
        Secondary
      </Card>
    </StackLayout>
  );
};
