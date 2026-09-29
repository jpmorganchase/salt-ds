---
"@salt-ds/countries": patch
---

Renamed `CountrySymbol`'s private CSS variables from `--country-symbol-*` to `--countrySymbol-*`, to match Salt's naming for component CSS variables. Overrides of these private variables need to be updated; `--saltCountrySymbol-size-multiplier` is unchanged.
