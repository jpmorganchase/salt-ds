import { Meta, StoryFn } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";
import { ComboBoxNext, FormField, Option, OptionGroup } from "@salt-ds/lab";

import { usStateExampleData } from "../assets/exampleData";

export default {
  title: "Lab/Combo Box Next/Combo Box Next QA",
  component: ComboBoxNext,
} as Meta<typeof ComboBoxNext>;

const groupedOptions = usStateExampleData.slice(0, 5).reduce((acc, option) => {
  const groupName = option[0];
  if (!acc[groupName]) {
    acc[groupName] = [];
  }
  acc[groupName].push(option);
  return acc;
}, {} as Record<string, typeof usStateExampleData>);

export const OpenExamples: StoryFn<QAContainerProps> = () => (
  <QAContainer cols={4} itemPadding={12} transposeDensity>
    <FormField helperText="This is some help text" label="Default example">
      <ComboBoxNext placeholder="State" open>
        {Object.entries(groupedOptions).map(([firstLetter, options]) => (
          <OptionGroup label={firstLetter} key={firstLetter}>
            {options.map((state) => (
              <Option value={state} key={state}>
                {state}
              </Option>
            ))}
          </OptionGroup>
        ))}
      </ComboBoxNext>
    </FormField>
  </QAContainer>
);

OpenExamples.parameters = {
  chromatic: { disableSnapshot: false },
};

export const ClosedExamples: StoryFn<QAContainerProps> = () => (
  <QAContainer cols={4} itemPadding={12} transposeDensity vertical width={1200}>
    <FormField helperText="This is some help text" label="Read-only example">
      <ComboBoxNext readOnly>
        {usStateExampleData.map((state) => (
          <Option value={state} key={state}>
            {state}
          </Option>
        ))}
      </ComboBoxNext>
    </FormField>
    <FormField helperText="This is some help text" label="Disabled example">
      <ComboBoxNext disabled>
        {usStateExampleData.map((state) => (
          <Option value={state} key={state}>
            {state}
          </Option>
        ))}
      </ComboBoxNext>
    </FormField>
  </QAContainer>
);

ClosedExamples.parameters = {
  chromatic: { disableSnapshot: false },
};
