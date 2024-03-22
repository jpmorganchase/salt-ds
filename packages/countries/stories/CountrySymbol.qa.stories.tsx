import { AD, GB, MX, US } from "@salt-ds/countries";
import { Meta, StoryFn } from "@storybook/react";
import { QAContainer, QAContainerNoStyleInjection } from "docs/components";

import "@salt-ds/countries/saltCountries.css";

export default {
  title: "Country Symbols/Country Symbol/Country Symbol QA",
} as Meta;

export const CountrySymbolSizes: StoryFn = () => {
  return (
    <QAContainer height={500} width={1500} cols={4}>
      <AD size={1} />
      <GB size={2} />
      <MX size={3} />
      <US size={4} />
    </QAContainer>
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
    <QAContainer height={500} width={1000} cols={4}>
      <div className="saltCountry-AD" />
      <div className="saltCountry-MX" />
      <div className="saltCountry-GB-SCT" />
      <div className="saltCountry-US" />
    </QAContainer>
  );
};

CssBackground.parameters = {
  chromatic: { disableSnapshot: false },
};
