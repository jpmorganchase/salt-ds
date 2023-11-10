import { Meta, StoryFn } from "@storybook/react";

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
  Action as ActionText,
  Notation as NotationText,
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

export const Primary: StoryFn<typeof Text> = () => {
  return <Text>This is a primary text example</Text>;
};

export const Secondary: StoryFn<typeof Text> = () => {
  return <Text variant="secondary">This is a secondary text example</Text>;
};

export const Disabled: StoryFn<typeof Text> = () => {
  return (
    <div>
      <Text disabled>This is a disabled primary text example</Text>
      <Text variant="secondary" disabled>
        This is a disabled secondary text example
      </Text>
    </div>
  );
};

export const Strong: StoryFn<typeof Text> = () => {
  return (
    <Text>
      This is a <strong>strong</strong> text example
    </Text>
  );
};

export const Small: StoryFn<typeof Text> = () => {
  return (
    <Text>
      This is a <small>small</small> text example
    </Text>
  );
};

export const StyleAs: StoryFn<typeof Text> = () => {
  return (
    <Text as="p" styleAs="h1">
      This is a styleAs h1 example
    </Text>
  );
};

export const Truncation: StoryFn<typeof Text> = () => {
  return (
    <div style={{ width: 150 }}>
      <Text maxRows={1}>This is a truncation example</Text>
    </div>
  );
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

//********** Headings H1, H2, H3 and H4 ***********/

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
      <LabelText>Label text - label - His seasons Shall without form fourth seed so.</LabelText>
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

//********** Notation ***********/

const NotationComponent: StoryFn<typeof Text> = () => {
  return (
    <>
      <NotationText>
        Notation text - notation - His seasons Shall without form fourth seed so.
      </NotationText>
      <br />
      <NotationText>
        Notation text
        <strong> emphasis high</strong>
      </NotationText>
      <br />
      <NotationText>
        Notation text
        <small> emphasis low</small>
      </NotationText>
    </>
  );
};

export const Notation = NotationComponent.bind({});

//********** Action ***********/

const ActionComponent: StoryFn<typeof Text> = () => {
  return (
    <>
      <ActionText>Action text - action - His seasons Shall without form fourth seed so.</ActionText>
      <br />
      <ActionText>
        Action text
        <strong> emphasis high</strong>
      </ActionText>
      <br />
      <ActionText>
        Action text
        <small> emphasis low</small>
      </ActionText>
    </>
  );
};

export const Action = ActionComponent.bind({});
