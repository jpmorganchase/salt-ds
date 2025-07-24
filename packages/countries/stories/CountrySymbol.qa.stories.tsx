import { StackLayout } from "@salt-ds/core";
import { AD, countryMetaMap, GB, MX, US } from "@salt-ds/countries";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, QAContainerNoStyleInjection } from "docs/components";

import "@salt-ds/countries/saltCountries.css";
import "@salt-ds/countries/saltSharpCountries.css";

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

export const NoStyleInjection: StoryFn = () => {
  return (
    <QAContainerNoStyleInjection
      height={500}
      width={1500}
      cols={4}
      enableStyleInjection={false}
    >
      <AD size={1} />
      <GB size={2} />
      <MX size={3} />
      <US size={4} />
    </QAContainerNoStyleInjection>
  );
};

NoStyleInjection.parameters = {
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
        {Object.keys(countryMetaMap).map((countryName) => (
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
        {Object.keys(countryMetaMap).map((countryName) => (
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
