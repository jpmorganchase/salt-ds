import { Meta, StoryFn } from "@storybook/react";
import { countryMetaMap, LazyCountrySymbol } from "@salt-ds/countries";
import { type CountryCode } from "@salt-ds/countries";
import { Suspense } from "react";

export default {
  title: "Country Symbols/Lazy Country Symbol/Lazy Country Symbol QA",
} as Meta;

const sizes = [1, 2, 3] as const;

export const AllLazyCountrySymbols: StoryFn = () => {
  return (
    <Suspense fallback="Loading...">
      {sizes.map((size) => (
        <div
          key={size}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(15, auto)",
            gap: 8,
            padding: "12px 0",
          }}
        >
          {Object.keys(countryMetaMap)
            .filter((componentCode) => !componentCode.endsWith("_Sharp"))
            .map(
              (componentCode) => countryMetaMap[componentCode as CountryCode]
            )
            .map(({ countryCode }) => (
              <LazyCountrySymbol
                key={countryCode}
                code={countryCode}
                id={`${size}-${countryCode}`}
                size={size}
              />
            ))}
        </div>
      ))}
    </Suspense>
  );
};

AllLazyCountrySymbols.parameters = {
  chromatic: { disableSnapshot: false },
};
