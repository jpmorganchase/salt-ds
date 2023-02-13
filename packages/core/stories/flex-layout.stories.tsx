import { FlexItem, FlexLayout } from "@salt-ds/core";

import { ComponentMeta, ComponentStory } from "@storybook/react";
import "./layout-stories.css";

export default {
  title: "Core/Layout/Flex Layout",
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
    separators: {
      options: ["start", "center", "end", true],
      control: { type: "select" },
    },
    wrap: {
      control: "boolean",
    },
  },
  args: {
    gap: 3,
  },
  excludeStories: ["NestedExample"],
} as ComponentMeta<typeof FlexLayout>;

const DefaultStory: ComponentStory<typeof FlexLayout> = (args) => {
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
export const Default = DefaultStory.bind({});
Default.args = {
  wrap: true,
};
const SeparatedItemsStory: ComponentStory<typeof FlexLayout> = (args) => {
  return (
    <FlexLayout {...args}>
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="layout-content">
          <p>Item {index + 1}</p>
        </div>
      ))}
    </FlexLayout>
  );
};
export const WithSeparators = SeparatedItemsStory.bind({});
WithSeparators.args = {
  separators: "center",
  wrap: false,
  direction: { sm: "row", xs: "column" },
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
export const UsingResponsiveProps = Responsive.bind({});
UsingResponsiveProps.args = {
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

const NestedExample: ComponentStory<typeof FlexLayout> = (args) => {
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
export const Nested = NestedExample.bind({});
Nested.args = {
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
export const PolymorphicList: ComponentStory<typeof FlexLayout> = (args) => {
  return (
    <FlexLayout {...args} as="ol" direction="column">
      {Array.from({ length: flagsList.length }, (_, index) => (
        <FlexItem as="li">{flagsList[index]}</FlexItem>
      ))}
    </FlexLayout>
  );
};
