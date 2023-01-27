import {
  Button,
  FLEX_ALIGNMENT_BASE,
  FlowLayout,
  SplitLayout,
} from "@salt-ds/core";
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
    as: {
      type: "string",
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

const LeftSide = () => (
  <FlowLayout className="layout-container" align="baseline">
    {Array.from({ length: 3 }, (_, index) => (
      <div key={index}>
        <p>Item {index + 1}</p>
      </div>
    ))}
  </FlowLayout>
);
const RightSide = () => (
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
  children: [<LeftSide />, <RightSide />],
};

const FormButtonBar: ComponentStory<typeof SplitLayout> = (args) => (
  <SplitLayout {...args}>
    <FlowLayout gap={1}>
      <Button variant="cta">Button 1</Button>
      <Button variant="primary">Button 2</Button>
      <Button variant="secondary">Button 3</Button>
    </FlowLayout>
    <FlowLayout gap={1}>
      <Button variant="cta">Button 4</Button>
      <Button variant="primary">Button 5</Button>
    </FlowLayout>
  </SplitLayout>
);

export const SplitLayoutSimpleUsage = FormButtonBar.bind({});
