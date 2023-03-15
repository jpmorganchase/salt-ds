import { Meta, Story } from "@storybook/react";
import { countrySymbolMap } from "@salt-ds/countries";

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
          {Object.entries(countrySymbolMap).map(([code, Component]) => (
            <Component key={code} size={size} />
          ))}
        </div>
      ))}
    </>
  );
};

AllCountrySymbols.parameters = {
  chromatic: { disableSnapshot: false },
};
