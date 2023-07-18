import {ComboBoxNext, ComboBoxNextProps} from "@salt-ds/lab";
import {ComponentMeta, Story} from "@storybook/react";
import {largestCities, shortColorData} from "../assets/exampleData";
import {CountrySymbol} from "@salt-ds/countries";

export default {
  title: "Lab/Combo Box Next",
  component: ComboBoxNext,
} as ComponentMeta<typeof ComboBoxNext>;

const customStringToItem = () => {

}

const ComboBoxTemplate: Story<ComboBoxNextProps> = (args) => {
  const handleChange = (event) => {
    console.log('input value changed', event.target.value);
  };

  const handleSelect = (event) => {
    console.log('selected item', event.target.value);
  };
  return <ComboBoxNext onChange={handleChange}
                       onSelect={handleSelect}
                       {...args}
  />;
};

export const Default = ComboBoxTemplate.bind({});
Default.args = {
  source: shortColorData
};

export const CustomRenderer = ComboBoxTemplate.bind({});
CustomRenderer.args = {
  source: largestCities,
  stringToItem: customStringToItem
};

export const Empty = ComboBoxTemplate.bind({});
Empty.args = {
  source: undefined
};
