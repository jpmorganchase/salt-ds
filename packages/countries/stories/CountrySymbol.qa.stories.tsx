import { Meta, StoryFn } from "@storybook/react";
import { StackLayout } from "@salt-ds/core";
import { MX } from "@salt-ds/countries";
import "@salt-ds/countries/saltCountries.css";

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
    <StackLayout direction="row">
      <div className="saltCountry-AD" />
      <div className="saltCountry-MX" />
      <div className="saltCountry-GB-SCT" />
    </StackLayout>
  );
};

CssBackground.parameters = {
  chromatic: { disableSnapshot: false },
};
