import { FormField, FormFieldLabel, Slider } from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Core/Slider/Slider QA",
  component: Slider,
} as Meta<typeof Slider>;

const marks = [
  { value: 0, label: "0" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
  { value: 6, label: "6" },
  { value: 7, label: "7" },
  { value: 8, label: "8" },
  { value: 9, label: "9" },
  { value: 10, label: "10" },
];

export const ExamplesGrid: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer width={1300} cols={1} itemPadding={10} {...props}>
      <FormField labelPlacement="left">
        <FormFieldLabel>With inline labels</FormFieldLabel>
        <Slider minLabel="Min Label" maxLabel="Max Label" />
      </FormField>
      <FormField labelPlacement="left">
        <FormFieldLabel>With marks</FormFieldLabel>
        <Slider marks={marks} min={0} max={10} />
      </FormField>
      <FormField labelPlacement="left">
        <FormFieldLabel>With marks and ticks</FormFieldLabel>
        <Slider marks={marks} showTicks min={0} max={10} />
      </FormField>
      <FormField labelPlacement="left">
        <FormFieldLabel>With inline labels, marks and ticks</FormFieldLabel>
        <Slider
          marks={marks}
          minLabel="Min label"
          maxLabel="Max label"
          showTicks
          min={0}
          max={10}
        />
      </FormField>
      <FormField labelPlacement="left">
        <FormFieldLabel>Restricted to marks</FormFieldLabel>
        <Slider
          marks={[
            { value: 0, label: "0" },
            { value: 5, label: "5" },
            { value: 6, label: "6" },
            { value: 7, label: "7" },
            { value: 10, label: "10" },
          ]}
          showTicks
          restrictToMarks
          min={0}
          max={10}
        />
      </FormField>
      <FormField labelPlacement="left">
        <FormFieldLabel>
          With constrained label position and ticks
        </FormFieldLabel>
        <Slider
          marks={[
            { value: 0, label: "Min label" },
            { value: 10, label: "Max label" },
          ]}
          constrainLabelPosition
          showTicks
          min={0}
          max={10}
        />
      </FormField>
      <FormField labelPlacement="left">
        <FormFieldLabel>With formatting</FormFieldLabel>
        <Slider
          marks={[
            { value: 0, label: "0 EUR" },
            { value: 10, label: "10 EUR" },
          ]}
          constrainLabelPosition
          showTicks
          format={(value: number) => `${value} EUR`}
          min={0}
          max={10}
        />
      </FormField>
      <FormField labelPlacement="left">
        <FormFieldLabel>With negative bounds</FormFieldLabel>
        <Slider
          marks={[
            { value: -5, label: "-5" },
            { value: 5, label: "5" },
          ]}
          constrainLabelPosition
          showTicks
          min={-5}
          max={5}
        />
      </FormField>
      <FormField labelPlacement="left">
        <FormFieldLabel>Disabled</FormFieldLabel>
        <Slider disabled />
      </FormField>
      <FormField>
        <FormFieldLabel>With top form field label</FormFieldLabel>
        <Slider minLabel="Min Label" maxLabel="Max Label" />
      </FormField>
      <FormField>
        <FormFieldLabel>With top form field label and marks</FormFieldLabel>
        <Slider
          minLabel="Min Label"
          maxLabel="Max Label"
          marks={marks}
          showTicks
          min={0}
          max={10}
        />
      </FormField>
    </QAContainer>
  );
};

ExamplesGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
