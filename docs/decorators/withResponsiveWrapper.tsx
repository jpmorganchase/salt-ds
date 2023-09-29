import { Decorator } from "@storybook/react";
import { ResponsiveContainer } from "docs/components/ResponsiveContainer";

export const withResponsiveWrapper: Decorator = (Story, context) => {
  const { responsive } = context.globals;

  return responsive === "wrap" ? (
    <ResponsiveContainer>
      <Story {...context} />
    </ResponsiveContainer>
  ) : (
    <Story {...context} />
  );
};
