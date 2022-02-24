import { DecoratorFn } from "@storybook/react";

export const withTestIdWrapper: DecoratorFn = (Story, context) => {
  return (
    // `display: inline-block` here to 'fix' the difference generated between TK1 and TK2 margin collapsed elements, e.g. h3
    <div data-testid="preview-area" style={{ display: "inline-block" }}>
      <Story {...context} />
    </div>
  );
};
