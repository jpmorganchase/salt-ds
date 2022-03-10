import { ComponentMeta, ComponentStory } from "@storybook/react";

import { Text, HelpText as HelpTextComp } from "@brandname/lab";

export default {
  title: "Lab/Typography",
  component: Text,
} as ComponentMeta<typeof Text>;

const TextComponent: ComponentStory<typeof Text> = (props) => {
  return (
    <>
      <HelpTextComp>
        Help Text - div - His seasons Shall without form fourth seed so.
      </HelpTextComp>
      <br />
      <br />
      <HelpTextComp>
        Help Text
        <strong> emphasis high</strong>
      </HelpTextComp>
      <br />
      <HelpTextComp>
        Help Text
        <small> emphasis low</small>
      </HelpTextComp>
    </>
  );
};

export const HelpText = TextComponent.bind({});
HelpText.parameters = {
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
