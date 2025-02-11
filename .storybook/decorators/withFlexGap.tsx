import type { Decorator } from "@storybook/react";

/** A storybook decorator that adds a gap between elements of a story */
export const withFlexGap: Decorator = (Story, context) => {
  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <Story {...context} />
    </div>
  );
};
