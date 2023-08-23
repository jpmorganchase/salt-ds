import { Suspense, useState } from "react";
import {
  countryMetaMap,
  LazyCountrySymbol,
} from "@salt-ds/countries";
import { FlexLayout, StackLayout } from "@salt-ds/core";
import { FormField, Input } from "@salt-ds/lab";

export const AllCountrySymbols = () => {
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
                <StackLayout style={{ width: "150px" }} gap={1} align="center">
                  <LazyCountrySymbol
                    key={countryCode}
                    code={countryCode}
                    size={2}
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
