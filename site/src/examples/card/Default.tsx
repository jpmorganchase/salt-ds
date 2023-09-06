import { ReactElement } from "react";
import { Card, H3, Text } from "@salt-ds/core";

export const Default = (): ReactElement => {
  return (
    <Card style={{ width: "256px" }}>
      <H3>Sustainable investing products</H3>
      <Text>
        We have a commitment to provide a wide range of investment solutions to
        enable you to align your financial goals to your values.
      </Text>
    </Card>
  );
};
