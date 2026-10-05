import { Text } from "@salt-ds/core";
import { countryMetaMap, GB, LazyCountrySymbol } from "@salt-ds/countries";

export default function CountriesPage() {
  return (
    <>
      <Text>
        <GB aria-label="United Kingdom" /> Country symbols
      </Text>
      <Text>
        <LazyCountrySymbol code="FR" aria-hidden />{" "}
        {countryMetaMap.FR.countryName}
      </Text>
    </>
  );
}
