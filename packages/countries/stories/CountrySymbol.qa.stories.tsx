import { Meta, StoryFn } from "@storybook/react";
import { StackLayout } from "@salt-ds/core";
import { MX, countryMetaMap } from "@salt-ds/countries";
import "@salt-ds/countries/saltCountries.css";
import "@salt-ds/countries/saltSharpCountries.css";
import { QAContainer } from "docs/components";

export default {
  title: "Country Symbols/Country Symbol/Country Symbol QA",
} as Meta;

export const CountrySymbolSizes: StoryFn = () => {
  return (
    <StackLayout direction="row">
      <MX size={1} />
      <MX size={2} />
      <MX size={3} />
      <MX size={4} />
      <MX size={5} />
    </StackLayout>
  );
};

CountrySymbolSizes.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CssBackground: StoryFn = () => {
  return (
    <QAContainer
      width={1400}
      vertical
      transposeDensity
      itemWidthAuto
      itemPadding={12}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(20, auto)",
          gap: 8,
          padding: "12px 0",
        }}
      >
        {Object.keys(countryMetaMap)
          .filter((name) => !name.endsWith("_Sharp"))
          .map((countryName) => (
            <div key={countryName} className={`saltCountry-${countryName}`} />
          ))}
      </div>
    </QAContainer>
  );
};

CssBackground.parameters = {
  chromatic: { disableSnapshot: false },
};

export const SharpCountrySymbolCssBackground: StoryFn = () => {
  return (
    <QAContainer
      width={1400}
      vertical
      transposeDensity
      itemWidthAuto
      itemPadding={12}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(20, auto)",
          gap: 8,
          padding: "12px 0",
        }}
      >
        {Object.keys(countryMetaMap)
          .filter((name) => !name.endsWith("_Sharp"))
          .map((countryName) => (
            <div
              key={countryName}
              className={`saltCountrySharp-${countryName}`}
            />
          ))}
      </div>
    </QAContainer>
  );
};

SharpCountrySymbolCssBackground.parameters = {
  chromatic: { disableSnapshot: false },
};
