import { Meta, StoryFn } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";
import {
  Dropdown,
  FormField,
  FormFieldLabel,
  FormFieldHelperText,
  Option,
  OptionGroup,
} from "@salt-ds/core";

import { usStateExampleData } from "../assets/exampleData";

export default {
  title: "Core/Dropdown/Dropdown QA",
  component: Dropdown,
} as Meta<typeof Dropdown>;

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
    <FormField>
      <FormFieldLabel>Default example</FormFieldLabel>
      <Dropdown placeholder="State" open>
        {Object.entries(groupedOptions).map(([firstLetter, options]) => (
          <OptionGroup label={firstLetter} key={firstLetter}>
            {options.map((state) => (
              <Option value={state} key={state}>
                {state}
              </Option>
            ))}
          </OptionGroup>
        ))}
      </Dropdown>
      <FormFieldHelperText>This is some help text</FormFieldHelperText>
    </FormField>
  </QAContainer>
);

OpenExamples.parameters = {
  chromatic: { disableSnapshot: false },
};

export const ClosedExamples: StoryFn<QAContainerProps> = () => (
  <QAContainer cols={4} itemPadding={12} transposeDensity vertical width={1200}>
    <FormField>
      <FormFieldLabel>Read-only example</FormFieldLabel>
      <Dropdown readOnly>
        {usStateExampleData.map((state) => (
          <Option value={state} key={state}>
            {state}
          </Option>
        ))}
      </Dropdown>
      <FormFieldHelperText>This is some help text</FormFieldHelperText>
    </FormField>
    <FormField>
      <FormFieldLabel>Disabled example</FormFieldLabel>
      <Dropdown disabled>
        {usStateExampleData.map((state) => (
          <Option value={state} key={state}>
            {state}
          </Option>
        ))}
      </Dropdown>
      <FormFieldHelperText>This is some help text</FormFieldHelperText>
    </FormField>
  </QAContainer>
);

ClosedExamples.parameters = {
  chromatic: { disableSnapshot: false },
};
