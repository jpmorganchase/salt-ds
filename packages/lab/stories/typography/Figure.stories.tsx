import { ComponentMeta, ComponentStory } from "@storybook/react";

import { Text, Figure1, Figure2, Figure3 } from "@brandname/lab";

export default {
  title: "Lab/Typography",
  component: Text,
} as ComponentMeta<typeof Text>;

const TextComponent: ComponentStory<typeof Text> = (props) => {
  return (
    <>
      <Figure1>Figure 1</Figure1>
      <br />
      <Figure2>Figure 2</Figure2>
      <br />
      <Figure3>Figure 3</Figure3>
    </>
  );
};

export const Figure = TextComponent.bind({});
Figure.parameters = {
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
