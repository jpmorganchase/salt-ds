import { ComponentMeta, ComponentStory } from "@storybook/react";

import {
  Text,
  Code,
  Div,
  Span,
  P,
  Figure1,
  Figure2,
  Figure3,
  H1,
  H2,
  H3,
  H4,
  HelpText,
  LabelCaption,
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
        "onOverflowChange",
        "ref",
        "showTooltip",
        "style",
        "styleAs",
        "tooltipProps",
        "tooltipText",
        "truncate",
      ],
    },
  },
} as ComponentMeta<typeof Text>;

//********** Div ***********/

const DivExample: ComponentStory<typeof Text> = () => {
  return (
    <Div>
      Div component - This is an example of text content.{" "}
      <strong>Emphasis strong. </strong>
      <small>Emphasis small. </small>
    </Div>
  );
};

export const DivComponent = DivExample.bind({});
DivComponent.parameters = {
  controls: {
    hideNoControlsWarning: true,
    exclude: [
      "elementType",
      "maxRows",
      "onOverflowChange",
      "ref",
      "showTooltip",
      "style",
      "styleAs",
      "tooltipProps",
      "tooltipText",
      "truncate",
    ],
  },
};

//********** Span ***********/

const SpanExample: ComponentStory<typeof Span> = () => {
  return (
    <Span>
      Span component - This is an example of text content.{" "}
      <strong>Emphasis strong. </strong>
      <small>Emphasis small. </small>
    </Span>
  );
};

export const SpanComponent = SpanExample.bind({});
SpanComponent.parameters = {
  controls: {
    hideNoControlsWarning: true,
    exclude: [
      "elementType",
      "maxRows",
      "onOverflowChange",
      "ref",
      "showTooltip",
      "style",
      "styleAs",
      "tooltipProps",
      "tooltipText",
      "truncate",
    ],
  },
};

//********** Paragraph - P ***********/

const PExample: ComponentStory<typeof P> = () => {
  return (
    <P>
      Paragraph component - This is an example of text content.{" "}
      <strong>Emphasis strong. </strong>
      <small>Emphasis small. </small>
    </P>
  );
};

export const PComponent = PExample.bind({});

//********** Code ***********/

const CodeExample: ComponentStory<typeof Code> = () => {
  return (
    <Code>
      Code component - This is an example of text content.{" "}
      <strong>Emphasis strong. </strong>
      <small>Emphasis small. </small>
    </Code>
  );
};

export const CodeComponent = CodeExample.bind({});

//********** Figure 1,2 and 3 ***********/

const FigureExample: ComponentStory<typeof Figure1> = () => {
  return (
    <>
      <Figure1>Figure1</Figure1> <Figure2>Figure2</Figure2>{" "}
      <Figure3>Figure3</Figure3>
    </>
  );
};

export const Figure = FigureExample.bind({});

//********** Headings H1, H2, H3 and  H4 ***********/

const HeadingExample: ComponentStory<typeof H1> = () => (
  <>
    <H1>
      This is heading level 1. <strong>Emphasis strong.</strong>{" "}
      <small>Emphasis small.</small>
    </H1>
    <br />
    <H2>
      This is heading level 2. <strong>Emphasis strong.</strong>{" "}
      <small>Emphasis small.</small>
    </H2>
    <br />
    <H3>
      This is heading level 3. <strong>Emphasis strong.</strong>{" "}
      <small>Emphasis small.</small>
    </H3>
    <br />
    <H4>
      This is heading level 4. <strong>Emphasis strong.</strong>{" "}
      <small>Emphasis small.</small>
    </H4>
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
  </>
);
export const Headings = HeadingExample.bind({});

//********** HelpText ***********/

const HelpTextExample: ComponentStory<typeof HelpText> = () => {
  return (
    <HelpText>
      Help Text - This is an example of text content.{" "}
      <strong>Emphasis strong. </strong>
      <small>Emphasis small. </small>
    </HelpText>
  );
};

export const HelpTextComponent = HelpTextExample.bind({});

//********** LabelCaption ***********/

const LabelCaptionExample: ComponentStory<typeof LabelCaption> = () => {
  return (
    <LabelCaption>
      LabelCaption text - This is an example of text content.{" "}
      <strong>Emphasis strong. </strong>
      <small>Emphasis small. </small>
    </LabelCaption>
  );
};

export const LabelCaptionComponent = LabelCaptionExample.bind({});
