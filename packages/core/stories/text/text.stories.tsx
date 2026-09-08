import {
  Code as CodeText,
  Display1,
  Display2,
  Display3,
  H1,
  H2,
  H3,
  H4,
  Label as LabelText,
  StackLayout,
  Text,
  TextAction,
  TextNotation,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";

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
  return <Text color="secondary">This is a secondary text example</Text>;
};

export const Info: StoryFn<typeof Text> = () => {
  return <Text color="info">This is a info text example</Text>;
};

export const Error: StoryFn<typeof Text> = () => {
  return <Text color="error">This is a error text example</Text>;
};

export const Warning: StoryFn<typeof Text> = () => {
  return <Text color="warning">This is a warning text example</Text>;
};

export const Success: StoryFn<typeof Text> = () => {
  return <Text color="success">This is a success text example</Text>;
};

export const InheritColor: StoryFn<typeof Text> = () => {
  return <Text color="inherit">This is a inherit text example</Text>;
};

export const Disabled: StoryFn<typeof Text> = () => {
  return (
    <div>
      <Text disabled>This is a disabled primary text example</Text>
      <Text color="secondary" disabled>
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
    <StackLayout>
      <Display1>Display 1</Display1>
      <Display2>Display 2</Display2>
      <Display3>Display 3</Display3>
    </StackLayout>
  );
};

export const Display = FigureTextComponent.bind({});

//********** Headings H1, H2, H3 and H4 ***********/

const HeadingsComponent: StoryFn<typeof Text> = () => (
  <StackLayout>
    <StackLayout gap={3}>
      <H1>
        This is header 1 <strong>emphasis high</strong>
      </H1>
      <H1>
        This is header 1 <small>emphasis low</small>
      </H1>
    </StackLayout>
    <StackLayout gap={2}>
      <H2>
        This is header 2 <strong>emphasis high</strong>
      </H2>
      <H2>
        This is header 2 <small>emphasis low</small>
      </H2>
    </StackLayout>
    <StackLayout gap={1}>
      <H3>
        This is header 3 <strong>emphasis high</strong>
      </H3>
      <H3>
        This is header 3 <small>emphasis low</small>
      </H3>
    </StackLayout>
    <StackLayout gap={1}>
      <H4>
        This is header 4 <strong>emphasis high</strong>
      </H4>
      <H4>
        This is header 4 <small>emphasis low</small>
      </H4>
    </StackLayout>
  </StackLayout>
);
export const Headings = HeadingsComponent.bind({});

//********** Label ***********/

const LabelCaptionTextComponent: StoryFn<typeof Text> = () => {
  return (
    <StackLayout>
      <LabelText>
        Label text - label - His seasons Shall without form fourth seed so.
      </LabelText>
      <LabelText>
        Label text
        <strong> emphasis high</strong>
      </LabelText>
      <LabelText>
        Label text
        <small> emphasis low</small>
      </LabelText>
    </StackLayout>
  );
};

export const Label = LabelCaptionTextComponent.bind({});

//********** Notation ***********/

const TextNotationComponent: StoryFn<typeof Text> = () => {
  return (
    <StackLayout>
      <TextNotation>
        Notation text - notation - His seasons Shall without form fourth seed
        so.
      </TextNotation>
      <TextNotation>
        Notation text
        <strong> emphasis high</strong>
      </TextNotation>
      <TextNotation>
        Notation text
        <small> emphasis low</small>
      </TextNotation>
    </StackLayout>
  );
};

export const Notation = TextNotationComponent.bind({});

//********** Action ***********/

const TextActionComponent: StoryFn<typeof Text> = () => {
  return (
    <StackLayout>
      <TextAction>
        Action text - action - His seasons Shall without form fourth seed so.
      </TextAction>
      <TextAction>
        Action text
        <strong> emphasis high</strong>
      </TextAction>
      <TextAction>
        Action text
        <small> emphasis low</small>
      </TextAction>
    </StackLayout>
  );
};

export const Action = TextActionComponent.bind({});

//********** Code ***********/

const CodeComponent: StoryFn<typeof Text> = () => {
  return (
    <StackLayout>
      <CodeText>
        Code text - code - His seasons Shall without form fourth seed so.
      </CodeText>
      <CodeText>
        Code text
        <strong> emphasis high</strong>
      </CodeText>
      <CodeText>
        Code text
        <small> emphasis low</small>
      </CodeText>
    </StackLayout>
  );
};

export const Code = CodeComponent.bind({});
