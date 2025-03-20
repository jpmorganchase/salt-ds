import { RangeSlider } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Lab/RangeSlider/RangeSlider QA",
  component: RangeSlider,
} as Meta<typeof RangeSlider>;

export const ExamplesGrid: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer cols={1} itemPadding={4} {...props}>
      <RangeSlider
        max={5}
        min={-5}
        step={1}
        marks={[
          { value: -5, label: "-5" },
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
        minLabel="Very low"
        maxLabel="Very high"
        showTicks
      />
      <RangeSlider
        max={5}
        step={1}
        marks={[
          { value: 0, label: "0" },
          { value: 3, label: "3" },
          { value: 5, label: "5" },
        ]}
        restrictToMarks
      />
      <RangeSlider
        max={5}
        step={1}
        marks={[
          { value: 0, label: "Very Low" },
          { value: 5, label: "Very High" },
        ]}
        constrainLabelPosition
      />
      <RangeSlider
        min={0}
        max={100}
        format={(value) => `${value}%`}
        step={1}
        minLabel="0%"
        maxLabel="100%"
      />
      <RangeSlider
        max={10}
        min={-5}
        step={1}
        minLabel="0"
        maxLabel="10"
        disabled
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
