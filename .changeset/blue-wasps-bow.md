---
"@salt-ds/countries": minor
---

Added `saltCountries.css` with country SVG as background image.

```js
import "@salt-ds/countries/saltCountries.css";

const Example = () => {
  const countryCode = `AD`;
  return <div className={`saltCountry-${countryCode}`} />;
};
```
