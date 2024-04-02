import { Decorator } from "@storybook/react";
import { useIsomorphicLayoutEffect } from "@salt-ds/core";
import MockDate from "mockdate";

export const withDateMock: Decorator = (Story, context) => {
  const { mockDate } = context.parameters;

  if (mockDate) {
    MockDate.set(mockDate);
  }

  useIsomorphicLayoutEffect(() => {
    return () => {
      MockDate.reset();
    };
  }, []);

  return <Story {...context} />;
};
