import { ReactElement } from "react";
import {
  InteractableCard as SaltInteractableCard,
  H3,
  Text,
} from "@salt-ds/core";

export const DisabledInteractableCard = (): ReactElement => {
  return (
    <SaltInteractableCard style={{ width: "256px" }} disabled>
      <H3 disabled>Sustainable investing products</H3>
      <Text disabled>
        We have a commitment to provide a wide range of investment solutions to
        enable you to align your financial goals to your values.
      </Text>
    </SaltInteractableCard>
  );
};
