import {ComboBoxNext, ComboBoxProps, ListItemNext} from "@salt-ds/lab";
import {ComponentMeta, Story} from "@storybook/react";
import {largestCities} from "../assets/exampleData";
import {CountrySymbol} from "@salt-ds/countries";

export default {
  title: "Lab/Combo Box Next",
  component: ComboBoxNext,
} as ComponentMeta<typeof ComboBoxNext>;


const ComboBoxTemplate: Story<ComboBoxProps> = (args) => {
  return <ComboBoxNext>
    {largestCities.map((city, index) => {
        return (
          <ListItemNext
            key={index}
            value={city.name}
            // TODO: if using ids, this needs to be more unique
            id={city.name}
          >
            <CountrySymbol code={city.countryCode} size={1}/>
            {city.name}
          </ListItemNext>
        );
      })}
  </ComboBoxNext>;
};

export const Default = ComboBoxTemplate.bind({});
Default.args = {
};
