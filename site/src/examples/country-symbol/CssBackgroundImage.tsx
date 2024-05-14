import "@salt-ds/countries/saltCountries.css";
import "@salt-ds/countries/saltSharpCountries.css";

const code = "AD" as const;

export const CssBackgroundImage = () => (
  <>
    <div className={`saltCountry-${code}`} />
    <div className={`saltCountrySharp-${code}`} />
  </>
);
