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
import { Suspense, SyntheticEvent, useState } from "react";

export default {
  title: "Lab/Combo Box Next",
  component: ComboBoxNext,
} as ComponentMeta<typeof ComboBoxNext>;

interface CustomItemProps {
  value: LargeCity;
  matchPattern?: RegExp | string;
  onMouseDown?: (event: SyntheticEvent<HTMLLIElement>) => void;
}
const CustomListItem = ({
  value,
  matchPattern,
  onMouseDown,
  ...rest
}: CustomItemProps) => {
  return (
    <ListItemNext value={value.name} onMouseDown={onMouseDown} {...rest}>
      <Suspense fallback={null}>
        {/*@ts-ignore */}
        <LazyCountrySymbol code={value.countryCode} />
      </Suspense>
      <Highlighter matchPattern={matchPattern} text={value.name} />
    </ListItemNext>
  );
};

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
    <ComboBoxNext
      style={{ width: "266px" }}
      onInputChange={handleChange}
      onSelect={handleSelect}
      {...args}
    />
  );
};
export const Controlled: Story<ComboBoxNextProps<any>> = (args) => {
  const [inputValue, setInputValue] = useState("");

  const handleChange = (event: SyntheticEvent, data: { value: string }) => {
    setInputValue(data.value.toUpperCase());
  };

  const handleSelect = (
    event: SyntheticEvent<HTMLInputElement>,
    data: { value?: string }
  ) => {
    const newValue = data.value || "";
    setInputValue(newValue.toUpperCase());
  };

  return (
    <ComboBoxNext
      style={{ width: "200px" }}
      inputValue={inputValue}
      onInputChange={handleChange}
      onSelect={handleSelect}
      {...args}
    />
  );
};

export const Default = ComboBoxTemplate.bind({});
Default.args = {
  source: shortColorData,
};

export const CustomRenderer = ComboBoxTemplate.bind({});
CustomRenderer.args = {
  source: largestCities,
  ListItem: CustomListItem,
  itemFilter: customItemFilter,
};

Controlled.args = {
  source: shortColorData,
};

export const Variant = ComboBoxTemplate.bind({});
Variant.args = {
  source: shortColorData,
  variant: "secondary",
};

export const ReadOnly = ComboBoxTemplate.bind({});
ReadOnly.args = {
  source: shortColorData,
  readOnly: true,
};

export const Placeholder = ComboBoxTemplate.bind({});
Placeholder.args = {
  source: shortColorData,
  placeholder: "Select a color",
};
export const Empty = ComboBoxTemplate.bind({});
Empty.args = {
  source: undefined,
};

export const Disabled = ComboBoxTemplate.bind({});
Disabled.args = {
  source: shortColorData,
  disabled: true,
};
