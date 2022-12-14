import { Button, FLEX_ALIGNMENT_BASE, FlowLayout } from "@salt-ds/core";
import { SplitLayout } from "@salt-ds/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import "./layout-stories.css";

export default {
  title: "Core/Layout/SplitLayout",
  component: SplitLayout,
  argTypes: {
    align: {
      options: [...FLEX_ALIGNMENT_BASE, "stretch", "baseline"],
      control: { type: "select" },
    },
    gap: {
      type: "number",
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
  <FlowLayout className="layout-container">
    {Array.from({ length: 3 }, (_, index) => (
      <div key={index}>
        <p>Item {index + 1}</p>
      </div>
    ))}
  </FlowLayout>
);

const rightItem = (
  <FlowLayout>
    <div className="layout-content-right">
      <p>Item 4</p>
    </div>
    <div className="layout-content-right">
      <p>Item 5</p>
    </div>
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
