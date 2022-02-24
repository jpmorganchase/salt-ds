import { DecoratorFn } from "@storybook/react";
import { ResponsiveContainer } from "docs/components/ResponsiveContainer";

export const withResponsiveWrapper: DecoratorFn = (Story, context) => {
  const { responsive } = context.globals;

  return responsive === "wrap" ? (
    <ResponsiveContainer>
      <Story {...context} />
    </ResponsiveContainer>
  ) : (
    <Story {...context} />
  );
};
