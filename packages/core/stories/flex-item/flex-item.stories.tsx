import { FlexItem, FlexLayout } from "@salt-ds/core";
import { Meta, StoryFn } from "@storybook/react";
import "../layout/layout.stories.css";

export default {
  title: "Core/Layout/Flex Layout/Flex Item",
  component: FlexItem,
  argTypes: {
    as: { type: "string" },
    align: {
      options: ["start", "end", "center", "stretch"],
      control: { type: "select" },
    },
    shrink: { control: { type: "number" } },
    grow: { control: { type: "number" } },
  },
} as Meta<typeof FlexItem>;

const FlexItemStory: StoryFn<typeof FlexItem> = (args) => {
  return (
    <FlexLayout className="layout-container">
      <FlexItem className="layout-active-content" {...args}>
        <p>Item</p>
      </FlexItem>
      <FlexItem>
        <p>Larger Item</p>
        <p>Containing 2 paragraphs</p>
      </FlexItem>
      <FlexItem>
        <p>Larger Item</p>
        <p>Containing 2 paragraphs</p>
      </FlexItem>
    </FlexLayout>
  );
};
export const FlexItemWrapper = FlexItemStory.bind({});
FlexItemWrapper.args = {
  shrink: 1,
  grow: 0,
};
