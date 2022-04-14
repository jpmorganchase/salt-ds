import { FlexItem, FLEX_ITEM_ALIGNMENTS, FlexLayout } from "@brandname/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import "./styles.css";

export default {
  title: "Layout/FlexItem",
  component: FlexItem,
} as ComponentMeta<typeof FlexItem>;

interface FlexContentProps {
  caption?: string;
  classname?: string;
}

export const FlexContent = ({ caption, classname }: FlexContentProps) => (
  <div className={classname || "layout-content"}>
    <p>{caption || "Flex Item"}</p>
  </div>
);
const Template: ComponentStory<typeof FlexItem> = () => {
  return (
    <FlexItem>
      <FlexContent />
    </FlexItem>
  );
};
export const ToolkitFlexItem = Template.bind({});

const InsideFlexbox: ComponentStory<typeof FlexItem> = (args) => {
  return (
    <FlexLayout>
      <FlexItem {...args}>
        <FlexContent classname={"layout-active-content"} />
      </FlexItem>
      <FlexItem>
        <FlexContent />
      </FlexItem>
      <FlexItem>
        <FlexContent />
      </FlexItem>
    </FlexLayout>
  );
};
export const ToolkitFlexItemInFlexLayout = InsideFlexbox.bind({});
ToolkitFlexItemInFlexLayout.args = {
  shrink: 1,
  stretch: 0,
};

ToolkitFlexItemInFlexLayout.argTypes = {
  align: {
    options: FLEX_ITEM_ALIGNMENTS,
    control: { type: "select" },
  },
  shrink: { control: { type: "number" } },
  stretch: { control: { type: "number" } },
};
