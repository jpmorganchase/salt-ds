import { FlexItem, FlexLayout } from "@salt-ds/core";

import type { Meta, StoryFn } from "@storybook/react-vite";
import "../layout/layout.stories.css";

export default {
  title: "Core/Layout/Flex Layout",
  component: FlexLayout,
  subcomponents: { FlexItem },
  argTypes: {
    as: { type: "string" },
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
  excludeStories: ["NestedExample"],
} as Meta<typeof FlexLayout>;

const DefaultStory: StoryFn<typeof FlexLayout> = (args) => {
  return (
    <FlexLayout {...args}>
      {Array.from({ length: 5 }, (_, index) => (
        <div key={`item-${index + 1}`} className="layout-content">
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

const PaddingAndMargins: StoryFn<typeof FlexLayout> = (args) => {
  return (
    <div className="spacing-example-margin">
      <FlexLayout className="spacing-example-padding" {...args}>
        {Array.from({ length: 5 }, (_, index) => (
          <FlexItem
            className="spacing-example-gap"
            key={`item-${index + 1}`}
            padding={1}
          >
            <p>Item {index + 1}</p>
          </FlexItem>
        ))}
      </FlexLayout>
    </div>
  );
};
export const WithPaddingAndMargins = PaddingAndMargins.bind({});
WithPaddingAndMargins.args = {
  wrap: false,
  gap: 1,
  padding: 2,
  margin: 2,
};
const SeparatedItemsStory: StoryFn<typeof FlexLayout> = (args) => {
  return (
    <FlexLayout {...args}>
      {Array.from({ length: 3 }, (_, index) => (
        <div key={`item-${index + 1}`} className="layout-content">
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

const Responsive: StoryFn<typeof FlexLayout> = (args) => {
  return (
    <FlexLayout direction="column">
      <div className="layout-content">Item </div>
      <FlexLayout {...args}>
        {Array.from({ length: 6 }, (_, index) => (
          <div
            className="layout-content"
            key={`item-${index + 1}`}
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

const NestedExample: StoryFn<typeof FlexLayout> = (args) => {
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
export const PolymorphicList: StoryFn<typeof FlexLayout> = (args) => {
  return (
    <FlexLayout {...args} as="ol" direction="column">
      {Array.from({ length: flagsList.length }, (_, index) => (
        <FlexItem as="li" key={flagsList[index]}>
          {flagsList[index]}
        </FlexItem>
      ))}
    </FlexLayout>
  );
};
