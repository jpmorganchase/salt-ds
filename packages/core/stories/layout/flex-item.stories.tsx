import {
  FlexItem,
  FLEX_ITEM_ALIGNMENTS,
  FlexLayout,
} from "@jpmorganchase/uitk-core";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import "./styles.css";
import { ReactNode, HTMLAttributes } from "react";

export default {
  title: "Core/Layout/FlexLayout/FlexItem",
  component: FlexItem,
  argTypes: {
    align: {
      options: FLEX_ITEM_ALIGNMENTS,
      control: { type: "select" },
    },
    shrink: { control: { type: "number" } },
    grow: { control: { type: "number" } },
  },
  excludeStories: ["FlexContent"],
} as ComponentMeta<typeof FlexItem>;

interface FlexContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  caption?: string;
  classname?: string;
  number?: number;
}

export const FlexContent = ({
  children,
  classname,
  number,
  ...rest
}: FlexContentProps) => (
  <div className={classname || "layout-content"} {...rest}>
    {children || <p>Item {number && number}</p>}
  </div>
);

const FlexItemStory: ComponentStory<typeof FlexItem> = (args) => {
  return (
    <FlexLayout>
      <FlexItem {...args}>
        <FlexContent classname={"layout-active-content"}>
          <p>Item</p>
        </FlexContent>
      </FlexItem>
      <FlexItem>
        <FlexContent>
          <p>This is a larger item</p>
          <p>This is a larger item</p>
        </FlexContent>
      </FlexItem>
      <FlexItem>
        <FlexContent>
          <p>This is a larger item</p>
          <p>This is a larger item</p>
        </FlexContent>
      </FlexItem>
    </FlexLayout>
  );
};
export const FlexItemWrapper = FlexItemStory.bind({});
FlexItemWrapper.args = {
  shrink: 1,
  grow: 0,
};
