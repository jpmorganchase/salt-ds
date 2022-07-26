import { useState } from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";

import { Text, P, Span, Div } from "@jpmorganchase/uitk-lab";

export default {
  title: "Lab/Typography",
  component: Text,
} as ComponentMeta<typeof Text>;

const excludeProps = [
  "children",
  "elementType",
  "maxRows",
  "showTooltip",
  "tooltipProps",
  "truncate",
  "style",
  "onOverflowChange",
];

const ResponsiveTextComponent: ComponentStory<typeof Text> = () => {
  const box = {
    border: "1px solid #ccc",
    padding: 10,
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        // width: "70vw",
      }}
    >
      <div style={box}>
        <strong>Default</strong>
        <br />
        elementType - div
        <br />
        truncate - false
        <br />
        <strong>Wraps</strong>
      </div>
      <div style={{ ...box }}>
        <Div>
          The king's son said he was to send her up to him, but the mother
          answered, oh, no, she is much too dirty, she cannot show herself. But
          he absolutely insisted on it, and Cinderella had to be called.
        </Div>
      </div>

      <div style={box}>
        elementType - div
        <br />
        truncate - true
        <br />
        parent height - 40px
        <br />
        <strong>shows Tooltip</strong>
      </div>
      <div style={{ ...box, height: 40 }}>
        <Div truncate={true}>
          And when she rose up and the king's son looked at her face he
          recognized the beautiful maiden who had danced with him and cried,
          that is the true bride.
        </Div>
      </div>

      <div style={box}>
        elementType - span
        <br />
        truncate - true
        <br />
        maxRows - 2
        <br />
        <strong>shows Tooltip</strong>
      </div>
      <div style={box}>
        <Div truncate={true} maxRows={2}>
          When the wedding with the king's son was to be celebrated, the two
          false sisters came and wanted to get into favor with cinderella and
          share her good fortune.
        </Div>
      </div>
    </div>
  );
};
export const ResponsiveExample = ResponsiveTextComponent.bind({});
ResponsiveExample.parameters = {
  controls: {
    exclude: excludeProps,
  },
};
