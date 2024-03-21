import { ReactElement } from "react";
import { InteractableCard } from "@salt-ds/core";

export const DisabledInteractableCard = (): ReactElement => {
  return (
    <InteractableCard
      accent="top"
      style={{ width: "260px", height: "144px" }}
      disabled
    ></InteractableCard>
  );
};
