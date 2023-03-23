import { Suspense, useState } from "react";
import {
  TT,
  MX,
  CountrySymbol,
  countryMetaMap,
  LazyCountrySymbol,
} from "@salt-ds/countries";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { FlexLayout, StackLayout } from "@salt-ds/core";
import { FormField, Input } from "@salt-ds/lab";

const countryCodes = Object.keys(countryMetaMap);

export default {
  title: "Country Symbols/Country Symbol",
  component: CountrySymbol,
  argTypes: {
    size: {
      type: "number",
    },
  },
} as ComponentMeta<typeof CountrySymbol>;

export const SaltCountrySymbol: ComponentStory<typeof CountrySymbol> = (
  args
) => <TT {...args} />;

export const CountrySymbolMultipleSizes: ComponentStory<
  typeof CountrySymbol
> = () => (
  <StackLayout direction="row">
    <MX size={1} />
    <MX size={2} />
    <MX size={3} />
    <MX size={4} />
    <MX size={5} />
  </StackLayout>
);

export const AllCountrySymbols: ComponentStory<typeof CountrySymbol> = (
  args
) => {
  return (
    <Suspense>
      <FlexLayout wrap gap={1} style={{ paddingBlock: "1rem" }}>
        {Object.values(countryMetaMap).map(({ countryCode }) => (
          <LazyCountrySymbol key={countryCode} code={countryCode} {...args} />
        ))}
      </FlexLayout>
    </Suspense>
  );
};

AllCountrySymbols.args = {
  size: 1,
};

export const AllCountrySymbolsWithSearch: ComponentStory<
  typeof CountrySymbol
> = (args) => {
  const [inputText, setInputText] = useState("");

  return (
    <StackLayout separators>
      <FormField
        label={"search country symbols"}
        style={{ marginBlock: "1rem", maxWidth: "300px" }}
      >
        <Input value={inputText} onChange={(_, value) => setInputText(value)} />
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
              <StackLayout style={{ width: "150px" }} gap={1} align="center">
                <LazyCountrySymbol
                  key={countryCode}
                  code={countryCode}
                  {...args}
                />
                <p style={{ margin: 0 }}>{countryCode}</p>
                <p style={{ margin: 0 }}>{countryName}</p>
              </StackLayout>
            );
          })}
      </FlexLayout>
    </StackLayout>
  );
};

AllCountrySymbolsWithSearch.args = {
  size: 2,
};
