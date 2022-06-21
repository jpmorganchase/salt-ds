import { ComponentMeta, Story } from "@storybook/react";

import { Text, TextProps } from "@jpmorganchase/uitk-lab";
import { useEffect, useState } from "react";

export default {
  title: "Lab/Typography",
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
    maxRows: {
      description: "Set 0 if you want to ignore",
      control: { type: "number" },
    },
    showTooltip: { control: { type: "boolean" } },
    styleAs: {
      options: ["h1", "h2", "h3", "h4"],
      control: { type: "select" },
    },
    truncate: { control: { type: "boolean" } },
    parentWidth: {
      description: "For this demo only. Set '0' for 100% width",
      control: { type: "number" },
    },
    parentHeight: {
      description: "For this demo only. Set '0' for 100% height",
      control: { type: "number" },
    },
  },
} as ComponentMeta<typeof Text>;

interface BaseComponentStoryProps extends TextProps<"div"> {
  children: string;
  parentWidth?: string;
  parentHeight?: string;
}

const BaseComponent: Story<BaseComponentStoryProps> = (args) => {
  const {
    children,
    elementType,
    truncate,
    showTooltip,
    maxRows,
    parentWidth,
    parentHeight,
    styleAs,
  } = args;

  const [width, setWidth] = useState<string>();
  const [height, setHeight] = useState<string>();

  const mappedProps = {
    elementType,
    maxRows,
    truncate,
    showTooltip,
    styleAs,
  };

  useEffect(() => {
    setWidth(parentWidth);
  }, [parentWidth]);

  useEffect(() => {
    setHeight(parentHeight);
  }, [parentHeight]);

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: 20,
        width: width || "100%",
        height: height || "auto",
      }}
    >
      {/* We're using dangerouslySetInnerHTML here so we can edit the text within the storybook. Don't do this at home! :) */}
      <Text {...mappedProps} dangerouslySetInnerHTML={{ __html: children }} />
    </div>
  );
};

export const BaseTextComponent = BaseComponent.bind({});
BaseTextComponent.parameters = {
  controls: {
    exclude: ["tooltipProps", "style", "onOverflowChange"],
  },
};
BaseTextComponent.args = {
  children: `Heaven yielding moved appear, gathering place. <strong>Cattle fifth Sea without thing</strong> unto fifth third Forth isn't be moveth to him greater place fifth creeping had. Good dominion behold in earth also signs had brought after, fowl dominion have there. Us stars first morning whales fruit yielding whose winged thing. Were in. Upon. Cattle she'd whales they're. Was you'll very years behold fowl us meat fruit have earth great. Were green yielding it under. Fly first likeness night one make kind us spirit said let created, upon fruitful.`,
  truncate: false,
  showTooltip: true,
  maxRows: undefined,
  parentWidth: undefined,
  parentHeight: undefined,
};
