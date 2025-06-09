import {
  Dropdown,
  FormField,
  FormFieldLabel,
  Input,
  Option,
  StackLayout,
  Text,
} from "@salt-ds/core";
import "@salt-ds/countries/saltCountries.css";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { useState } from "react";

export default {
  title: "Patterns/International Phone Number",
} as Meta;

type Country = { name: string; code: string; countryCode: string };

const countryPhonePrefixes: Country[] = [
  { name: "United States", code: "+1", countryCode: "US" },
  { name: "Canada", code: "+1", countryCode: "CA" },
  { name: "United Kingdom", code: "+44", countryCode: "GB" },
  { name: "Germany", code: "+49", countryCode: "DE" },
  { name: "France", code: "+33", countryCode: "FR" },
  { name: "Australia", code: "+61", countryCode: "AU" },
  { name: "India", code: "+91", countryCode: "IN" },
  { name: "China", code: "+86", countryCode: "CN" },
  { name: "Japan", code: "+81", countryCode: "JP" },
  { name: "Brazil", code: "+55", countryCode: "BR" },
  { name: "Mexico", code: "+52", countryCode: "MX" },
  { name: "South Africa", code: "+27", countryCode: "ZA" },
  { name: "Russia", code: "+7", countryCode: "RU" },
  { name: "Italy", code: "+39", countryCode: "IT" },
  { name: "Spain", code: "+34", countryCode: "ES" },
  { name: "Netherlands", code: "+31", countryCode: "NL" },
  { name: "Sweden", code: "+46", countryCode: "SE" },
  { name: "Switzerland", code: "+41", countryCode: "CH" },
  { name: "Argentina", code: "+54", countryCode: "AR" },
  { name: "South Korea", code: "+82", countryCode: "KR" },
];

const CountryIcon = ({ code }: { code: string }) => (
  <div
    className={`saltCountry-${code}`}
    style={{
      height: "calc(var(--salt-size-base) - var(--salt-spacing-150))",
      width: "calc(var(--salt-size-base) - var(--salt-spacing-150))",
    }}
  />
);

const InternationalPhoneNumberTemplate: StoryFn<{
  direction?: "row" | "column";
}> = ({ direction }) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countryPhonePrefixes[0],
  );

  return (
    <StackLayout direction={direction}>
      <FormField>
        <FormFieldLabel>Country</FormFieldLabel>
        <Dropdown<Country>
          valueToString={(country) => `${country.name} (${country.code})`}
          startAdornment={<CountryIcon code={selectedCountry.countryCode} />}
          selected={[selectedCountry]}
          onSelectionChange={(_, value) => setSelectedCountry(value[0])}
        >
          {countryPhonePrefixes
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((country) => (
              <Option key={country.name} value={country}>
                <CountryIcon code={country.countryCode} /> {country.name} (
                {country.code})
              </Option>
            ))}
        </Dropdown>
      </FormField>
      <FormField>
        <FormFieldLabel>Phone number</FormFieldLabel>
        <Input startAdornment={<Text>{selectedCountry.code}</Text>} />
      </FormField>
    </StackLayout>
  );
};

export const Column = InternationalPhoneNumberTemplate.bind({});
Column.args = {
  direction: "column",
};

export const Row = InternationalPhoneNumberTemplate.bind({});
Row.args = {
  direction: "row",
};
