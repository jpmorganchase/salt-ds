import { InteractableCard } from "@salt-ds/core";
import type { ReactElement } from "react";

export const InteractableCardExample = (): ReactElement => {
  return (
    <InteractableCard
      accent="top"
      style={{ width: "260px", minHeight: "144px" }}
    >
      View sustainable investing products
    </InteractableCard>
  );
};
