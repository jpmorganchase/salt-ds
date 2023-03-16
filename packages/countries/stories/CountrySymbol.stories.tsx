import { ElementType, ReactNode, useState } from "react";
import {
  TrinidadAndTobago,
  Mexico,
  CountrySymbol,
  CountrySymbolProps,
  countryMetaMap,
  countrySymbolMap,
  CountryCode,
} from "@salt-ds/countries";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { FlexLayout, StackLayout } from "@salt-ds/core";
import { FormField, Input } from "@salt-ds/lab";

export default {
  title: "Country Symbols/Country Symbol",
  component: CountrySymbol,
  argTypes: {
    code: {
      type: "string",
    },
    size: {
      type: "number",
    },
  },
} as ComponentMeta<typeof CountrySymbol>;

export const SaltCountrySymbol: ComponentStory<typeof CountrySymbol> = (
  props
) => <TrinidadAndTobago {...props} />;

export const CountrySymbolMultipleSizes: ComponentStory<
  typeof CountrySymbol
> = () => (
  <StackLayout direction="row">
    <Mexico size={1} />
    <Mexico size={2} />
    <Mexico size={3} />
    <Mexico size={4} />
    <Mexico size={5} />
  </StackLayout>
);

export const AllCountrySymbols: ComponentStory<typeof CountrySymbol> = () => {
  return (
    <FlexLayout wrap gap={1} style={{ paddingBlock: "1rem" }}>
      {Object.entries(countrySymbolMap).map(([code, Component]) => (
        <Component key={code} size={1} />
      ))}
    </FlexLayout>
  );
};

export const AllCountrySymbolsWithSearch: ComponentStory<
  typeof CountrySymbol
> = () => {
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
        {Object.entries(countryMetaMap)
          .filter(([code, { textName, componentName }]) => {
            const searchText = inputText.toLowerCase();

            return (
              code.toLowerCase().includes(searchText) ||
              textName.toLowerCase().includes(searchText) ||
              componentName.toLowerCase().includes(searchText)
            );
          })
          .map(([code, { textName, componentName }]) => {
            const Component = countrySymbolMap[code as CountryCode];

            return (
              <StackLayout style={{ width: "150px" }} gap={1} align="center">
                <Component key={code} size={2} />
                <p style={{ margin: 0 }}>{code}</p>
                <p style={{ margin: 0 }}>{componentName}</p>
              </StackLayout>
            );
          })}
      </FlexLayout>
    </StackLayout>
  );
};
