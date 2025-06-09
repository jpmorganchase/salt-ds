import {
  FLEX_ALIGNMENT_BASE,
  type FlexLayout,
  StackLayout,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import "../layout/layout.stories.css";

export default {
  title: "Core/Layout/Stack Layout",
  component: StackLayout,
  argTypes: {
    as: { type: "string" },
    align: {
      options: [...FLEX_ALIGNMENT_BASE, "stretch", "baseline"],
      control: { type: "select" },
    },
    direction: {
      options: ["row", "column"],
      control: { type: "select" },
    },
    separators: {
      options: ["start", "center", "end", true, false, undefined],
      control: { type: "select" },
    },
    gap: {
      type: "number",
    },
  },
} as Meta<typeof StackLayout>;

const DefaultStackLayoutStory: StoryFn<typeof StackLayout> = (args) => {
  return (
    <StackLayout {...args} className="layout-container">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index}>
          <p>Item {index + 1}</p>
        </div>
      ))}
    </StackLayout>
  );
};
export const Default = DefaultStackLayoutStory.bind({});
Default.args = {};

const SeparatorsStory: StoryFn<typeof FlexLayout> = (args) => {
  return (
    <StackLayout {...args} className="layout-container">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index}>
          <p>Item {index + 1}</p>
        </div>
      ))}
    </StackLayout>
  );
};
export const WithSeparators = SeparatorsStory.bind({});
WithSeparators.args = {
  separators: "center",
  direction: { sm: "row", xs: "column" },
};
