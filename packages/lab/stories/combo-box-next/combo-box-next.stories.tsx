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
import { MouseEvent, Suspense, SyntheticEvent, useState } from "react";
import { FlexItem, FlexLayout, FlowLayout } from "@salt-ds/core";

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
      <ComboBoxNext
        onInputChange={handleChange}
        onSelect={handleSelect}
        {...args}
      />
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

const InputPropsTemplate: Story<ComboBoxNextProps<any>> = (args) => {
  const handleChange = (event: SyntheticEvent, data: { value: string }) => {
    console.log("input value changed", data);
  };

  const handleSelect = (event: SyntheticEvent<HTMLInputElement>) => {
    console.log("selected item", event.currentTarget.value);
  };
  return (
    <FlowLayout style={{ width: "266px" }}>
      <FlexItem>
        <p>Variant</p>
        <ComboBoxNext
          onInputChange={handleChange}
          onSelect={handleSelect}
          variant={"secondary"}
          {...args}
        />
      </FlexItem>
      <FlexItem>
        <p>Read only</p>
        <ComboBoxNext
          onInputChange={handleChange}
          onSelect={handleSelect}
          readOnly
          {...args}
        />
      </FlexItem>
      <FlexItem>
        <p>With placeholder</p>
        <ComboBoxNext
          onInputChange={handleChange}
          onSelect={handleSelect}
          placeholder={"Select a color"}
          {...args}
        />
      </FlexItem>
    </FlowLayout>
  );
};
export const Secondary = ComboBoxTemplate.bind({});
Secondary.args = {
  source: shortColorData,
  variant: "secondary",
};

export const WithInputProps = InputPropsTemplate.bind({});
WithInputProps.args = {
  source: shortColorData,
};

export const Disabled = ComboBoxTemplate.bind({});
Disabled.args = {
  source: shortColorData,
  disabled: true,
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
    <FlexLayout style={{ width: "200px" }} direction={"column"}>
      <ComboBoxNext
        value={inputValue}
        onInputChange={handleChange}
        onSelect={handleSelect}
        {...args}
      />
    </FlexLayout>
  );
};
Controlled.args = {
  source: shortColorData,
};
