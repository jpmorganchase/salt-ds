import { FlexLayout } from "@salt-ds/core";
import {
  countryMetaMap,
  LazyCountrySymbol as LazyCountrySymbolComponent,
} from "@salt-ds/countries";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { Suspense } from "react";

const countryCodes = Object.keys(
  countryMetaMap,
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
} as Meta<typeof LazyCountrySymbolComponent>;

export const LazyCountrySymbol: StoryFn<typeof LazyCountrySymbolComponent> = (
  args,
) => {
  return (
    <Suspense fallback={"Loading..."}>
      <FlexLayout>
        <LazyCountrySymbolComponent {...args} />
        <LazyCountrySymbolComponent sharp {...args} />
      </FlexLayout>
    </Suspense>
  );
};

LazyCountrySymbol.args = {
  size: 2,
  code: countryCodes[0],
};
