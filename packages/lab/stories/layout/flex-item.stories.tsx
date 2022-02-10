import { FlexItem, FLEX_ITEM_ALIGNMENTS, FlexLayout } from "@brandname/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Layout/FlexItem",
  component: FlexItem,
} as ComponentMeta<typeof FlexItem>;

const flexItemStyles = { background: "lightcyan", padding: "1rem" };
const nonArgsFlexItems = { background: "lightcoral", padding: "1rem" };
const flexLayoutStyle = {
  maxWidth: "300px",
  height: "300px",
  background: "lightblue",
};

const Template: ComponentStory<typeof FlexItem> = () => {
  return (
    <FlexItem style={flexItemStyles}>
      <p>Flex Item</p>
    </FlexItem>
  );
};
export const ToolkitFlexItem = Template.bind({});
ToolkitFlexItem.args = {};

const InsideFlexbox: ComponentStory<typeof FlexItem> = (args) => {
  const props = (index: number) => (index === 0 ? { ...args } : {});
  return (
    <FlexLayout style={flexLayoutStyle} alignItems={"flex-start"}>
      {Array.from({ length: 3 }, (i, index) => (
        <FlexItem
          style={index === 0 ? flexItemStyles : nonArgsFlexItems}
          {...props(index)}
        >
          <p>{`Flex Item  ${index + 1}`}</p>
        </FlexItem>
      ))}
    </FlexLayout>
  );
};
export const ToolkitFlexItemInFlexLayout = InsideFlexbox.bind({});
ToolkitFlexItemInFlexLayout.args = {};

ToolkitFlexItemInFlexLayout.argTypes = {
  alignSelf: {
    options: FLEX_ITEM_ALIGNMENTS,
    control: { type: "select" },
  },
  order: { control: { type: "number" } },
  shrink: { control: { type: "number" } },
  stretch: { control: { type: "number" } },
};
