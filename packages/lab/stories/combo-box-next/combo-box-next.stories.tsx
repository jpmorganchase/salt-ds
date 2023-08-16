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
import { Suspense, SyntheticEvent } from "react";
import { ComboBoxItemProps } from "../../src/combo-box-next/utils";

export default {
  title: "Lab/Combo Box Next",
  component: ComboBoxNext,
} as ComponentMeta<typeof ComboBoxNext>;

const CustomListItem = ({
  value,
  matchPattern,
  onMouseDown,
  ...rest
}: ComboBoxItemProps<LargeCity>) => {
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
      onChange={handleChange}
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
