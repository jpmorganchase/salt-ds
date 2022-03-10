import { ComponentMeta, ComponentStory } from "@storybook/react";

import { Text, H1, H2, H3, H4 } from "@brandname/lab";

export default {
  title: "Lab/Typography",
  component: Text,
} as ComponentMeta<typeof Text>;

const HeadingsComponent: ComponentStory<typeof Text> = (args) => (
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
Headings.parameters = {
  controls: {
    exclude: [
      "elementType",
      "maxRows",
      "showTooltip",
      "tooltipProps",
      "truncate",
      "expanded",
      "style",
      "onOverflow",
    ],
  },
};
