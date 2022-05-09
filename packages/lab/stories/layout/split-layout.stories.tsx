import {Button} from "@jpmorganchase/uitk-core";
import {FLEX_ALIGNMENT_BASE, SplitLayout,} from "@jpmorganchase/uitk-lab";
import {ComponentMeta, ComponentStory} from "@storybook/react";
import {FlexContent} from "./flex-item.stories";
import {ExportIcon, ImportIcon} from "@jpmorganchase/uitk-icons";

export default {
  title: "Layout/SplitLayout",
  component: SplitLayout,
} as ComponentMeta<typeof SplitLayout>;

const Template: ComponentStory<typeof SplitLayout> = (args) => {
  return (
    <SplitLayout {...args}>
      <FlexContent>Item<br/>1</FlexContent>
      {Array.from({length: 4}, (_, index) => (
        <FlexContent key={index}>{`Item ${index + 2}`}</FlexContent>
      ))}
    </SplitLayout>
  );
};
export const ToolkitSplitLayout = Template.bind({});

ToolkitSplitLayout.argTypes = {
  align: {
    options: [...FLEX_ALIGNMENT_BASE, "stretch", "baseline"],
    control: {type: "select"},
  },
  gap: {
    type: "number",
  },
  pushRight: {
    type: "number",
  },
  separators: {
    options: ["start", "center", "end", true],
    control: {type: "select"},
  },
  wrap: {
    type: "boolean",
  },
};


const ButtonBarExample: ComponentStory<typeof SplitLayout> = (args) => {
  return (
    <SplitLayout {...args}>
      <Button variant="secondary">
        <ExportIcon style={{marginRight: 5}}/>
        Export
      </Button>
      <Button variant="secondary">
        <ImportIcon style={{marginRight: 5}}/>
        Import
      </Button>
      <Button variant="cta">Save</Button>
      <Button>Cancel</Button>
    </SplitLayout>
  );
};
export const ButtonBarInSplitLayout = ButtonBarExample.bind({});

ButtonBarInSplitLayout.argTypes = {
  align: {
    options: [...FLEX_ALIGNMENT_BASE, "stretch", "baseline"],
    control: {type: "select"},
  },
  gap: {
    type: "number",
  },
  pushRight: {
    type: "number",
  },
  separators: {
    options: ["start", "center", "end", true],
    control: {type: "select"},
  },
  wrap: {
    type: "boolean",
  },
};



