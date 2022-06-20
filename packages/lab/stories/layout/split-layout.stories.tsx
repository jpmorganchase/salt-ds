import { Button } from "@jpmorganchase/uitk-core";
import { SplitLayout } from "@jpmorganchase/uitk-lab";
import { FLEX_ALIGNMENT_BASE, FlowLayout } from "@jpmorganchase/uitk-core";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { HTMLAttributes, ReactNode } from "react";

interface ContentBlockProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  caption?: string;
  classname?: string;
}

const ContentBlock = ({ children, classname, ...rest }: ContentBlockProps) => (
  <div className={classname || "layout-content"} {...rest}>
    {children || <p>Lorem ipsum dolor sit amet, consectetur adipisicing.</p>}
  </div>
);

export default {
  title: "Lab/Layout/SplitLayout",
  component: SplitLayout,
  argTypes: {
    align: {
      options: [...FLEX_ALIGNMENT_BASE, "stretch", "baseline"],
      control: { type: "select" },
    },
    gap: {
      type: "number",
    },
    separators: {
      options: ["start", "center", "end", true],
      control: { type: "select" },
    },
    wrap: {
      type: "boolean",
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minWidth: "30vw" }}>
        <Story />
      </div>
    ),
  ],
} as ComponentMeta<typeof SplitLayout>;

const leftItem = (
  <FlowLayout>
    {Array.from({ length: 3 }, (_, index) => (
      <ContentBlock key={index}>{`item ${index + 1}`}</ContentBlock>
    ))}
  </FlowLayout>
);

const rightItem = (
  <FlowLayout>
    <ContentBlock>item 4</ContentBlock>
    <ContentBlock>
      Item
      <br />5
    </ContentBlock>
  </FlowLayout>
);

const DefaultSplitLayoutStory: ComponentStory<typeof SplitLayout> = (args) => (
  <SplitLayout {...args} />
);

export const DefaultSplitLayout = DefaultSplitLayoutStory.bind({});

DefaultSplitLayout.args = {
  leftSplitItem: leftItem,
  rightSplitItem: rightItem,
};

const leftButtons = (
  <FlowLayout gap={1}>
    <Button variant="cta">Button 1</Button>
    <Button variant="primary">Button 2</Button>
    <Button variant="secondary">Button 3</Button>
  </FlowLayout>
);

const rightButtons = (
  <FlowLayout gap={1}>
    <Button variant="cta">Button 4</Button>
    <Button variant="primary">Button 5</Button>
  </FlowLayout>
);

const FormButtonBar: ComponentStory<typeof SplitLayout> = (args) => (
  <SplitLayout
    {...args}
    leftSplitItem={leftButtons}
    rightSplitItem={rightButtons}
  />
);

export const SplitLayoutSimpleUsage = FormButtonBar.bind({});
