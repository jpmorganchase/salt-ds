import { NumberInput } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Lab/Number Input/Number Input QA",
  component: NumberInput,
} as Meta<typeof NumberInput>;

export const ExamplesGrid: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer itemPadding={4} {...props}>
      <NumberInput
        decimalPlaces={2}
        defaultValue={0.5}
        max={10}
        min={-5}
        step={0.5}
      />
      <NumberInput
        decimalPlaces={3}
        defaultValue={-5}
        max={10}
        min={-5}
        step={1}
        textAlign={"center"}
      />
      <NumberInput
        decimalPlaces={1}
        defaultValue={5}
        max={5}
        min={0}
        step={1}
        textAlign={"right"}
      />
      <NumberInput
        decimalPlaces={2}
        defaultValue="readOnly"
        max={10}
        min={-5}
        readOnly
        step={0.5}
      />
      <NumberInput
        decimalPlaces={2}
        defaultValue="disabled"
        disabled
        max={10}
        min={-5}
        step={0.5}
      />
      <NumberInput value="bordered" bordered />
      <NumberInput validationStatus="success" value="success" />
      <NumberInput validationStatus="error" value="error" />
      <NumberInput validationStatus="warning" value="warning" />
      <NumberInput value="success" bordered validationStatus="success" />
      <NumberInput value="error" bordered validationStatus="error" />
      <NumberInput value="warning" bordered validationStatus="warning" />
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
