import { FLEX_ALIGNMENT_BASE, FlowLayout } from "@jpmorganchase/uitk-core";

import { ComponentMeta, ComponentStory } from "@storybook/react";
import "./layout-stories.css";

export default {
  title: "Core/Layout/FlowLayout",
  component: FlowLayout,
  argTypes: {
    align: {
      options: [...FLEX_ALIGNMENT_BASE, "stretch", "baseline"],
      control: { type: "select" },
    },
    gap: {
      type: "number",
    },
  },
  args: {
    gap: 3,
  },
} as ComponentMeta<typeof FlowLayout>;

const DefaultFlowLayoutStory: ComponentStory<typeof FlowLayout> = (args) => {
  return (
    <FlowLayout className="layout-container" {...args}>
      {Array.from({ length: 12 }, (_, index) => (
        <div key={index} style={{ minWidth: 80 }}>
          <p>Item {index + 1}</p>
        </div>
      ))}
    </FlowLayout>
  );
};
export const DefaultFlowLayout = DefaultFlowLayoutStory.bind({});
DefaultFlowLayout.args = {};
