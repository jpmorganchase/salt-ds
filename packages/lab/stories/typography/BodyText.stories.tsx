import { ComponentMeta, ComponentStory } from "@storybook/react";

import { Text } from "@brandname/lab";

export default {
  title: "Lab/Typography",
  component: Text,
} as ComponentMeta<typeof Text>;

const TextComponent: ComponentStory<typeof Text> = (props) => {
  return (
    <>
      <Text>
        Body text - div - His seasons Shall without form fourth seed so.
      </Text>
      <br />
      <br />
      <Text>
        Body text
        <strong> emphasis high</strong>
      </Text>
      <br />
      <Text>
        Body text
        <small> emphasis low</small>
      </Text>
    </>
  );
};

export const BodyText = TextComponent.bind({});
BodyText.parameters = {
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
