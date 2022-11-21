import { ComponentMeta, Story } from "@storybook/react";

import { Text, TextProps } from "@jpmorganchase/uitk-lab";
import { useEffect, useState } from "react";

export default {
  title: "Lab/Text",
  component: Text,
  argTypes: {
    children: {
      description:
        "Amend text. We're using dangerouslySetInnerHTML here so we can edit the text within the storybook. Don't do this at home!",
      control: { type: "text" },
    },
    elementType: {
      options: ["h1", "h2", "h3", "h4", "p", "div", "span", "label"],
      control: {
        type: "select",
      },
    },
    styleAs: {
      options: ["h1", "h2", "h3", "h4"],
      control: { type: "select" },
    },
  },
} as ComponentMeta<typeof Text>;

const BaseComponent: Story<TextProps> = (args) => {
  const { children, elementType, styleAs } = args;

  const mappedProps = {
    elementType,
    styleAs,
  };

  return (
    <div>
      {/* We're using dangerouslySetInnerHTML here so we can edit the text within the storybook. Don't do this at home! :) */}
      <Text
        elementType={elementType}
        styleAs={styleAs}
        dangerouslySetInnerHTML={{ __html: children }}
      />
    </div>
  );
};

export const BaseTextComponent = BaseComponent.bind({});
BaseTextComponent.args = {
  children: `Heaven yielding moved appear, gathering place. <strong>Cattle fifth Sea without thing</strong> unto fifth third Forth isn't be moveth to him greater place fifth creeping had. Good dominion behold in earth also signs had brought after, fowl dominion have there. Us stars first morning whales fruit yielding whose winged thing. Were in. Upon. Cattle she'd whales they're. Was you'll very years behold fowl us meat fruit have earth great. Were green yielding it under. Fly first likeness night one make kind us spirit said let created, upon fruitful.`,
};
