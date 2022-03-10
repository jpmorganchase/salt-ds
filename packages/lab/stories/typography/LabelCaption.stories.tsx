import { ComponentMeta, ComponentStory } from "@storybook/react";

import { Text, LabelCaption as LabelCaptionText } from "@brandname/lab";

export default {
  title: "Lab/Typography",
  component: Text,
} as ComponentMeta<typeof Text>;

const TextComponent: ComponentStory<typeof Text> = (props) => {
  return (
    <>
      <LabelCaptionText>
        LabelCaption text - label - His seasons Shall without form fourth seed
        so.
      </LabelCaptionText>
      <br />
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

export const LabelCaption = TextComponent.bind({});
LabelCaption.parameters = {
  controls: {
    exclude: [
      "children",
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
