import { FormField, FormFieldLabel } from "@salt-ds/core";
import { RangeSlider } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Lab/RangeSlider/RangeSlider QA",
  component: RangeSlider,
} as Meta<typeof RangeSlider>;

export const ExamplesGrid: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer width={1100} cols={1} itemPadding={10} {...props}>
      <FormField>
        <FormFieldLabel>With inline labels</FormFieldLabel>
        <RangeSlider minLabel="Min Label" maxLabel="Max Label" />
      </FormField>
      <FormField>
        <FormFieldLabel>With marks</FormFieldLabel>
        <RangeSlider
          marks={[
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
          ]}
        />
      </FormField>
      <FormField>
        <FormFieldLabel>With marks and ticks</FormFieldLabel>
        <RangeSlider
          marks={[
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
          ]}
          showTicks
        />
      </FormField>
      <FormField>
        <FormFieldLabel>With inline labels, marks and ticks</FormFieldLabel>
        <RangeSlider
          defaultValue={[3, 6]}
          marks={[
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
          ]}
          minLabel="Min label"
          maxLabel="Max label"
          showTicks
        />
      </FormField>
      <FormField>
        <FormFieldLabel>Restricted to marks</FormFieldLabel>
        <RangeSlider
          marks={[
            { value: 0, label: "0" },
            { value: 5, label: "5" },
            { value: 6, label: "6" },
            { value: 7, label: "7" },
            { value: 10, label: "10" },
          ]}
          showTicks
          restrictToMarks
        />
      </FormField>
      <FormField>
        <FormFieldLabel>
          With constrained label position and ticks
        </FormFieldLabel>
        <RangeSlider
          marks={[
            { value: 0, label: "Min label" },
            { value: 10, label: "Max label" },
          ]}
          constrainLabelPosition
          showTicks
        />
      </FormField>
      <FormField>
        <FormFieldLabel>With formatting</FormFieldLabel>
        <RangeSlider
          marks={[
            { value: 0, label: "0 EUR" },
            { value: 10, label: "10 EUR" },
          ]}
          constrainLabelPosition
          showTicks
          format={(value: number) => `${value} EUR`}
        />
      </FormField>
      <FormField>
        <FormFieldLabel>With negative bounds</FormFieldLabel>
        <RangeSlider
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
      <FormField>
        <FormFieldLabel>Disabled</FormFieldLabel>
        <RangeSlider disabled />
      </FormField>
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
