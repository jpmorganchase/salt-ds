import { Meta, StoryFn } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";
import { FormField, FormFieldLabel, FormFieldHelperText, ComboBoxNext, Option, OptionGroup } from "@salt-ds/core";

import { usStateExampleData } from "../assets/exampleData";

export default {
  title: "Core/Combo Box Next/Combo Box Next QA",
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

const first5States = usStateExampleData.slice(0, 5);

export const OpenExamples: StoryFn<QAContainerProps> = () => (
  <QAContainer cols={4} itemPadding={12} transposeDensity>
    <FormField>
      <FormFieldLabel>Default example</FormFieldLabel>
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
      <FormFieldHelperText>This is some help text</FormFieldHelperText>
    </FormField>
  </QAContainer>
);

OpenExamples.parameters = {
  chromatic: { disableSnapshot: false },
};

export const OpenMultiselectExamples: StoryFn<QAContainerProps> = () => (
  <QAContainer cols={4} itemPadding={12} transposeDensity>
    <FormField>
      <FormFieldLabel>Multi-select example</FormFieldLabel>
      <ComboBoxNext multiselect defaultSelected={first5States.slice(0, 3)} open>
        {first5States.map((state) => (
          <Option value={state} key={state}>
            {state}
          </Option>
        ))}
      </ComboBoxNext>
      <FormFieldHelperText>This is some help text</FormFieldHelperText>
    </FormField>
  </QAContainer>
);

OpenMultiselectExamples.parameters = {
  chromatic: { disableSnapshot: false },
};

export const ClosedExamples: StoryFn<QAContainerProps> = () => (
  <QAContainer cols={4} itemPadding={12} transposeDensity vertical width={1200}>
    <FormField>
      <FormFieldLabel>Default example</FormFieldLabel>
      <ComboBoxNext>
        {first5States.map((state) => (
          <Option value={state} key={state}>
            {state}
          </Option>
        ))}
      </ComboBoxNext>
      <FormFieldHelperText>This is some help text</FormFieldHelperText>
    </FormField>
    <FormField>
      <FormFieldLabel>Read-only example</FormFieldLabel>
      <ComboBoxNext readOnly>
        {first5States.map((state) => (
          <Option value={state} key={state}>
            {state}
          </Option>
        ))}
      </ComboBoxNext>
      <FormFieldHelperText>This is some help text</FormFieldHelperText>
    </FormField>
    <FormField>
      <FormFieldLabel>Disabled example</FormFieldLabel>
      <ComboBoxNext disabled>
        {first5States.map((state) => (
          <Option value={state} key={state}>
            {state}
          </Option>
        ))}
      </ComboBoxNext>
      <FormFieldHelperText>This is some help text</FormFieldHelperText>
    </FormField>
    <FormField>
      <FormFieldLabel>Disabled multi-select example</FormFieldLabel>
      <ComboBoxNext disabled multiselect defaultSelected={first5States}>
        {first5States.map((state) => (
          <Option value={state} key={state}>
            {state}
          </Option>
        ))}
      </ComboBoxNext>
      <FormFieldHelperText>This is some help text</FormFieldHelperText>
    </FormField>
    <FormField>
      <FormFieldLabel>Read-only multi-select example</FormFieldLabel>
      <ComboBoxNext readOnly multiselect defaultSelected={first5States}>
        {first5States.map((state) => (
          <Option value={state} key={state}>
            {state}
          </Option>
        ))}
      </ComboBoxNext>
      <FormFieldHelperText>This is some help text</FormFieldHelperText>
    </FormField>
    <FormField>
      <FormFieldLabel>Read-only truncated multi-select example</FormFieldLabel>
      <ComboBoxNext
        readOnly
        multiselect
        defaultSelected={first5States}
        truncate
      >
        {first5States.map((state) => (
          <Option value={state} key={state}>
            {state}
          </Option>
        ))}
      </ComboBoxNext>
      <FormFieldHelperText>This is some help text</FormFieldHelperText>
    </FormField>
    <FormField>
      <FormFieldLabel>Multi-select example</FormFieldLabel>
      <ComboBoxNext multiselect defaultSelected={first5States}>
        {first5States.map((state) => (
          <Option value={state} key={state}>
            {state}
          </Option>
        ))}
      </ComboBoxNext>
      <FormFieldHelperText>This is some help text</FormFieldHelperText>
    </FormField>
    <FormField>
      <FormFieldLabel>Truncated multi-select example</FormFieldLabel>
      <ComboBoxNext multiselect defaultSelected={first5States} truncate>
        {first5States.map((state) => (
          <Option value={state} key={state}>
            {state}
          </Option>
        ))}
      </ComboBoxNext>
      <FormFieldHelperText>This is some help text</FormFieldHelperText>
    </FormField>
  </QAContainer>
);

ClosedExamples.parameters = {
  chromatic: { disableSnapshot: false },
};
