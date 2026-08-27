# `@salt-ds/countries`

ISO 3166 country symbols for Salt applications, including standard and sharp
visual variants.

## Install

```sh
npm install @salt-ds/countries @salt-ds/core @salt-ds/theme
```

React, React DOM and the current Salt provider/theme setup are required. Styles
are injected at runtime; `saltCountries.css` and `saltSharpCountries.css` are
also available for applications that manage component CSS statically.

## Usage

```tsx
import { CountrySymbol } from "@salt-ds/countries";

export function Location() {
  return <CountrySymbol countryCode="GB" aria-label="United Kingdom" />;
}
```

Country symbols communicate location, not language or nationality. Verify the
meaning in your product context.

See the [Country symbol documentation](https://www.saltdesignsystem.com/salt/components/country-symbol).
