import { FlexItem, FlexLayout, StackLayout, Text } from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
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
        <Text>Item</Text>
      </FlexItem>
      <FlexItem>
        <StackLayout gap={1}>
          <Text>Larger Item</Text>
          <Text>Containing 2 lines</Text>
        </StackLayout>
      </FlexItem>
      <FlexItem>
        <StackLayout gap={1}>
          <Text>Larger Item</Text>
          <Text>Containing 2 lines</Text>
        </StackLayout>
      </FlexItem>
    </FlexLayout>
  );
};
export const FlexItemWrapper = FlexItemStory.bind({});
FlexItemWrapper.args = {
  shrink: 1,
  grow: 0,
};
