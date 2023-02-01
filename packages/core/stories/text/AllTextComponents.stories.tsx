import { ComponentMeta, ComponentStory } from "@storybook/react";

import {
  Text,
  Display1,
  Display2,
  Display3,
  H1,
  H2,
  H3,
  H4,
  Label as LabelText,
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
} as ComponentMeta<typeof Text>;

export const Primary: ComponentStory<typeof Text> = () => {
  return (
    <Text>This is a primary text example</Text>
  );
};

export const Secondary: ComponentStory<typeof Text> = () => {
  return (
    <Text variant="secondary">This is a secondary text example</Text>
  );
};

export const Strong: ComponentStory<typeof Text> = () => {
  return (
    <Text>
      This is a <strong>strong</strong> text example
    </Text>
  );
};

export const Small: ComponentStory<typeof Text> = () => {
  return (
    <Text>
      This is a <small>small</small> text example
    </Text>
  );
};

export const StyleAs: ComponentStory<typeof Text> = () => {
  return (
    <Text as="p" styleAs="h1">
      This is a styleAs h1 example
    </Text>
  );
};

export const Truncation: ComponentStory<typeof Text> = () => {
  return (
<div style={{ width: 150 }}>
<Text maxRows={1}>This is a truncation example</Text>
</div>
  );
};

//********** Display 1,2 and 3 ***********/

const FigureTextComponent: ComponentStory<typeof Text> = () => {
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

const HeadingsComponent: ComponentStory<typeof Text> = () => (
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

const LabelCaptionTextComponent: ComponentStory<typeof Text> = () => {
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
