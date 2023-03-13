import { Meta, Story } from "@storybook/react";

import { allCountries } from "./countries.all";

export default {
  title: "CountrySymbols/CountrySymbol/QA",
} as Meta;

const sizes = [1, 2, 3] as const;

export const AllCountrySymbols: Story = () => {
  return (
    <>
      {sizes.map((size) => (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(15, auto)",
            gap: 8,
            padding: "12px 0",
          }}
        >
          {allCountries.map((CountrySymbolComponent, i) => (
            <CountrySymbolComponent key={i} size={size} />
          ))}
        </div>
      ))}
    </>
  );
};

AllCountrySymbols.parameters = {
  chromatic: { disableSnapshot: false },
};
