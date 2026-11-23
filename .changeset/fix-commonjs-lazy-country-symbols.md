---
"@salt-ds/countries": patch
---

Fixed `LazyCountrySymbol` rendering in CommonJS builds. Dynamically imported country symbols now expose the default export expected by React's lazy loader, while direct CommonJS imports continue to return the component itself.
