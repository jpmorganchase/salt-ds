import {
  Avatar,
  Card,
  FLEX_ALIGNMENT_BASE,
  FlexItem,
  FlexLayout,
  HORIZONTAL_SEPARATOR_VARIANTS,
  StackLayout,
} from "@brandname/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Layout/StackLayout",
  component: StackLayout,
} as ComponentMeta<typeof StackLayout>;

const flexItemStyles = { background: "lightcyan", padding: "1rem" };
const flexLayoutStyle = {
  background: "lightblue",
  border: "solid 1px lightgrey",
};

const Template: ComponentStory<typeof StackLayout> = (args) => {
  return (
    <StackLayout style={flexLayoutStyle} {...args}>
      {Array.from({ length: 4 }, (i, index) => (
        <FlexItem resizeable style={flexItemStyles} {...args}>
          <p>{`FlexItem ${index + 1}`}</p>
        </FlexItem>
      ))}
    </StackLayout>
  );
};
export const ToolkitStackLayout = Template.bind({});
ToolkitStackLayout.args = {};

ToolkitStackLayout.argTypes = {
  alignItems: {
    options: [...FLEX_ALIGNMENT_BASE, "stretch", "baseline"],
    control: { type: "select" },
  },
  reverse: {
    control: { type: "boolean" },
  },
  splitter: {
    control: { type: "boolean" },
  },
  separator: {
    options: [...HORIZONTAL_SEPARATOR_VARIANTS, null],
    control: { type: "select" },
  },
};

const cardText =
  "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aut, dicta impedit nemo nobis sed sunt. Consequuntur dignissimos, doloribus enim et hic incidunt, magnam mollitia nisi omnis quam rerum veniam veritatis?";
const CardsStackTemplate: ComponentStory<typeof StackLayout> = (args) => {
  return (
    <StackLayout {...args}>
      {Array.from({ length: 4 }, () => (
        <FlexItem resizeable style={flexItemStyles}>
          <Card>
            <FlexLayout colGap={"1rem"} alignItems="center">
              <Avatar />
              <div style={{ maxWidth: "40vw" }}>
                <p>{cardText}</p>
              </div>
            </FlexLayout>
          </Card>
        </FlexItem>
      ))}
    </StackLayout>
  );
};
export const CardsInStackLayout = CardsStackTemplate.bind({});
CardsInStackLayout.args = {
  alignItems: "stretch",
};

CardsInStackLayout.argTypes = {
  alignItems: {
    options: [...FLEX_ALIGNMENT_BASE, "stretch", "baseline"],
    control: { type: "select" },
  },
  reverse: {
    control: { type: "boolean" },
  },
  splitter: {
    control: { type: "boolean" },
  },
  separator: {
    options: [...HORIZONTAL_SEPARATOR_VARIANTS, null],
    control: { type: "select" },
  },
};
