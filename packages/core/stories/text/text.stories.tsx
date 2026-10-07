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
      This is an <strong>important</strong> text example
    </Text>
  );
};

export const FontWeight: StoryFn<typeof Text> = () => {
  return (
    <StackLayout>
      <Text fontWeight="lighter">This is a lighter text example</Text>
      <Text>This is a default text example</Text>
      <Text fontWeight="bolder">This is a bolder text example</Text>
      <Text>
        This is a <b>bold</b> text example
      </Text>
      <H1 fontWeight="lighter">This is a lighter heading example</H1>
      <H1 fontWeight="bolder">This is a bolder heading example</H1>
    </StackLayout>
  );
};

export const InheritedFontWeight: StoryFn<typeof Text> = () => {
  return (
    <StackLayout>
      <Text>
        This is a{" "}
        <Text as="span" styleAs="inherit" fontWeight="lighter">
          lighter
        </Text>{" "}
        text example
      </Text>
      <H2 color="secondary">
        This is a{" "}
        <Text as="span" styleAs="inherit" fontWeight="lighter">
          lighter
        </Text>{" "}
        heading example
      </H2>
    </StackLayout>
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
  <StackLayout gap={6}>
    <StackLayout gap={3}>
      <H1>
        This is header 1 <b>emphasis high</b>
      </H1>
      <H1>
        This is header 1{" "}
        <Text as="span" styleAs="inherit" fontWeight="lighter">
          emphasis low
        </Text>
      </H1>
    </StackLayout>
    <StackLayout gap={2}>
      <H2>
        This is header 2 <b>emphasis high</b>
      </H2>
      <H2>
        This is header 2{" "}
        <Text as="span" styleAs="inherit" fontWeight="lighter">
          emphasis low
        </Text>
      </H2>
    </StackLayout>
    <StackLayout gap={1}>
      <H3>
        This is header 3 <b>emphasis high</b>
      </H3>
      <H3>
        This is header 3{" "}
        <Text as="span" styleAs="inherit" fontWeight="lighter">
          emphasis low
        </Text>
      </H3>
    </StackLayout>
    <StackLayout gap={1}>
      <H4>
        This is header 4 <b>emphasis high</b>
      </H4>
      <H4>
        This is header 4{" "}
        <Text as="span" styleAs="inherit" fontWeight="lighter">
          emphasis low
        </Text>
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
        Label text <b>emphasis high</b>
      </LabelText>
      <LabelText>
        Label text{" "}
        <Text as="span" styleAs="inherit" fontWeight="lighter">
          emphasis low
        </Text>
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
        Notation text <b>emphasis high</b>
      </TextNotation>
      <TextNotation>
        Notation text{" "}
        <Text as="span" styleAs="inherit" fontWeight="lighter">
          emphasis low
        </Text>
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
        Action text <b>emphasis high</b>
      </TextAction>
      <TextAction>
        Action text{" "}
        <Text as="span" styleAs="inherit" fontWeight="lighter">
          emphasis low
        </Text>
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
        Code text <b>emphasis high</b>
      </CodeText>
      <CodeText>
        Code text{" "}
        <Text as="span" styleAs="inherit" fontWeight="lighter">
          emphasis low
        </Text>
      </CodeText>
    </StackLayout>
  );
};

export const Code = CodeComponent.bind({});
