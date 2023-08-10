import {
  ComboBoxNext,
  ComboBoxNextProps,
  Highlighter,
  ListItemNext,
} from "@salt-ds/lab";
import { ComponentMeta, Story } from "@storybook/react";
import {
  LargeCity,
  largestCities,
  shortColorData,
} from "../assets/exampleData";
import { LazyCountrySymbol } from "@salt-ds/countries";
import { MouseEvent, Suspense, SyntheticEvent } from "react";
import { FlowLayout } from "@salt-ds/core";

export default {
  title: "Lab/Combo Box Next",
  component: ComboBoxNext,
} as ComponentMeta<typeof ComboBoxNext>;

const customItemRenderer = (
  key: number,
  value: LargeCity,
  matchPattern?: RegExp | string,
  onMouseDown?: (event: MouseEvent<HTMLLIElement>) => void
) => (
  <ListItemNext value={value.name} key={key} onMouseDown={onMouseDown}>
    <Suspense fallback={null}>
      {/*@ts-ignore */}
      <LazyCountrySymbol code={value.countryCode} />
    </Suspense>
    <Highlighter matchPattern={matchPattern} text={value.name} />
  </ListItemNext>
);

const customMatchPattern = (
  input: { name: string; countryCode: string },
  filterValue: string
) => {
  return (
    input.name.toLowerCase().includes(filterValue.toLowerCase()) ||
    filterValue === input.countryCode
  );
};

const customItemFilter = (source: LargeCity[], filterValue?: string) =>
  source.filter((item) =>
    !filterValue ? item : customMatchPattern(item, filterValue)
  );

const ComboBoxTemplate: Story<ComboBoxNextProps<any>> = (args) => {
  const handleChange = (event: SyntheticEvent, data: { value: string }) => {
    console.log("input value changed", data);
  };

  const handleSelect = (event: SyntheticEvent<HTMLInputElement>) => {
    console.log("selected item", event.currentTarget.value);
  };
  return (
    <FlowLayout style={{ width: "266px" }}>
      <ComboBoxNext onChange={handleChange} onSelect={handleSelect} {...args} />
    </FlowLayout>
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

export const Disabled = ComboBoxTemplate.bind({});
Disabled.args = {
  source: shortColorData,
  disabled: true,
};
