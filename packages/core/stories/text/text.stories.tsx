import { Meta, StoryFn } from "@storybook/react";

import {
  Display1,
  Display2,
  Display3,
  H1,
  H2,
  H3,
  H4,
  Label as LabelText,
  Text,
} from "@salt-ds/core";

export default {
  title: "Core/Text",
  component: Text,
  parameters: {
    controls: {
      hideNoControlsWarning: true,
      exclude: ["elementType", "style"],
    },
  },
} as Meta<typeof Text>;

const TextTemplate: StoryFn<typeof Text> = (args) => <Text {...args} />;

export const Primary = TextTemplate.bind({});
Primary.args = {
  children: "This is a primary text example",
};

export const Secondary = TextTemplate.bind({});
Secondary.args = {
  children: "This is a secondary text example",
  variant: "secondary",
};

export const Strong: StoryFn<typeof Text> = (args) => {
  return (
    <Text {...args}>
      This is a <strong>strong</strong> text example
    </Text>
  );
};

export const Small: StoryFn<typeof Text> = (args) => {
  return (
    <Text {...args}>
      This is a <small>small</small> text example
    </Text>
  );
};

export const StyleAs = TextTemplate.bind({});
StyleAs.args = {
  as: "p",
  styleAs: "h1",
};

export const Truncation: StoryFn<typeof Text> = (args) => {
  return (
    <div style={{ width: 150 }}>
      <Text {...args}>This is a truncation example</Text>
    </div>
  );
};
Truncation.args = {
  maxRows: 1,
};

//********** Display 1,2 and 3 ***********/

const FigureTextComponent: StoryFn<typeof Text> = () => {
  return (
    <>
      <Display1>Display 1</Display1>
      <br />
      <Display2>Display 2</Display2>
      <br />
      <Display3>Display 3</Display3>
    </>
  );
};

export const Display = FigureTextComponent.bind({});

//********** Headings H1, H2, H3 and  H4 ***********/

const HeadingsComponent: StoryFn<typeof Text> = () => (
  <>
    <H1>
      This is header 1 <strong>emphasis high</strong>
    </H1>
    <H1>
      This is header 1 <small>emphasis low</small>
    </H1>
    <br />
    <H2>
      This is header 2 <strong>emphasis high</strong>
    </H2>
    <H2>
      This is header 2 <small>emphasis low</small>
    </H2>
    <br />
    <H3>
      This is header 3 <strong>emphasis high</strong>
    </H3>
    <H3>
      This is header 3 <small>emphasis low</small>
    </H3>
    <br />
    <H4>
      This is header 4 <strong>emphasis high</strong>
    </H4>
    <H4>
      This is header 4 <small>emphasis low</small>
    </H4>
  </>
);
export const Headings = HeadingsComponent.bind({});

//********** Label ***********/

const LabelCaptionTextComponent: StoryFn<typeof Text> = () => {
  return (
    <>
      <LabelText>
        Label text - label - His seasons Shall without form fourth seed so.
      </LabelText>
      <br />
      <LabelText>
        Label text
        <strong> emphasis high</strong>
      </LabelText>
      <br />
      <LabelText>
        Label text
        <small> emphasis low</small>
      </LabelText>
    </>
  );
};

export const Label = LabelCaptionTextComponent.bind({});
