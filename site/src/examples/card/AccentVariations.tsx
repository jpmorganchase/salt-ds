import { ReactElement } from "react";
import { InteractableCard, H3, Text } from "@salt-ds/core";

export const AccentVariations = (): ReactElement => {
  const placements = ["left", "right", "top", "bottom"];
  return (
    <div
      style={{
        display: "grid",
        gap: "calc(2 * var(--salt-size-unit))",
        width: "266px",
      }}
    >
      {placements.map((_placement, index) => {
        return (
          <InteractableCard
            accentPlacement={
              placements[index] as "left" | "right" | "top" | "bottom"
            }
            key={index}
          >
            <H3>Sustainable investing products</H3>
            <Text>
              We have a commitment to provide a wide range of investment
              solutions to enable you to align your financial goals to your
              values.
            </Text>
          </InteractableCard>
        );
      })}
    </div>
  );
};
