import { Button } from "@jpmorganchase/uitk-core";
import { SplitLayout } from "@jpmorganchase/uitk-lab";
import { FLEX_ALIGNMENT_BASE, FlowLayout } from "@jpmorganchase/uitk-core";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { ExportIcon, ImportIcon } from "@jpmorganchase/uitk-icons";
import { HTMLAttributes, ReactNode, useMemo } from "react";

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
  title: "Layout/SplitLayout",
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

const DefaultSplitLayoutStory: ComponentStory<typeof SplitLayout> = (args) => {
  return (
    <div style={{ minWidth: 850 }}>
      <SplitLayout {...args} />
    </div>
  );
};
export const DefaultSplitLayout = DefaultSplitLayoutStory.bind({});

DefaultSplitLayout.args = {
  leftSplitItem: leftItem,
  rightSplitItem: rightItem,
};

const ButtonBarExample: ComponentStory<typeof SplitLayout> = (args) => {
  const leftItem = useMemo(
    () => (
      <FlowLayout>
        <Button variant="secondary">
          <ExportIcon style={{ marginRight: 5 }} />
          Export
        </Button>
        <Button variant="secondary">
          <ImportIcon style={{ marginRight: 5 }} />
          Import
        </Button>
      </FlowLayout>
    ),
    []
  );
  const rightItem = useMemo(
    () => (
      <FlowLayout>
        <Button variant="cta">Save</Button> <Button>Cancel</Button>
      </FlowLayout>
    ),
    []
  );
  return (
    <SplitLayout
      {...args}
      leftSplitItem={leftItem}
      rightSplitItem={rightItem}
    />
  );
};
export const ButtonBarInSplitLayout = ButtonBarExample.bind({});
