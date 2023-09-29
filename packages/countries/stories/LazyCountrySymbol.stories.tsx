import { Suspense } from "react";
import { Meta, StoryFn } from "@storybook/react";
import {
  countryMetaMap,
  LazyCountrySymbol as LazyCountrySymbolComponent,
} from "@salt-ds/countries";

const countryCodes = Object.keys(
  countryMetaMap
) as (keyof typeof countryMetaMap)[];

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
  parameters: {
    docs: {
      source: {
        code: "Disabled for this story, see https://github.com/storybookjs/storybook/issues/11554",
      },
    },
  },
} as Meta<typeof LazyCountrySymbolComponent>;

export const LazyCountrySymbol: StoryFn<typeof LazyCountrySymbolComponent> = (
  args
) => {
  return (
    <Suspense fallback={"Loading..."}>
      <LazyCountrySymbolComponent {...args} />
    </Suspense>
  );
};

LazyCountrySymbol.args = {
  size: 2,
  code: countryCodes[0],
};
