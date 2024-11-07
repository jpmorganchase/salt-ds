import {
  FlowLayout,
  FormField,
  FormFieldLabel,
  Input,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { LazyCountrySymbol, countryMetaMap } from "@salt-ds/countries";
import { Suspense, useState } from "react";

// Mostly the same as AllCountrySymbols site example, could iterate later
export const CountrySymbolPreview = () => {
  const [inputText, setInputText] = useState("");

  return (
    <Suspense fallback="Loading...">
      <StackLayout
        separators
        style={{ width: "100%", height: "100%", padding: 10 }}
      >
        <FormField>
          <FormFieldLabel>Search country symbols</FormFieldLabel>
          <Input
            value={inputText}
            inputProps={{
              onChange: (event) => {
                setInputText(event.target.value);
              },
            }}
          />
        </FormField>
        <div style={{ overflow: "auto", maxHeight: 600 }}>
          <FlowLayout gap={3}>
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
                    style={{ width: 140 }}
                    gap={1}
                    align="center"
                    key={countryCode}
                  >
                    <LazyCountrySymbol code={countryCode} size={1} />
                    <Text>{countryCode}</Text>
                    <Text style={{ textAlign: "center" }}>{countryName}</Text>
                  </StackLayout>
                );
              })}
          </FlowLayout>
        </div>
      </StackLayout>
    </Suspense>
  );
};
