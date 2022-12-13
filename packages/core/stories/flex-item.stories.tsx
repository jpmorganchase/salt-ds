import { FlexItem, FlexLayout } from "@jpmorganchase/uitk-core";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import "./layout-stories.css";

export default {
  title: "Core/Layout/FlexLayout/FlexItem",
  component: FlexItem,
  argTypes: {
    align: {
      options: ["start", "end", "center", "stretch"],
      control: { type: "select" },
    },
    shrink: { control: { type: "number" } },
    grow: { control: { type: "number" } },
  },
} as ComponentMeta<typeof FlexItem>;

const FlexItemStory: ComponentStory<typeof FlexItem> = (args) => {
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
