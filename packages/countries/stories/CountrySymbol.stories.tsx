import { Suspense, useState } from "react";
import {
  TT,
  MX,
  CountrySymbol,
  countryMetaMap,
  LazyCountrySymbol,
} from "@salt-ds/countries";
import { Meta, StoryFn } from "@storybook/react";
import { FlexLayout, StackLayout } from "@salt-ds/core";
import { FormField, Input } from "@salt-ds/lab";

export default {
  title: "Country Symbols/Country Symbol",
  component: CountrySymbol,
  argTypes: {
    size: {
      type: "number",
    },
  },
} as Meta<typeof CountrySymbol>;

export const SaltCountrySymbol: StoryFn<typeof CountrySymbol> = (args) => (
  <TT {...args} />
);

export const CountrySymbolMultipleSizes: StoryFn<typeof CountrySymbol> = () => (
  <StackLayout direction="row">
    <MX size={1} />
    <MX size={2} />
    <MX size={3} />
    <MX size={4} />
    <MX size={5} />
  </StackLayout>
);

export const AllCountrySymbolsWithSearch: StoryFn<typeof CountrySymbol> = (
  args
) => {
  const [inputText, setInputText] = useState("");

  return (
    <Suspense fallback="Loading...">
      <StackLayout separators>
        <FormField
          label={"Search country symbols"}
          style={{ marginBlock: "1rem", maxWidth: "300px" }}
        >
          <Input
            value={inputText}
            onChange={(_, value) => setInputText(value)}
          />
        </FormField>
        <FlexLayout wrap gap={3} style={{ paddingBlock: "1rem" }}>
          {Object.values(countryMetaMap)
            .filter(({ countryCode, countryName }) => {
              const searchText = inputText.toLowerCase();

              return (
                countryCode.toLowerCase().includes(searchText) ||
                countryName.toLowerCase().includes(searchText)
              );
            })
            .map(({ countryCode, countryName }) => {
              return (
                <StackLayout
                  key={countryCode}
                  style={{ width: "150px" }}
                  gap={1}
                  align="center"
                >
                  <LazyCountrySymbol
                    key={countryCode}
                    code={countryCode}
                    {...args}
                  />
                  <p style={{ margin: 0 }}>{countryCode}</p>
                  <p style={{ margin: 0, textAlign: "center" }}>
                    {countryName}
                  </p>
                </StackLayout>
              );
            })}
        </FlexLayout>
      </StackLayout>
    </Suspense>
  );
};

AllCountrySymbolsWithSearch.args = {
  size: 2,
};

AllCountrySymbolsWithSearch.parameters = {
  docs: {
    source: {
      code: "Disabled for this story, see https://github.com/storybookjs/storybook/issues/11554",
    },
  },
};
