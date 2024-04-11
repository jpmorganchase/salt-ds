import { Meta, StoryFn } from "@storybook/react";
import { Text } from "@salt-ds/core";

export default {
  title: "Core/Text",
  component: Text,
  argTypes: {
    children: {
      description:
        "Amend text. We're using dangerouslySetInnerHTML here so we can edit the text within the storybook. Don't do this at home!",
      control: { type: "text" },
    },
    as: {
      options: [
        "h1",
        "h2",
        "h3",
        "h4",
        "p",
        "div",
        "span",
        "label",
        "code",
        "blockquote",
        "i",
      ],
      control: {
        type: "select",
      },
    },
    styleAs: {
      options: [
        "h1",
        "h2",
        "h3",
        "h4",
        "label",
        "display1",
        "display2",
        "display3",
        "notation",
        "action",
        "code",
      ],
      control: { type: "select" },
    },
    variant: {
      options: ["primary", "secondary"],
      control: { type: "select" },
    },
    maxRows: { control: { type: "number" } },
  },
} as Meta<typeof Text>;

const BaseComponent: StoryFn<typeof Text> = (args) => {
  const { children, ...rest } = args;

  return (
    <div>
      {/* We're using dangerouslySetInnerHTML here so we can edit the text within the storybook. Don't do this at home! :) */}
      {/* @ts-ignore */}
      <Text dangerouslySetInnerHTML={{ __html: children }} {...rest} />
    </div>
  );
};

export const TextPlayground = BaseComponent.bind({});
TextPlayground.args = {
  children: `Heaven yielding moved appear, gathering place. <strong>Cattle fifth Sea without thing</strong> unto fifth third Forth isn't be moveth to him greater place fifth creeping had. Good dominion behold in earth also signs had brought after, fowl dominion have there. Us stars first morning whales fruit yielding whose winged thing. Were in. Upon. Cattle she'd whales they're. Was you'll very years behold fowl us meat fruit have earth great. Were green yielding it under. Fly first likeness night one make kind us spirit said let created, upon fruitful.`,
};
