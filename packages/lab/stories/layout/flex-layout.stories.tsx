import {
  FLEX_ALIGNMENT_BASE,
  FLEX_CONTENT_ALIGNMENT_BASE,
  FlexItem,
  FlexLayout,
  SEPARATOR_VARIANTS,
} from "@brandname/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Layout/FlexLayout",
  component: FlexLayout,
} as ComponentMeta<typeof FlexLayout>;

const flexItemStyles = {
  background: "lightcyan",
  padding: "1rem",
};
const flexLayoutStyle = {
  maxWidth: "600px",
  height: "300px",
  background: "lightblue",
};

const Template: ComponentStory<typeof FlexLayout> = (args) => {
  const handleSplitterMoved = (sizes: any) => {
    console.log(`splitter moved ${JSON.stringify(sizes)}`);
  };
  return (
    <FlexLayout
      style={flexLayoutStyle}
      {...args}
      onSplitterMoved={handleSplitterMoved}
    >
      {Array.from({ length: 4 }, (i, index) => (
        <FlexItem resizeable style={flexItemStyles}>
          <p>{`FlexItem ${index}`}</p>
        </FlexItem>
      ))}
    </FlexLayout>
  );
};
export const ToolkitFlexLayout = Template.bind({});
ToolkitFlexLayout.args = {
  alignItems: "stretch",
  display: "flex",
  direction: "row",
  reverse: false,
  wrap: "wrap",
  justifyContent: "flex-start",
};

ToolkitFlexLayout.argTypes = {
  alignContent: {
    options: [...FLEX_ALIGNMENT_BASE, "stretch"],
    control: { type: "select" },
  },
  alignItems: {
    options: [...FLEX_ALIGNMENT_BASE, "stretch", "baseline"],
    control: { type: "select" },
  },
  display: {
    options: ["flex", "inline-flex"],
    control: { type: "radio" },
  },
  direction: {
    options: ["row", "column"],
    control: { type: "radio" },
  },
  reverse: {
    control: { type: "boolean" },
  },
  separator: {
    options: SEPARATOR_VARIANTS,
    control: { type: "select" },
  },
  wrap: {
    options: ["wrap", "nowrap", "wrap-reverse"],
    control: { type: "select" },
  },
  justifyContent: {
    options: FLEX_CONTENT_ALIGNMENT_BASE,
    control: { type: "select" },
  },
};

const SplitterTemplate: ComponentStory<typeof FlexLayout> = (args) => {
  const handleSplitterMoved = (sizes: any) => {
    console.log(`splitter moved ${JSON.stringify(sizes)}`);
  };
  return (
    <FlexLayout
      splitter
      style={flexLayoutStyle}
      {...args}
      onSplitterMoved={handleSplitterMoved}
    >
      {Array.from({ length: 2 }, (i, index) => (
        <FlexItem resizeable style={flexItemStyles} key={index}>
          <p>{`FlexItem ${index}`}</p>
        </FlexItem>
      ))}
    </FlexLayout>
  );
};
export const ToolkitFlexWithSplitterLayout = SplitterTemplate.bind({});
ToolkitFlexWithSplitterLayout.args = {
  direction: "row",
  wrap: "nowrap",
};

ToolkitFlexWithSplitterLayout.argTypes = {
  direction: {
    options: ["row", "column"],
    control: { type: "radio" },
  },
};

const Responsive: ComponentStory<typeof FlexLayout> = (args) => {
  return (
    <FlexLayout
      style={{ ...flexLayoutStyle, maxWidth: "none" }}
      direction={["column", "column", "row"]}
      wrap={["wrap", "wrap", "nowrap"]}
      reverse={[true, true]}
      {...args}
    >
      {Array.from({ length: 12 }, (_, index) => (
        <FlexItem style={flexItemStyles} stretch={1} key={index}>
          <p>{`FlexItem ${index + 1}`}</p>
        </FlexItem>
      ))}
    </FlexLayout>
  );
};
export const ToolkitFlexLayoutResponsive = Responsive.bind({});
ToolkitFlexLayoutResponsive.args = {
  alignItems: "stretch",
  display: "flex",
  justifyContent: "flex-start",
};

ToolkitFlexLayoutResponsive.argTypes = {
  alignContent: {
    options: [...FLEX_ALIGNMENT_BASE, "stretch"],
    control: { type: "select" },
  },
  alignItems: {
    options: [...FLEX_ALIGNMENT_BASE, "stretch", "baseline"],
    control: { type: "select" },
  },
  display: {
    options: ["flex", "inline-flex"],
    control: { type: "radio" },
  },
  direction: {
    options: ["row", "column"],
    control: { type: "radio" },
  },
  reverse: {
    control: { type: "boolean" },
  },
  separator: {
    options: SEPARATOR_VARIANTS,
    control: { type: "select" },
  },
  wrap: {
    options: ["wrap", "nowrap", "wrap-reverse"],
    control: { type: "select" },
  },
  justifyContent: {
    options: FLEX_CONTENT_ALIGNMENT_BASE,
    control: { type: "select" },
  },
};
