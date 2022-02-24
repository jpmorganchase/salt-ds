import { DecoratorFn } from "@storybook/react";
import { ToolkitProvider } from "@brandname/core";

export const withToolkitProvider: DecoratorFn = (Story, context) => {
  const { density, theme } = context.globals;
  return (
    <ToolkitProvider density={density} theme={theme}>
      <Story {...context} />
    </ToolkitProvider>
  );
};
