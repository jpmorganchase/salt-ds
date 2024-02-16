import { ReactElement } from "react";
import { InteractableCard, InteractableCardGroup } from "@salt-ds/lab";

export const ToggleGroup = (): ReactElement => {
  return (
    <InteractableCardGroup>
      <InteractableCard
        value="a"
        accent="top"
        style={{ width: "260px", height: "144px" }}
      >
        A
      </InteractableCard>
      <InteractableCard
        value="b"
        accent="top"
        style={{ width: "260px", height: "144px" }}
      >
        B
      </InteractableCard>
    </InteractableCardGroup>
  );
};
