import { Button } from "@jpmorganchase/uitk-core";
import {
  FLEX_ALIGNMENT_BASE,
  FlowLayout,
  SplitLayout,
} from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { FlexContent } from "./flex-item.stories";
import { ExportIcon, ImportIcon } from "@jpmorganchase/uitk-icons";
import { useMemo } from "react";

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
      <FlexContent key={index}>{`item ${index + 1}`}</FlexContent>
    ))}
  </FlowLayout>
);

const rightItem = (
  <FlowLayout>
    <FlexContent>item 4</FlexContent>
    <FlexContent>
      Item
      <br />5
    </FlexContent>
  </FlowLayout>
);

const Template: ComponentStory<typeof SplitLayout> = (args) => {
  return <SplitLayout {...args} />;
};
export const ToolkitSplitLayout = Template.bind({});

ToolkitSplitLayout.args = {
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
