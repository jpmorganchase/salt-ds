import { Slider } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Lab/Slider/Slider QA",
  component: Slider,
} as Meta<typeof Slider>;

export const ExamplesGrid: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer cols={1} itemPadding={4} {...props}>
      <Slider defaultValue={-2} max={10} min={-5} step={1} />
      <Slider
        defaultValue={-2}
        max={10}
        min={-5}
        step={1}
        labelPosition="bottom"
      />
      <Slider
        defaultValue={-2}
        max={5}
        min={-5}
        step={1}
        marks={[
          { value: -4, label: "-4" },
          { value: -3, label: "-3" },
          { value: -2, label: "-2" },
          { value: -1, label: "-1" },
          { value: 0, label: "0" },
          { value: 1, label: "1" },
          { value: 2, label: "2" },
          { value: 3, label: "3" },
          { value: 4, label: "4" },
          { value: 5, label: "5" },
        ]}
      />
      <Slider
        defaultValue={-2}
        max={10}
        min={-5}
        step={1}
        labelPosition="bottom"
        disabled
      />
      <Slider defaultValue={-2} max={10} min={-5} step={1} disabled />
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
