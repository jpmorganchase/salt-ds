import { FlexLayout, StackLayout } from "@salt-ds/core";
import type { CountryCode } from "@salt-ds/countries";
import {
  CountrySymbol,
  countryMetaMap,
  LazyCountrySymbol,
  MX,
  MX_Sharp,
  TT,
  TT_Sharp,
} from "@salt-ds/countries";
import { FormField, Input } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { Suspense, useState } from "react";

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

export const SaltCountrySymbolSharp: StoryFn<typeof CountrySymbol> = (args) => (
  <TT_Sharp {...args} />
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

export const CountrySymbolSharpMultipleSizes: StoryFn<
  typeof CountrySymbol
> = () => (
  <StackLayout direction="row">
    <MX_Sharp size={1} />
    <MX_Sharp size={2} />
    <MX_Sharp size={3} />
    <MX_Sharp size={4} />
    <MX_Sharp size={5} />
  </StackLayout>
);

export const AllCountrySymbolsWithSearch: StoryFn<typeof CountrySymbol> = (
  args,
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
          {Object.keys(countryMetaMap)
            .map(
              (componentCode) => countryMetaMap[componentCode as CountryCode],
            )
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
                  <StackLayout direction="row">
                    <LazyCountrySymbol
                      key={countryCode}
                      code={countryCode}
                      {...args}
                    />
                    <LazyCountrySymbol
                      key={`${countryCode}sharp`}
                      code={`${countryCode}_Sharp` as CountryCode}
                      {...args}
                    />
                  </StackLayout>
                  <p style={{ margin: 0 }}>
                    {countryCode} / {countryCode}_Sharp
                  </p>
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
