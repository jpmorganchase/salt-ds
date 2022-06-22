import { ComponentMeta, ComponentStory } from "@storybook/react";

import {
  Text,
  Code as CodeText,
  Div as DivText,
  Span as SpanText,
  P as PText,
  Figure1,
  Figure2,
  Figure3,
  H1,
  H2,
  H3,
  H4,
  HelpText as HelpTextComp,
  LabelCaption as LabelCaptionText,
} from "@jpmorganchase/uitk-lab";

export default {
  title: "Lab/Typography",
  component: Text,
  parameters: {
    controls: {
      hideNoControlsWarning: true,
      exclude: [
        "elementType",
        "maxRows",
        "showTooltip",
        "tooltipProps",
        "truncate",
        "style",
        "onOverflowChange",
      ],
    },
  },
} as ComponentMeta<typeof Text>;

//********** Body Text ***********/

const DefaultTextComponent: ComponentStory<typeof Text> = () => {
  return (
    <>
      <Text>
        Basic text - div - His seasons Shall without form fourth seed so.
      </Text>
      <Text>
        Basic text
        <strong> emphasis high</strong>
      </Text>
      <Text>
        Basic text
        <small> emphasis low</small>
      </Text>
    </>
  );
};

export const DefaultText = DefaultTextComponent.bind({});

//********** Div ***********/

const DivTextComponent: ComponentStory<typeof Text> = () => {
  return (
    <>
      <DivText>
        Div text component - His seasons Shall without form fourth seed so.
      </DivText>
      <DivText>
        Div text component
        <strong> emphasis high</strong>
      </DivText>
      <DivText>
        Div text component
        <small> emphasis low</small>
      </DivText>
    </>
  );
};

export const Div = DivTextComponent.bind({});

//********** Span ***********/

const SpanTextComponent: ComponentStory<typeof Text> = () => {
  return (
    <>
      <SpanText>
        Span text component - His seasons Shall without form fourth seed so.
      </SpanText>
      <br />
      <SpanText>
        Span text component
        <strong> emphasis high</strong>
      </SpanText>
      <br />
      <SpanText>
        Span text component
        <small> emphasis low</small>
      </SpanText>
    </>
  );
};

export const Span = SpanTextComponent.bind({});

//********** Paragraph - P ***********/

const PTextComponent: ComponentStory<typeof Text> = () => {
  return (
    <>
      <PText>
        Paragraph text component - His seasons Shall without form fourth seed
        so.
      </PText>
      <PText>
        Paragraph text component
        <strong> emphasis high</strong>
      </PText>
      <PText>
        Paragraph text component
        <small> emphasis low</small>
      </PText>
    </>
  );
};

export const P = PTextComponent.bind({});

//********** Code ***********/

const CodeTextComponent: ComponentStory<typeof Text> = () => {
  return (
    <>
      <CodeText>
        Code text component - His seasons Shall without form fourth seed so.
      </CodeText>
      <br />
      <CodeText>
        Code text component
        <strong> emphasis high</strong>
      </CodeText>
      <br />
      <CodeText>
        Code text component
        <small> emphasis low</small>
      </CodeText>
    </>
  );
};

export const Code = CodeTextComponent.bind({});

//********** Figure 1,2 and 3 ***********/

const FigureTextComponent: ComponentStory<typeof Text> = () => {
  return (
    <>
      <Figure1>Figure 1</Figure1>
      <Figure2>Figure 2</Figure2>
      <Figure3>Figure 3</Figure3>
    </>
  );
};

export const Figure = FigureTextComponent.bind({});

//********** Headings H1, H2, H3 and  H4 ***********/

const HeadingsComponent: ComponentStory<typeof Text> = () => (
  <>
    <div
      style={{
        display: "flex",
        gap: 50,
        alignItems: "baseline",
      }}
    >
      <div>
        <H1>Page heading 1</H1>
        <H2>Page heading 2</H2>
        <H3>Page heading 3</H3>
        <H4>Page heading 4</H4>
      </div>
      <div>
        <H2 styleAs="h1">Page heading 2 styled as h1</H2>
        <H3 styleAs="h2">Page heading 3 styled as h2</H3>
        <H4 styleAs="h3">Page heading 4 styled as h3</H4>
        <H1 styleAs="h4">Page heading 1 styled as h4</H1>
      </div>
    </div>
    <br />
    <br />
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

//********** HelpText ***********/

const HelpTextComponent: ComponentStory<typeof Text> = () => {
  return (
    <>
      <HelpTextComp>
        Help Text - div - His seasons Shall without form fourth seed so.
      </HelpTextComp>
      <HelpTextComp>
        Help Text
        <strong> emphasis high</strong>
      </HelpTextComp>
      <HelpTextComp>
        Help Text
        <small> emphasis low</small>
      </HelpTextComp>
    </>
  );
};

export const HelpText = HelpTextComponent.bind({});

//********** LabelCaption ***********/

const LabelCaptionTextComponent: ComponentStory<typeof Text> = () => {
  return (
    <>
      <LabelCaptionText>
        LabelCaption text - label - His seasons Shall without form fourth seed
        so.
      </LabelCaptionText>
      <br />
      <LabelCaptionText>
        LabelCaption text
        <strong> emphasis high</strong>
      </LabelCaptionText>
      <br />
      <LabelCaptionText>
        LabelCaption text
        <small> emphasis low</small>
      </LabelCaptionText>
    </>
  );
};

export const LabelCaption = LabelCaptionTextComponent.bind({});
