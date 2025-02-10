import { Slider } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Lab/Slider/QA",
  component: Slider,
} as Meta<typeof Slider>;

export const ExamplesGrid: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer cols={1} itemPadding={4} {...props}>
      <Slider defaultValue={0.5} max={10} min={-5} step={0.5} />
      <Slider
        defaultValue={0.5}
        max={10}
        min={-5}
        step={0.5}
        labelPosition="bottom"
      />
      <Slider
        defaultValue={0.5}
        max={10}
        min={-5}
        step={0.5}
        markers={[
          { value: 1, label: "1" },
          { value: 5, label: "5" },
        ]}
      />
    </QAContainer>
  );
};

ExamplesGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
    modes: {
      theme: {
        themeNext: "disable",
      },
      themeNext: {
        themeNext: "enable",
        corner: "rounded",
        accent: "teal",
        // Ignore headingFont given font is not loaded
      },
    },
  },
};
