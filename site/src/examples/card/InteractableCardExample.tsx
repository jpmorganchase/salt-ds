import { InteractableCard } from "@salt-ds/core";
import type { ReactElement } from "react";

export const InteractableCardExample = (): ReactElement => {
  return (
    <InteractableCard
      accent="top"
      style={{ width: "260px", height: "144px" }}
    ></InteractableCard>
  );
};
