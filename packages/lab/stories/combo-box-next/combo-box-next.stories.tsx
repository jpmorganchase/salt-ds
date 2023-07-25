import {
  ComboBoxNext,
  ComboBoxNextProps,
  Highlighter,
  ListItemNext,
} from "@salt-ds/lab";
import { ComponentMeta, Story } from "@storybook/react";
import { largestCities, shortColorData } from "../assets/exampleData";
import { LazyCountrySymbol } from "@salt-ds/countries";
import { Suspense, useState } from "react";
import { Button } from "@salt-ds/core";

export default {
  title: "Lab/Combo Box Next",
  component: ComboBoxNext,
} as ComponentMeta<typeof ComboBoxNext>;

const customItemRenderer = (
  key: number,
  value: string,
  matchPattern?: RegExp | string
) => (
  <ListItemNext value={value.name} key={key}>
    <Suspense fallback={null}>
      <LazyCountrySymbol code={value.countryCode} />
    </Suspense>
    <Highlighter matchPattern={matchPattern} text={value.name} />
  </ListItemNext>
);

const custommatchPattern = (input: string, filterValue: string) => {
  return (
    input.name.toLowerCase().includes(filterValue.toLowerCase()) ||
    filterValue === input.countryCode
  );
};

const customItemFilter = (source: any[], filterValue: string) =>
  source.filter((item) =>
    !filterValue ? item : custommatchPattern(item, filterValue)
  );

const ComboBoxTemplate: Story<ComboBoxNextProps> = (args) => {
  const handleChange = (event) => {
    console.log("input value changed", event.target.value);
  };

  const handleSelect = (event) => {
    console.log("selected item", event.target.value);
  };
  return (
    <ComboBoxNext onChange={handleChange} onSelect={handleSelect} {...args} />
  );
};

export const Default = ComboBoxTemplate.bind({});
Default.args = {
  source: shortColorData,
};

export const CustomRenderer = ComboBoxTemplate.bind({});
CustomRenderer.args = {
  source: largestCities,
  itemRenderer: customItemRenderer,
  itemFilter: customItemFilter,
  matchPattern: custommatchPattern,
};

export const Empty = ComboBoxTemplate.bind({});
Empty.args = {
  source: undefined,
};

export const Secondary = ComboBoxTemplate.bind({});
Secondary.args = {
  source: shortColorData,
  variant: "secondary",
};

export const ReadOnly = ComboBoxTemplate.bind({});
ReadOnly.args = {
  source: shortColorData,
  readOnly: true,
};

export const Disabled = ComboBoxTemplate.bind({});
Disabled.args = {
  source: shortColorData,
  disabled: true,
};
