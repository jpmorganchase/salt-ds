import { ElementType, useState } from "react";
import {
  TrinidadAndTobago,
  GreatBritain,
  Mexico,
  CountrySymbol,
  CountrySymbolProps,
  countryMeta,
  countrySymbolMap,
  LazyCountrySymbol,
  countryCodes,
  CountryCode,
} from "@salt-ds/countries";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { FlexLayout, StackLayout } from "@salt-ds/core";
import { FormField, Input } from "@salt-ds/lab";

export default {
  title: "CountrySymbols/CountrySymbol",
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

const sizes = [1, 2, 3] as const;

const CountrySymbolGrid = ({
  CountrySymbol: CountrySymbolComponent,
}: {
  CountrySymbol: ElementType<CountrySymbolProps>;
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${sizes.length}, 100px)`,

        gridGap: 50,
      }}
    >
      {sizes.map((size) => (
        <CountrySymbolComponent key={size} size={size} />
      ))}
    </div>
  );
};

export const SaltCountrySymbol: ComponentStory<typeof CountrySymbol> = (
  props
) => <TrinidadAndTobago {...props} />;
export const CountrySymbolMultipleSizes: ComponentStory<
  typeof CountrySymbol
> = () => (
  <CountrySymbolGrid
    CountrySymbol={Mexico as ElementType<CountrySymbolProps>}
  />
);

export const SaltTypes: ComponentStory<typeof CountrySymbol> = () => (
  <FlexLayout wrap gap={2}>
    <GreatBritain size={4} />
    <Mexico size={4} />
  </FlexLayout>
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

export const Lazy: ComponentStory<typeof LazyCountrySymbol> = () => {
  const [countryCode, setCountryCode] = useState<CountryCode>(countryCodes[0]);

  return (
    <StackLayout>
      <label htmlFor="code">
        Change country code
        <select
          id="code"
          onChange={(e) => {
            setCountryCode(e.target.value as CountryCode);
          }}
        >
          {countryCodes.map((code) => (
            <option value={code}>{code}</option>
          ))}
        </select>
      </label>
      <LazyCountrySymbol code={countryCode} />
    </StackLayout>
  );
};

export const AllCountrySymbolsWithSearch: ComponentStory<
  typeof CountrySymbol
> = () => {
  const [inputText, setInputText] = useState("");

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}>
      <StackLayout separators>
        <FormField
          label={"search country symbols"}
          style={{ marginBlock: "1rem", maxWidth: "300px" }}
        >
          <Input
            value={inputText}
            onChange={(_, value) => setInputText(value)}
          />
        </FormField>
        <FlexLayout wrap gap={3} style={{ paddingBlock: "1rem" }}>
          {Object.entries(countryMeta)
            .filter(([code, { textName }]) =>
              new RegExp(inputText, "i").test(textName)
            )
            .map(([code, { textName }]) => {
              const Component = countrySymbolMap[code as CountryCode];

              return (
                <StackLayout style={{ width: "150px" }} gap={1} align="center">
                  <Component key={code} size={2} />
                  <p style={{ margin: 0 }}>{textName}</p>
                </StackLayout>
              );
            })}
        </FlexLayout>
      </StackLayout>
    </div>
  );
};
