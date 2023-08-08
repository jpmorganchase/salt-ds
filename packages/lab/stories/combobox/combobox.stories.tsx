import { ComponentProps, memo, useEffect, useState } from "react";
import {
  ComboBox,
  ComboBoxProps,
  escapeRegExp,
  FormField,
  Highlighter,
  ListItem,
  ListItemProps,
  ListItemType,
} from "@salt-ds/lab";
import { ComponentMeta, Story } from "@storybook/react";
import {
  LargeCity,
  largestCities,
  shortColorData,
  statesData,
} from "../assets/exampleData";

export default {
  title: "Lab/Combo Box",
  component: ComboBox,
} as ComponentMeta<typeof ComboBox>;

const MemoizedCityItem = memo(function MemoizedItem({
  item,
  itemTextHighlightPattern,
  ...restProps
}: ListItemProps<LargeCity>) {
  return (
    <ListItem {...restProps}>
      {item?.countryCode && (
        <img
          src={`https://flagcdn.com/${item.countryCode.toLowerCase()}.svg`}
          width={20}
          alt={`${item.countryCode} flag`}
        />
      )}
      <span style={{ marginLeft: 10 }}>
        <Highlighter
          matchPattern={itemTextHighlightPattern}
          text={item?.name}
        />
      </span>
    </ListItem>
  );
});

const CityListItem: ListItemType<LargeCity> = (props) => {
  return <MemoizedCityItem {...props} />;
};

const cityItemToString = ({ name }: LargeCity) => name;

const ComboBoxTemplate: Story<ComboBoxProps> = (args) => {
  return <ComboBox {...args} />;
};

const FormFieldComboBoxTemplate: Story<
  ComponentProps<typeof ComboBox> &
    Pick<
      ComponentProps<typeof FormField>,
      "labelPlacement" | "label" | "required" | "LabelProps" | "helperText"
    >
> = (args) => {
  const {
    source,
    helperText,
    width,
    labelPlacement,
    label,
    required,
    LabelProps,
    ...rest
  } = args;
  return (
    <FormField
      label={label}
      labelPlacement={labelPlacement}
      helperText={helperText}
      required={required}
      style={{ width }}
      LabelProps={LabelProps}
    >
      <ComboBox source={source} width={width} {...rest} />
    </FormField>
  );
};

export const Default = ComboBoxTemplate.bind({});
Default.args = {
  // onSelectionChange: (e, value) =>
  //   console.log(`onSelection change called ${value}`),
  source: statesData,
  width: 292,
};

export const WithCustomizedFilter = ComboBoxTemplate.bind({});
const getFilterRegex: (text: string) => RegExp = (value) =>
  new RegExp(`\\b(${escapeRegExp(value)})`, "gi");
WithCustomizedFilter.args = {
  ...Default.args,
  getFilterRegex,
};

export const ItemRenderer: Story<ComboBoxProps<LargeCity>> = (args) => {
  return (
    <FormField label="Select a large city" style={{ maxWidth: 292 }}>
      <ComboBox {...args} />
    </FormField>
  );
};

ItemRenderer.args = {
  ListItem: CityListItem,
  ListProps: {
    displayedItemCount: 5,
  },
  // TODO how do we specify the Item type is LargeCity ?
  itemToString: cityItemToString as (item: unknown) => string,
  source: largestCities,
};

export const WithFormField = FormFieldComboBoxTemplate.bind({});
WithFormField.args = {
  label: "Select",
  helperText: "Select a color",
  width: 292,
  source: shortColorData,
  labelPlacement: "top",
};

export const WithFreeText = FormFieldComboBoxTemplate.bind({});
WithFreeText.args = {
  ...WithFormField.args,
  label: "Enter a value",
  allowFreeText: true,
};

export const WithInitialSelection = FormFieldComboBoxTemplate.bind({});
WithInitialSelection.args = {
  ...WithFormField.args,
  defaultValue: shortColorData[3],
};

export const TestSourceDelay = () => {
  const [source, setSource] = useState<string[]>([]);
  useEffect(() => {
    const timeout = setTimeout(() => setSource(["a", "bb", "cc", "abc"]), 5000);
    return () => void clearTimeout(timeout);
  }, []);
  return (
    <FormField label="Select something" style={{ maxWidth: 292 }}>
      <ComboBox source={source} />
    </FormField>
  );
};
