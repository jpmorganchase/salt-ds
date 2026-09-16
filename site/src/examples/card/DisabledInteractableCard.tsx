import { InteractableCard, Text } from "@salt-ds/core";
import type { ReactElement } from "react";

export const DisabledInteractableCard = (): ReactElement => {
  return (
    <InteractableCard
      accent="top"
      style={{ width: "260px", minHeight: "144px" }}
      disabled
    >
      <Text as="p">View sustainable investing products</Text>
    </InteractableCard>
  );
};
