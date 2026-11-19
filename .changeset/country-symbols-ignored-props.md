---
"@salt-ds/countries": patch
---

Removed `sharp` and `children` from the props of the generated country symbol components, such as `AD` and `AD_Sharp`. `sharp` gave round symbols sharp sizing with round artwork, and `sharp={false}` broke the `_Sharp` symbols. `children` was replaced by the artwork. `LazyCountrySymbol` no longer accepts `children` either, which it passed to those components. `CountrySymbol` and `LazyCountrySymbol` still accept `sharp`.
