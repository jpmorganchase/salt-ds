import { ReactElement } from "react";
import { InteractableCard } from "@salt-ds/lab";

export const DisabledInteractableCard = (): ReactElement => {
  return (
    <InteractableCard
      accent="top"
      style={{ width: "260px", height: "144px" }}
      disabled
    ></InteractableCard>
  );
};
