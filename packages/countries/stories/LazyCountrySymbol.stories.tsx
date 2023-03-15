import { ComponentMeta, ComponentStory } from "@storybook/react";
import {
  countryCodes,
  LazyCountrySymbol as LazyCountrySymbolComponent,
} from "@salt-ds/countries";

export default {
  title: "Country Symbols/Lazy Country Symbol",
  component: LazyCountrySymbolComponent,
  argTypes: {
    code: {
      options: countryCodes,
      control: { type: "select" },
    },
    size: {
      type: "number",
    },
  },
} as ComponentMeta<typeof LazyCountrySymbolComponent>;

export const LazyCountrySymbol: ComponentStory<
  typeof LazyCountrySymbolComponent
> = (args) => {
  return <LazyCountrySymbolComponent {...args} />;
};

LazyCountrySymbol.args = {
  size: 2,
  code: countryCodes[0],
};
