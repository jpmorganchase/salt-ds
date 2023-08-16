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
import { ComboBoxItemProps } from "../../src/combo-box-next/utils";
import { Button, FlexItem, FlexLayout } from "@salt-ds/core";

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

const ComboBoxTemplate: Story<ComboBoxNextProps<any>> = ({
  onChange,
  ...rest
}) => {
  const handleChange = (event: SyntheticEvent, data: { value: string }) => {
    console.log("input value changed", data.value);
    onChange?.(event, data);
  };

  const handleSelect = (event: SyntheticEvent, data: { value: string }) => {
    console.log("selected item", data.value);
  };

  return (
    <ComboBoxNext
      style={{ width: "266px" }}
      onChange={handleChange}
      onSelect={handleSelect}
      {...rest}
    />
  );
};

export const Controlled: Story<ComboBoxNextProps<any>> = (args) => {
  const [index, setIndex] = useState(0);

  const handleSelect = (event: SyntheticEvent, data: { value: string }) => {
    const newValue = data.value || "";
    console.log("new selection", newValue);
  };

  return (
    <FlexLayout direction={"column"}>
      <FlexItem>
        <Button
          onClick={() => {
            setIndex(index - 1);
          }}
          disabled={index <= 0}
        >
          {" "}
          Previous
        </Button>
        <Button
          onClick={() => {
            setIndex(index + 1);
          }}
          disabled={index >= shortColorData.length - 1}
        >
          {" "}
          Next
        </Button>
      </FlexItem>

      <ComboBoxNext
        style={{ width: "200px" }}
        selected={shortColorData[index]}
        onSelect={handleSelect}
        {...args}
      />
    </FlexLayout>
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

export const Empty = ComboBoxTemplate.bind({});
Empty.args = {
  source: undefined,
};

export const Secondary = ComboBoxTemplate.bind({});
Secondary.args = {
  source: shortColorData,
  variant: "secondary",
};

export const Placeholder = ComboBoxTemplate.bind({});
Placeholder.args = {
  source: shortColorData,
  placeholder: "Select a color",
};

export const Disabled = ComboBoxTemplate.bind({});
Disabled.args = {
  source: shortColorData,
  disabled: true,
};
