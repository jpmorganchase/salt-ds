import { FlexItem, FlexLayout } from "@salt-ds/core";

import { ComponentMeta, ComponentStory } from "@storybook/react";
import "./layout-stories.css";

export default {
  title: "Core/Layout/FlexLayout",
  component: FlexLayout,
  subcomponents: { FlexItem },
  argTypes: {
    align: {
      options: ["start", "end", "center", "stretch", "baseline"],
      control: { type: "select" },
    },
    direction: {
      options: ["row", "column"],
      control: { type: "select" },
    },
    gap: {
      type: "number",
    },
    justify: {
      options: [
        "start",
        "end",
        "center",
        "space-between",
        "space-around",
        "space-evenly",
      ],
      control: { type: "select" },
    },
    wrap: {
      control: "boolean",
    },
  },
  args: {
    gap: 3,
  },
  excludeStories: ["FlexLayoutNestedExample"],
} as ComponentMeta<typeof FlexLayout>;

const DefaultFlexLayoutStory: ComponentStory<typeof FlexLayout> = (args) => {
  return (
    <FlexLayout {...args}>
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="layout-content">
          <p>Item {index + 1}</p>
        </div>
      ))}
    </FlexLayout>
  );
};
export const DefaultFlexLayout = DefaultFlexLayoutStory.bind({});
DefaultFlexLayout.args = {
  wrap: true,
};

const Responsive: ComponentStory<typeof FlexLayout> = (args) => {
  return (
    <FlexLayout direction="column">
      <div className="layout-content">Item </div>
      <FlexLayout {...args}>
        {Array.from({ length: 6 }, (_, index) => (
          <div
            className="layout-content"
            key={index}
            style={{ width: "200px" }}
          >
            <p>Item {index + 1}</p>
          </div>
        ))}
      </FlexLayout>
    </FlexLayout>
  );
};
export const FlexLayoutUsingResponsiveProps = Responsive.bind({});
FlexLayoutUsingResponsiveProps.args = {
  justify: "start",
  direction: {
    xs: "column",
    md: "row",
    lg: "row",
  },
  wrap: {
    xs: false,
    md: true,
  },
};

const FlexLayoutNestedExample: ComponentStory<typeof FlexLayout> = (args) => {
  return (
    <FlexLayout {...args}>
      <div className="layout-content">Item 1</div>
      <FlexLayout className="layout-container">
        <div>Item 1</div>
        <div>Item 2</div>
      </FlexLayout>
    </FlexLayout>
  );
};
export const FlexLayoutNested = FlexLayoutNestedExample.bind({});
FlexLayoutNested.args = {
  justify: "space-between",
  wrap: true,
  gap: 6,
};

const flagsList: string[] = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
];
export const FlexLayoutPolymorphicList: ComponentStory<typeof FlexLayout> = (
  args
) => {
  return (
    <FlexLayout {...args} as="ol" direction="column">
      {Array.from({ length: flagsList.length }, (_, index) => (
        <FlexItem as="li">{flagsList[index]}</FlexItem>
      ))}
    </FlexLayout>
  );
};
