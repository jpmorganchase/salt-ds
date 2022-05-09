import {
  FlexItem,
  FLEX_ITEM_ALIGNMENTS,
  FlexLayout,
} from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import "./styles.css";
import { ReactNode, HTMLAttributes } from "react";

export default {
  title: "Layout/FlexItem",
  component: FlexItem,
} as ComponentMeta<typeof FlexItem>;

interface FlexContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  caption?: string;
  classname?: string;
}

export const FlexContent = ({
  children,
  classname,
  ...rest
}: FlexContentProps) => (
  <div className={classname || "layout-content"} {...rest}>
    {children || <p>Lorem ipsum dolor sit amet, consectetur adipisicing.</p>}
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
        <FlexContent>
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing.</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing.</p>
        </FlexContent>
      </FlexItem>
      <FlexItem>
        <FlexContent>
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing.</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing.</p>
        </FlexContent>
      </FlexItem>
    </FlexLayout>
  );
};
export const ToolkitFlexItemInFlexLayout = InsideFlexbox.bind({});
ToolkitFlexItemInFlexLayout.args = {
  shrink: 0,
  grow: 0,
};

ToolkitFlexItemInFlexLayout.argTypes = {
  align: {
    options: FLEX_ITEM_ALIGNMENTS,
    control: { type: "select" },
  },
  shrink: { control: { type: "number" } },
  grow: { control: { type: "number" } },
};
