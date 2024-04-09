import { ReactElement } from "react";
import { InteractableCard } from "@salt-ds/core";

export const InteractableCardExample = (): ReactElement => {
  return (
    <InteractableCard
      accent="top"
      style={{ width: "260px", height: "144px" }}
    ></InteractableCard>
  );
};
