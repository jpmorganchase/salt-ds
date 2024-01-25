import { ReactElement } from "react";
import { Card, H3, Text } from "@salt-ds/core";

export const DisabledInteractableCard = (): ReactElement => {
  return (
    <Card style={{ width: "256px" }} disabled>
      <H3 disabled>Sustainable investing products</H3>
      <Text disabled>
        We have a commitment to provide a wide range of investment solutions to
        enable you to align your financial goals to your values.
      </Text>
    </Card>
  );
};
