import { Button } from "@jpmorganchase/uitk-core";
import {
  FLEX_ALIGNMENT_BASE,
  FlexLayout,
  SplitLayout
} from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { FlexContent } from "./flex-item.stories";
import { ExportIcon, ImportIcon } from "@jpmorganchase/uitk-icons";

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
  }
} as ComponentMeta<typeof SplitLayout>;

const Template: ComponentStory<typeof SplitLayout> = (args) => {
  const LeftItem = () => {
    return (
      <FlexLayout>
        {Array.from({ length: 3 }, (_, index) => (
          <FlexContent key={index}>{`item ${index + 1}`}</FlexContent>
        ))}
      </FlexLayout>
    );
  };
  const RightItem = () => {
    return (
      <FlexLayout>
        <FlexContent>item 4</FlexContent>
        <FlexContent>
          Item
          <br />5
        </FlexContent>
      </FlexLayout>
    );
  };

  return (
    <SplitLayout
      {...args}
      leftSplitItem={<LeftItem />}
      rightSplitItem={<RightItem />}
    />
  );
};
export const ToolkitSplitLayout = Template.bind({});

const ButtonBarExample: ComponentStory<typeof SplitLayout> = (args) => {
  const LeftItem = () => (
    <>
      <Button variant="secondary">
        <ExportIcon style={{ marginRight: 5 }} />
        Export
      </Button>
      <Button variant="secondary">
        <ImportIcon style={{ marginRight: 5 }} />
        Import
      </Button>
    </>
  );
  const RightItem = () => (
    <>
      <Button variant="cta">Save</Button> <Button>Cancel</Button>
    </>
  );
  return (
    <SplitLayout
      {...args}
      leftSplitItem={<LeftItem />}
      rightSplitItem={<RightItem />}
    />
  );
};
export const ButtonBarInSplitLayout = ButtonBarExample.bind({});
